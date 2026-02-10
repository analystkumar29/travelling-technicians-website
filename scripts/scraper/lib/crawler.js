/**
 * Navigate MobileSentrix category pages and extract product data
 * MobileSentrix is Magento-based with server-rendered product listings.
 */

const { CATEGORY_URLS, DEVICE_LINE_MAP, SUB_MODEL_SLUGS, DELAYS, MAX_RETRIES, BASE_URL } = require('./config');
const { parseProductCards } = require('./parser');
const { logger } = require('./logger');

/**
 * Wait with a delay (respecting rate limits)
 */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry(fn, label, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) {
        logger.error(`${label} failed after ${maxRetries} attempts: ${err.message}`);
        throw err;
      }
      const backoff = DELAYS.retryBackoff[attempt - 1] || 10000;
      logger.warn(`${label} attempt ${attempt} failed, retrying in ${backoff / 1000}s...`);
      await delay(backoff);
    }
  }
}

/**
 * Extract sub-model page links from a category page.
 * Works for all brands — extracts the category slug from the URL
 * and finds links one level deeper.
 */
async function getSubModelLinks(page, categoryUrl, lineKey) {
  logger.info(`Fetching sub-model links from: ${categoryUrl}`);

  await withRetry(async () => {
    await page.goto(categoryUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);
  }, `Navigate to ${categoryUrl}`);

  // Extract the category path segments to determine depth
  // e.g. /replacement-parts/apple/macbook-pro → 3 segments
  // e.g. /replacement-parts/google-pixel/pixel → 3 segments
  const categoryPath = new URL(categoryUrl).pathname;
  const categorySegments = categoryPath.split('/').filter(Boolean);
  const categoryDepth = categorySegments.length;
  const lastSegment = categorySegments[categoryDepth - 1];

  const links = await page.evaluate(
    ({ baseUrl, catPath, catDepth, slug }) => {
      const results = new Set();
      // Find all links that extend the category path by one more segment
      document.querySelectorAll(`a[href*="${slug}"]`).forEach((a) => {
        const href = a.getAttribute('href') || '';
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
        try {
          const pathPart = new URL(fullUrl).pathname;
          const segments = pathPart.split('/').filter(Boolean);
          // Sub-model pages are exactly one level deeper than the category
          if (segments.length === catDepth + 1 && pathPart.startsWith(catPath)) {
            results.add(fullUrl);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      });
      return [...results];
    },
    { baseUrl: BASE_URL, catPath: categoryPath, catDepth: categoryDepth, slug: lastSegment }
  );

  logger.info(`Found ${links.length} sub-model pages`);
  return links;
}

/**
 * Wait for products to load on a page
 * MobileSentrix uses server-rendered Magento product grids
 */
async function waitForProducts(page) {
  try {
    await page.waitForSelector('ul.product-listing > li.item', {
      timeout: 8000,
    });
    return true;
  } catch {
    // Check if this is a "no products" page
    const hasNoProducts = await page.evaluate(() => {
      const note = document.querySelector('.note-msg, .category-empty, .empty');
      return !!note;
    });
    if (hasNoProducts) {
      logger.info('  Page has no products (empty category)');
    } else {
      logger.warn('  No product cards found on page');
    }
    return false;
  }
}

/**
 * Handle pagination on a product listing page
 */
async function scrapeAllPagesOfListing(page, pageUrl, pageContext) {
  let allProducts = [];
  let currentUrl = pageUrl;
  let pageNum = 1;

  while (currentUrl) {
    if (pageNum > 1) {
      await withRetry(async () => {
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
      }, `Navigate to page ${pageNum}`);
      await delay(DELAYS.betweenPages);
    }

    const hasProducts = await waitForProducts(page);
    if (!hasProducts) break;

    const products = await parseProductCards(page, pageContext);
    if (pageNum > 1 || products.length > 0) {
      logger.info(`  Page ${pageNum}: ${products.length} products`);
    }
    allProducts = allProducts.concat(products);

    // Check for next page (Magento pagination)
    const nextUrl = await page.evaluate(() => {
      const nextLink = document.querySelector('.pages li.next a, a.next.i-next');
      return nextLink ? nextLink.getAttribute('href') : null;
    });

    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl.startsWith('http')
        ? nextUrl
        : `${window.location.origin}${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
      pageNum++;
      await delay(DELAYS.betweenPages);
    } else {
      currentUrl = null;
    }
  }

  return allProducts;
}

/**
 * Scrape a single sub-model page
 */
async function scrapeSubModelPage(page, url, deviceLine) {
  await withRetry(async () => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  }, `Navigate to ${url}`);

  await delay(DELAYS.betweenPages);

  const products = await scrapeAllPagesOfListing(page, url, deviceLine);
  return products;
}

/**
 * Scrape all products for a device line (MacBook Pro, Air, iPhone, Galaxy, Pixel)
 */
async function scrapeDeviceLine(page, lineKey) {
  const categoryUrl = CATEGORY_URLS[lineKey];
  const lineInfo = DEVICE_LINE_MAP[lineKey];
  const deviceLine = lineInfo ? lineInfo.line : lineKey;

  logger.section(`Scraping ${deviceLine}`);

  // For phone categories, use hardcoded sub-model slugs (not discoverable from page)
  // For MacBook categories (pro/air), use dynamic discovery from the category page
  const hardcodedSlugs = SUB_MODEL_SLUGS[lineKey];
  let subModelLinks;

  if (hardcodedSlugs && hardcodedSlugs.length > 0) {
    subModelLinks = hardcodedSlugs.map((slug) => `${categoryUrl}/${slug}`);
    logger.info(`Using ${subModelLinks.length} known sub-model pages for ${deviceLine}`);
  } else {
    subModelLinks = await getSubModelLinks(page, categoryUrl, lineKey);
  }

  if (subModelLinks.length === 0) {
    logger.warn(`No sub-model pages found for ${deviceLine}. Trying category page directly...`);
    return await scrapeAllPagesOfListing(page, categoryUrl, deviceLine);
  }

  let allProducts = [];
  let skipped = 0;
  for (let i = 0; i < subModelLinks.length; i++) {
    const link = subModelLinks[i];
    logger.progress(i + 1, subModelLinks.length, deviceLine);

    try {
      const products = await scrapeSubModelPage(page, link, deviceLine);
      if (products.length > 0) {
        logger.success(`  ${products.length} products from ${link.split('/').pop()}`);
      } else {
        skipped++;
      }
      allProducts = allProducts.concat(products);
    } catch (err) {
      logger.error(`Failed to scrape ${link}: ${err.message}`);
      skipped++;
    }

    if (i < subModelLinks.length - 1) {
      await delay(DELAYS.betweenPages);
    }
  }

  if (skipped > 0) {
    logger.info(`Skipped ${skipped} empty/404 sub-model pages`);
  }

  return allProducts;
}

/**
 * Main crawl function — scrape all specified categories
 */
async function crawlAll(page, categories) {
  let allProducts = [];

  for (const cat of categories) {
    if (!CATEGORY_URLS[cat]) {
      logger.warn(`Unknown category: ${cat}`);
      continue;
    }
    const products = await scrapeDeviceLine(page, cat);
    allProducts = allProducts.concat(products);
  }

  // Deduplicate by SKU (keep the first occurrence)
  const seen = new Set();
  const unique = [];
  for (const p of allProducts) {
    if (!seen.has(p.sku)) {
      seen.add(p.sku);
      unique.push(p);
    }
  }

  logger.info(`Total unique products: ${unique.length} (from ${allProducts.length} total with dupes)`);
  return unique;
}

module.exports = { crawlAll, scrapeDeviceLine, scrapeSubModelPage, getSubModelLinks };
