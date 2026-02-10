/**
 * Scraper configuration: URLs, selectors, keyword maps, delays
 */

const BASE_URL = 'https://www.mobilesentrix.ca';

const CATEGORY_URLS = {
  pro: `${BASE_URL}/replacement-parts/apple/macbook-pro`,
  air: `${BASE_URL}/replacement-parts/apple/macbook-air`,
  iphone: `${BASE_URL}/replacement-parts/apple/iphone-parts`,
  'galaxy-s': `${BASE_URL}/replacement-parts/samsung/galaxy-s-series`,
  'galaxy-note': `${BASE_URL}/replacement-parts/samsung/galaxy-note-series`,
  pixel: `${BASE_URL}/replacement-parts/google-pixel/pixel`,
};

const DEVICE_LINE_MAP = {
  pro: { line: 'MacBook Pro', brand: 'Apple' },
  air: { line: 'MacBook Air', brand: 'Apple' },
  iphone: { line: 'iPhone', brand: 'Apple' },
  'galaxy-s': { line: 'Galaxy S', brand: 'Samsung' },
  'galaxy-note': { line: 'Galaxy Note', brand: 'Samsung' },
  pixel: { line: 'Pixel', brand: 'Google' },
};

// Delays (milliseconds)
const DELAYS = {
  betweenPages: 2000,
  betweenProducts: 500,
  afterLogin: 3000,
  widgetLoad: 5000,
  retryBackoff: [2000, 5000, 10000], // exponential backoff
};

const MAX_RETRIES = 3;

// CSS selectors for MobileSentrix pages (Magento-based, not Shopify)
const SELECTORS = {
  // Product grid — Magento structure: ul.product-listing > li.item
  productList: 'ul.product-listing',
  productCard: 'ul.product-listing > li.item',
  productName: 'h2.product-name',
  productPrice: 'span.regular-price.price',
  productLink: 'a.product-image',
  productQualityBadge: 'img.product-badges',
  productAddToCart: '.custom-add-to-cart',  // presence = in stock

  // Pagination
  nextPage: '.pages li.next a, a.next.i-next',
};

// Category detection keywords
const CATEGORY_MAP = {
  screen: ['screen', 'lcd', 'display', 'oled', 'retina display', 'panel'],
  battery: ['battery', 'batt'],
  keyboard: ['keyboard', 'topcase with keyboard', 'top case'],
  trackpad: ['trackpad', 'track pad', 'touchpad', 'force touch'],
  charger: ['charger', 'charging port', 'magsafe', 'usb-c port', 'dc-in', 'i/o board'],
  fan: ['fan', 'cooling', 'heatsink', 'heat sink'],
  speaker: ['speaker'],
  camera: ['camera', 'webcam', 'isight', 'facetime'],
  hinge: ['hinge', 'clutch'],
  cable: ['cable', 'flex', 'ribbon'],
  logic_board: ['logic board', 'motherboard', 'mainboard'],
  ssd: ['ssd', 'solid state', 'storage'],
  ram: ['ram', 'memory'],
  other: [],
};

// Quality tier keywords (based on MobileSentrix badge labels)
const QUALITY_MAP = {
  oem: ['genuine oem', 'apple genuine', 'genuine'],
  premium: ['aftermarket plus', 'premium', 'high quality', 'grade a', 'grade-a'],
  standard: ['aftermarket', 'compatible', 'replacement', 'refurbished'],
};

/**
 * Detect category from product name
 */
function detectCategory(name) {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (category === 'other') continue;
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'other';
}

/**
 * Detect quality tier from product name
 */
function detectQuality(name) {
  const lower = name.toLowerCase();
  for (const [tier, keywords] of Object.entries(QUALITY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return tier;
  }
  return 'standard';
}

module.exports = {
  BASE_URL,
  CATEGORY_URLS,
  DEVICE_LINE_MAP,
  DELAYS,
  MAX_RETRIES,
  SELECTORS,
  CATEGORY_MAP,
  QUALITY_MAP,
  detectCategory,
  detectQuality,
};
