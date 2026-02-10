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
  'galaxy-a': `${BASE_URL}/replacement-parts/samsung/galaxy-a-series`,
  pixel: `${BASE_URL}/replacement-parts/google-pixel/pixel`,
};

const DEVICE_LINE_MAP = {
  pro: { line: 'MacBook Pro', brand: 'Apple' },
  air: { line: 'MacBook Air', brand: 'Apple' },
  iphone: { line: 'iPhone', brand: 'Apple' },
  'galaxy-s': { line: 'Galaxy S', brand: 'Samsung' },
  'galaxy-note': { line: 'Galaxy Note', brand: 'Samsung' },
  'galaxy-a': { line: 'Galaxy A', brand: 'Samsung' },
  pixel: { line: 'Pixel', brand: 'Google' },
};

/**
 * Hardcoded sub-model page slugs for each category.
 * MobileSentrix doesn't expose these links on category landing pages —
 * they're only accessible via the sidebar navigation menu.
 * URL pattern: CATEGORY_URLS[key] + '/' + slug
 *
 * These were verified against live MobileSentrix pages on 2026-02-10.
 * MacBook categories (pro/air) use dynamic discovery and don't need this.
 */
const SUB_MODEL_SLUGS = {
  iphone: [
    'iphone-17-pro-max', 'iphone-17-pro', 'iphone-17',
    'iphone-16-pro-max', 'iphone-16-pro', 'iphone-16-plus', 'iphone-16', 'iphone-16-e',
    'iphone-15-pro-max', 'iphone-15-pro', 'iphone-15-plus', 'iphone-15',
    'iphone-14-pro-max', 'iphone-14-pro', 'iphone-14-plus', 'iphone-14',
    'iphone-13-pro-max', 'iphone-13-pro', 'iphone-13-mini', 'iphone-13',
    'iphone-12-pro-max', 'iphone-12-pro', 'iphone-12-mini', 'iphone-12',
    'iphone-11-pro-max', 'iphone-11-pro', 'iphone-11',
    'iphone-xs-max', 'iphone-xs', 'iphone-xr', 'iphone-x',
    'iphone-8-plus', 'iphone-8', 'iphone-7-plus', 'iphone-7',
    'iphone-6s-plus', 'iphone-6s',
    'iphone-se-2022', 'iphone-se-2020', 'iphone-5se',
  ],
  'galaxy-s': [
    // S25-S26 (no suffix)
    'galaxy-s26-ultra', 'galaxy-s26-plus',
    'galaxy-s25-ultra', 'galaxy-s25-plus', 'galaxy-s25', 'galaxy-s25-fe', 'galaxy-s25-edge',
    // S23-S24 (5g suffix)
    'galaxy-s24-ultra-5g', 'galaxy-s24-plus-5g', 'galaxy-s24-5g', 'galaxy-s24-fe-5g',
    'galaxy-s23-ultra-5g', 'galaxy-s23-plus-5g', 'galaxy-s23-5g', 'galaxy-s23-fe-5g',
    // S20-S22 (no suffix)
    'galaxy-s22-ultra', 'galaxy-s22-plus', 'galaxy-s22',
    'galaxy-s21-ultra', 'galaxy-s21-plus', 'galaxy-s21', 'galaxy-s21-fe-5g',
    'galaxy-s20-ultra', 'galaxy-s20-plus', 'galaxy-s20', 'galaxy-s20-fe-5g',
    // S3-S10 (samsung- prefix)
    'samsung-galaxy-s10-lite', 'samsung-galaxy-s10-5g', 'samsung-galaxy-s10-plus', 'samsung-galaxy-s10', 'samsung-galaxy-s10e',
    'samsung-galaxy-s9-plus', 'samsung-galaxy-s9',
    'samsung-galaxy-s8-plus', 'samsung-galaxy-s8', 'samsung-galaxy-s8-active',
    'galaxy-s7-active', 'samsung-galaxy-s7-edge', 'samsung-galaxy-s7',
    'samsung-galaxy-s6-edge-plus', 'samsung-galaxy-s6-edge', 'samsung-galaxy-s6',
    'samsung-galaxy-s5', 'samsung-galaxy-s4', 'samsung-galaxy-s3',
  ],
  'galaxy-note': [
    'galaxy-note-20-ultra', 'galaxy-note-20',
    'galaxy-note-10-plus', 'galaxy-note-10',
    'galaxy-note-9',
  ],
  'galaxy-a': [
    'a55-a556-2024', 'a54-5g-a546-2023', 'a53-5g-a536-2022',
    'a52s-a528-2021', 'a52-5g-a526-2021', 'a52-4g-a525-2021',
    'a51-5g-a516-2020', 'a51-4g-a515-2019',
    'a50s-a507-2019', 'a50-a505-2019',
    'a42-5g-a426-2020', 'a41-a415-2020',
    'a35-5g-a356-2024', 'a34-5g-a346-2023',
    'a33-5g-a336-2022', 'a32-5g-a326-2021', 'a32-4g-a325-2021',
    'a31-a315-2020', 'a30s-a307-2019', 'a30-a305-2019',
    'a25-5g-a256-2023', 'a24-a245-2023',
    'a23-5g-a236-2022', 'a23-a235-2022',
    'a22-5g-a226-2021', 'a22-4g-a225-2021',
    'a21s-a217-2020', 'a21-a215-2020',
    'a20s-a207-2019', 'a20e-a202-2019', 'a20-a205-2019',
    'a16-5g-a166-2024', 'a16-4g-a165-2024',
    'a15-5g-a156-2023', 'a15-a155-2023',
    'a14-5g-a146-2023', 'a14-a145-2023',
    'a13-5g-a136-2021', 'a13-a135-2022',
    'a12-a125-2020', 'a11-a115-2020',
    'a10s-a107-2019', 'a10e-a102-2019', 'a10-a105-2019',
    'a05s-a057-2023', 'a05-a055-2023',
    'a04s-a047-2022', 'a04-a045-2022',
    'a03s-a037-2021', 'a03-a035-2021',
    'a02s-a025-2020', 'a02-a022-2020',
    'a01-a015-2020',
  ],
  pixel: [
    'pixel-10-pro-xl', 'pixel-10-pro', 'pixel-10', 'pixel-10-fold',
    'pixel-9a', 'pixel-9-pro-xl', 'pixel-9-pro-fold', 'pixel-9-pro', 'pixel-9',
    'pixel-8a', 'pixel-8-pro', 'pixel-8',
    'pixel-fold',
    'pixel-7a', 'pixel-7-pro', 'pixel-7',
    'pixel-6a', 'pixel-6-pro', 'pixel-6',
    'google-pixel-5a-5g', 'google-pixel-5',
    'google-pixel-4a-5g', 'google-pixel-4a', 'google-pixel-4-xl', 'google-pixel-4',
    'google-pixel-3a-xl', 'google-pixel-3a',
    'google-pixel-3-xl-6-3', 'google-pixel-3-5-5',
    'google-pixel-2-xl', 'google-pixel-2',
  ],
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
  SUB_MODEL_SLUGS,
  DELAYS,
  MAX_RETRIES,
  SELECTORS,
  CATEGORY_MAP,
  QUALITY_MAP,
  detectCategory,
  detectQuality,
};
