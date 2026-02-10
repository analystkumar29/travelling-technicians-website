/**
 * Parse product data from MobileSentrix Magento pages
 */

const { detectCategory, detectQuality } = require('./config');
const { logger } = require('./logger');

/**
 * Parse price string to numeric value
 * Handles: "CA$966.96", "$49.99", "CA$49.99 CAD", "49.99"
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

/**
 * Extract model compatibility from product name
 * e.g., "MacBook Pro 14 A2779 (2023)" from title
 */
function extractModelCompatibility(name) {
  const patterns = [
    // "MacBook Pro 14" (A2442 / Late 2021) / Pro 14" (A2779 / Early 2023)"
    /MacBook\s+(?:Pro|Air)\s+[\d."]+\s*["""]?\s*\(?([A-Z]\d{4}(?:\s*\/\s*[A-Z]\d{4})*)\)?/i,
    // "For MacBook Pro 14" A2779 (2023)"
    /(?:MacBook\s+(?:Pro|Air)\s+[\d."]+["""]?\s*(?:\([^)]+\)\s*)?)/i,
    // Just model numbers "A2442 / A2779"
    /([A-Z]\d{4}(?:\s*\/\s*[A-Z]\d{4})*)/,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
}

/**
 * Detect device line from product name or page context
 */
function detectDeviceLine(name, pageContext) {
  const lower = name.toLowerCase();
  if (lower.includes('macbook pro')) return 'MacBook Pro';
  if (lower.includes('macbook air')) return 'MacBook Air';
  return pageContext || null;
}

/**
 * Detect quality from badge alt text (more reliable than product name)
 */
function detectQualityFromBadge(badgeAlt) {
  if (!badgeAlt) return null;
  const lower = badgeAlt.toLowerCase();
  if (lower.includes('genuine') || lower.includes('oem')) return 'oem';
  if (lower.includes('aftermarket plus') || lower.includes('premium')) return 'premium';
  if (lower.includes('aftermarket') || lower.includes('refurbished')) return 'standard';
  return null;
}

/**
 * Parse all product cards from a MobileSentrix listing page
 * Runs page.evaluate to extract from Magento's ul.product-listing > li.item structure
 */
async function parseProductCards(page, pageContext) {
  const products = await page.evaluate((pageCtx) => {
    const items = document.querySelectorAll('ul.product-listing > li.item');
    const results = [];

    items.forEach((li) => {
      try {
        // Product link + title
        const linkEl = li.querySelector('a.product-image');
        const url = linkEl ? linkEl.getAttribute('href') : '';
        const title = linkEl ? linkEl.getAttribute('title') : '';

        // Product name (h2.product-name inside the link)
        const nameEl = li.querySelector('h2.product-name');
        const name = nameEl ? nameEl.textContent.trim() : title || '';
        if (!name) return;

        // Price — prefer regular-price, fall back to any .price span
        const priceEl = li.querySelector('span.regular-price.price') || li.querySelector('.price-box .price');
        const priceText = priceEl ? priceEl.textContent.trim() : '';

        // Quality badge (img.product-badges alt text)
        const badgeEl = li.querySelector('img.product-badges');
        const badgeAlt = badgeEl ? badgeEl.getAttribute('alt') || badgeEl.getAttribute('title') || '' : '';

        // Product ID from price span id (e.g., "product-price-223768")
        const priceId = priceEl ? priceEl.getAttribute('id') || '' : '';
        const productId = priceId.replace('product-price-', '');

        // Stock: if there's a custom-add-to-cart section with qty input, it's in stock
        const addToCart = li.querySelector('.custom-add-to-cart');
        const outOfStockEl = li.querySelector('.out-of-stock, .sold-out');
        const isInStock = addToCart ? true : (outOfStockEl ? false : true);

        results.push({
          name,
          fullTitle: title,
          priceText,
          productId,
          badgeAlt,
          isInStock,
          url,
          pageContext: pageCtx,
        });
      } catch (err) {
        // Skip unparseable items
      }
    });

    return results;
  }, pageContext);

  // Post-process in Node context
  return products
    .filter((p) => p.name)
    .map((p) => {
      const badgeQuality = detectQualityFromBadge(p.badgeAlt);
      return {
        name: p.name,
        sku: p.productId ? `MSX-${p.productId}` : generateSkuFromName(p.name),
        brand: 'Apple',
        device_line: detectDeviceLine(p.name, p.pageContext),
        model_compatibility: extractModelCompatibility(p.fullTitle || p.name),
        category: detectCategory(p.name),
        quality_tier: badgeQuality || detectQuality(p.name),
        wholesale_price: parsePrice(p.priceText),
        is_in_stock: p.isInStock,
        warranty_info: p.badgeAlt || null,
        source_url: p.url,
      };
    });
}

/**
 * Generate a fallback SKU from product name when no product ID is found
 */
function generateSkuFromName(name) {
  return (
    'MSX-' +
    name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toUpperCase()
      .slice(0, 40)
  );
}

module.exports = {
  parseProductCards,
  parsePrice,
  extractModelCompatibility,
  detectDeviceLine,
  detectQualityFromBadge,
  generateSkuFromName,
};
