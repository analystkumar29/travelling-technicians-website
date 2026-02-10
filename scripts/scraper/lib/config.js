/**
 * Scraper configuration: URLs, selectors, keyword maps, delays
 */

const BASE_URL = 'https://www.mobilesentrix.ca';

const CATEGORY_URLS = {
  pro: `${BASE_URL}/replacement-parts/apple/macbook-pro`,
  air: `${BASE_URL}/replacement-parts/apple/macbook-air`,
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

// CSS selectors for MobileSentrix pages
const SELECTORS = {
  // Login page
  loginEmail: '#customer_email, input[name="customer[email]"], input[type="email"]',
  loginPassword: '#customer_password, input[name="customer[password]"], input[type="password"]',
  loginButton: 'input[type="submit"][value*="Sign"], button[type="submit"]',
  loginSuccess: '.account-links, .customer-logged-in, a[href*="logout"], a[href*="account"]',

  // Category/sub-model listing
  subModelLinks: '.collection-list a, .sub-categories a, .category-list a, .collection-grid a',

  // Product grid (Searchanise-rendered or native)
  productCard: '.snize-product, .product-card, .product-item, .grid-product',
  productName: '.snize-title, .product-title, .product-card__title, .product-item__title, h3 a, h2 a',
  productPrice: '.snize-price, .product-price, .price, .product-card__price, .money',
  productSku: '.snize-sku, .product-sku, [data-sku]',
  productStock: '.snize-in-stock, .product-availability, .in-stock, .out-of-stock, .sold-out',
  productLink: 'a.snize-view-link, a.product-link, .product-card a, .product-item a, h3 a, h2 a',

  // Product detail page
  detailTitle: '.product-single__title, h1.product__title, h1',
  detailPrice: '.product__price, .product-single__price, .price--main, .price',
  detailSku: '.product-single__sku, .product__sku, .sku',
  detailStock: '.product-form__inventory, .product-single__availability',
  detailDescription: '.product-single__description, .product__description, .product-description',
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

// Quality tier keywords
const QUALITY_MAP = {
  oem: ['oem', 'original', 'genuine', 'apple original'],
  premium: ['premium', 'high quality', 'grade a', 'grade-a', 'a+'],
  standard: ['aftermarket', 'compatible', 'replacement'],
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
  DELAYS,
  MAX_RETRIES,
  SELECTORS,
  CATEGORY_MAP,
  QUALITY_MAP,
  detectCategory,
  detectQuality,
};
