/**
 * Navigate MobileSentrix category pages and extract product data
 */

const { CATEGORY_URLS, DELAYS, MAX_RETRIES, SELECTORS, BASE_URL } = require('./config');
const { parseProductCards, parseProductDetail } = require('./parser');
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
 * Extract sub-model page links from a category page
 * e.g., /collections/macbook-pro-16-a2991-2023
 */
async function getSubModelLinks(page, categoryUrl) {
  logger.info(`Fetching sub-model links from: ${categoryUrl}`);

  await withRetry(async () => {
    await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(2000); // Wait for JS rendering
  }, `Navigate to ${categoryUrl}`);

  // Try multiple selector strategies to find sub-model/sub-category links
  const links = await page.evaluate(
    ({ baseUrl, catUrl }) => {
      const results = new Set();

      // Strategy 1: Look for collection/category links in the page
      const allLinks = document.querySelectorAll('a[href]');
      for (const a of allLinks) {
        const href = a.getAttribute('href') || '';
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;

        // Match sub-model collection links
        if (
          (href.includes('/macbook-pro') || href.includes('/macbook-air')) &&
          href !== catUrl.replace(baseUrl, '') &&
          !href.includes('?') &&
          !href.includes('#') &&
          href.split('/').length > catUrl.replace(baseUrl, '').split('/').length
        ) {
          results.add(fullUrl);
        }
      }

      // Strategy 2: Look for collection grid items
      const gridLinks = document.querySelectorAll(
        '.collection-list a, .sub-categories a, .subcategories a, .category-grid a, .collection-grid-item a'
      );
      for (const a of gridLinks) {
        const href = a.getAttribute('href') || '';
        if (href && !href.includes('#')) {
          const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
          results.add(fullUrl);
        }
      }

      return [...results];
    },
    { baseUrl: BASE_URL, catUrl: categoryUrl }
  );

  logger.info(`Found ${links.length} sub-model pages`);
  return links;
}

/**
 * Wait for products to load on a page (Searchanise or native)
 */
async function waitForProducts(page) {
  try {
    // Try Searchanise widget first
    await page.waitForSelector('.snize-product, .product-card, .product-item, .grid-product, .boost-pfs-filter-product-item', {
      timeout: DELAYS.widgetLoad,
    });
    return true;
  } catch {
    logger.warn('No product cards found on page (Searchanise may not have loaded)');
    return false;
  }
}

/**
 * Handle pagination on a product listing page
 * Returns all product URLs or cards across pages
 */
async function scrapeAllPagesOfListing(page, pageUrl, pageContext) {
  let allProducts = [];
  let currentUrl = pageUrl;
  let pageNum = 1;

  while (currentUrl) {
    if (pageNum > 1) {
      await withRetry(async () => {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }, `Navigate to page ${pageNum}`);
      await delay(DELAYS.betweenPages);
    }

    const hasProducts = await waitForProducts(page);
    if (!hasProducts) break;

    const products = await parseProductCards(page, pageContext);
    logger.info(`  Page ${pageNum}: found ${products.length} products`);
    allProducts = allProducts.concat(products);

    // Check for next page
    const nextUrl = await page.evaluate(() => {
      const nextLink =
        document.querySelector('.pagination .next a, a.next, a[rel="next"], .pagination__next a') ||
        document.querySelector('link[rel="next"]');
      return nextLink ? nextLink.getAttribute('href') : null;
    });

    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl.startsWith('http') ? nextUrl : `${BASE_URL}${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
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
  logger.info(`Scraping: ${url}`);

  await withRetry(async () => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }, `Navigate to ${url}`);

  await delay(DELAYS.betweenPages);

  const products = await scrapeAllPagesOfListing(page, url, deviceLine);
  logger.success(`  Extracted ${products.length} products from ${url}`);
  return products;
}

/**
 * Scrape all products for a device line (MacBook Pro or Air)
 */
async function scrapeDeviceLine(page, lineKey) {
  const categoryUrl = CATEGORY_URLS[lineKey];
  const deviceLine = lineKey === 'pro' ? 'MacBook Pro' : 'MacBook Air';

  logger.section(`Scraping ${deviceLine}`);

  // Get sub-model page links
  const subModelLinks = await getSubModelLinks(page, categoryUrl);

  if (subModelLinks.length === 0) {
    logger.warn(`No sub-model pages found for ${deviceLine}. Trying to scrape category page directly...`);
    return await scrapeAllPagesOfListing(page, categoryUrl, deviceLine);
  }

  let allProducts = [];
  for (let i = 0; i < subModelLinks.length; i++) {
    const link = subModelLinks[i];
    logger.progress(i + 1, subModelLinks.length, deviceLine);

    try {
      const products = await scrapeSubModelPage(page, link, deviceLine);
      allProducts = allProducts.concat(products);
    } catch (err) {
      logger.error(`Failed to scrape ${link}: ${err.message}`);
    }

    if (i < subModelLinks.length - 1) {
      await delay(DELAYS.betweenPages);
    }
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

  logger.info(`Total unique products: ${unique.length} (from ${allProducts.length} total)`);
  return unique;
}

module.exports = { crawlAll, scrapeDeviceLine, scrapeSubModelPage, getSubModelLinks };
