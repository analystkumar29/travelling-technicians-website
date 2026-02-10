/**
 * Parse product data from MobileSentrix pages
 */

const { detectCategory, detectQuality } = require('./config');
const { logger } = require('./logger');

/**
 * Parse price string to numeric value
 * Handles: "$49.99", "CA$49.99", "$49.99 CAD", "49.99"
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

/**
 * Detect stock status from text or class names
 */
function parseStockStatus(text, classNames) {
  if (!text && !classNames) return false;
  const combined = `${text || ''} ${classNames || ''}`.toLowerCase();
  if (combined.includes('sold out') || combined.includes('out of stock') || combined.includes('out-of-stock')) {
    return false;
  }
  if (combined.includes('in stock') || combined.includes('in-stock') || combined.includes('available')) {
    return true;
  }
  return false;
}

/**
 * Extract model compatibility from product name
 * e.g., "MacBook Pro 16 A2991 (2023)" from "LCD Screen for MacBook Pro 16 A2991 (2023)"
 */
function extractModelCompatibility(name) {
  // Try to match common patterns
  const patterns = [
    // "for MacBook Pro 16 A2991 (2023)"
    /for\s+(MacBook\s+(?:Pro|Air)\s+[\d."]+(?:\s+[A-Z]\d{4})?(?:\s*\([^)]+\))?)/i,
    // "MacBook Pro 16" A2991 / A2992 (2023)"
    /(?:MacBook\s+(?:Pro|Air)\s+[\d."]+(?:\s+[A-Z]\d{4}(?:\s*\/\s*[A-Z]\d{4})*)?(?:\s*\([^)]+\))?)/i,
    // Just model number pattern "A2991"
    /([A-Z]\d{4}(?:\s*\/\s*[A-Z]\d{4})*)/,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return match[1] || match[0];
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
  // Fall back to page context
  return pageContext || null;
}

/**
 * Parse a single product card element in the browser context
 * Returns the extracted data via page.evaluate
 */
async function parseProductCards(page, pageContext) {
  const products = await page.evaluate(
    ({ pageCtx }) => {
      const cards = document.querySelectorAll(
        '.snize-product, .product-card, .product-item, .grid-product, .boost-pfs-filter-product-item'
      );
      const results = [];

      cards.forEach((card) => {
        try {
          // Product name
          const nameEl =
            card.querySelector('.snize-title, .product-title, .product-card__title, .product-item__title') ||
            card.querySelector('h3 a, h2 a, .product-card__name a, a.product-link');
          const name = nameEl ? nameEl.textContent.trim() : '';
          if (!name) return;

          // Price
          const priceEl = card.querySelector(
            '.snize-price, .product-price, .price, .product-card__price, .money'
          );
          const priceText = priceEl ? priceEl.textContent.trim() : '';

          // SKU
          const skuEl = card.querySelector('.snize-sku, .product-sku, [data-sku]');
          let sku = skuEl ? (skuEl.getAttribute('data-sku') || skuEl.textContent.trim()) : '';
          // Clean SKU prefix
          sku = sku.replace(/^SKU:\s*/i, '').trim();

          // Stock
          const stockEl = card.querySelector(
            '.snize-in-stock, .product-availability, .in-stock, .out-of-stock, .sold-out'
          );
          const stockText = stockEl ? stockEl.textContent.trim() : '';
          const stockClass = stockEl ? stockEl.className : '';

          // Product URL
          const linkEl =
            card.querySelector('a.snize-view-link, a.product-link') ||
            card.querySelector('h3 a, h2 a, .product-card__name a') ||
            card.querySelector('a');
          let url = linkEl ? linkEl.getAttribute('href') : '';
          if (url && !url.startsWith('http')) {
            url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
          }

          results.push({
            name,
            priceText,
            sku,
            stockText,
            stockClass,
            url,
            pageContext: pageCtx,
          });
        } catch (err) {
          // Skip unparseable cards
        }
      });

      return results;
    },
    { pageCtx: pageContext }
  );

  // Post-process in Node context
  return products
    .filter((p) => p.name)
    .map((p) => ({
      name: p.name,
      sku: p.sku || generateSkuFromName(p.name),
      brand: 'Apple',
      device_line: detectDeviceLine(p.name, p.pageContext),
      model_compatibility: extractModelCompatibility(p.name),
      category: detectCategory(p.name),
      quality_tier: detectQuality(p.name),
      wholesale_price: parsePrice(p.priceText),
      is_in_stock: parseStockStatus(p.stockText, p.stockClass),
      source_url: p.url,
    }));
}

/**
 * Parse product detail page for additional info
 */
async function parseProductDetail(page) {
  return page.evaluate(() => {
    const title =
      document.querySelector('.product-single__title, h1.product__title, h1')?.textContent?.trim() || '';
    const priceEl = document.querySelector('.product__price, .product-single__price, .price--main, .price');
    const price = priceEl ? priceEl.textContent.trim() : '';
    const skuEl = document.querySelector('.product-single__sku, .product__sku, .sku');
    const sku = skuEl ? skuEl.textContent.replace(/^SKU:\s*/i, '').trim() : '';
    const stockEl = document.querySelector('.product-form__inventory, .product-single__availability');
    const stock = stockEl ? stockEl.textContent.trim() : '';
    const descEl = document.querySelector(
      '.product-single__description, .product__description, .product-description'
    );
    const description = descEl ? descEl.textContent.trim() : '';

    // Look for warranty info in description
    let warranty = '';
    const warrantyMatch = description.match(/warranty[:\s]+([^\n.]+)/i);
    if (warrantyMatch) warranty = warrantyMatch[1].trim();

    return { title, price, sku, stock, description, warranty };
  });
}

/**
 * Generate a fallback SKU from product name when no SKU is found
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
  parseProductDetail,
  parsePrice,
  parseStockStatus,
  extractModelCompatibility,
  detectDeviceLine,
  generateSkuFromName,
};
