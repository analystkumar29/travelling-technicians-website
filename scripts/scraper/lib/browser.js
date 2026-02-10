/**
 * Playwright browser management for MobileSentrix scraping
 *
 * MobileSentrix is a Magento-based wholesale catalog.
 * Product listings and prices are publicly visible (no login required for browsing).
 * Login is only needed for placing orders / seeing account-specific pricing.
 */

const { chromium } = require('playwright');
const { logger } = require('./logger');

/**
 * Launch browser
 */
async function launchBrowser() {
  logger.info('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  logger.success('Browser ready');
  return { browser, context, page };
}

/**
 * Close browser
 */
async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
    logger.info('Browser closed');
  }
}

module.exports = { launchBrowser, closeBrowser };
