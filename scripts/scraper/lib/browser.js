/**
 * Playwright browser management + MobileSentrix login with session persistence
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { BASE_URL, SELECTORS, DELAYS } = require('./config');
const { logger } = require('./logger');

const SESSION_FILE = path.resolve(process.cwd(), '.msx-session.json');

/**
 * Launch browser with optional saved session
 */
async function launchBrowser() {
  logger.info('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let context;
  if (fs.existsSync(SESSION_FILE)) {
    logger.info('Found saved session, restoring cookies...');
    try {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      await context.addCookies(sessionData.cookies || []);
    } catch (err) {
      logger.warn('Failed to restore session, starting fresh:', err.message);
      context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
    }
  } else {
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }

  const page = await context.newPage();
  return { browser, context, page };
}

/**
 * Save session cookies for reuse
 */
async function saveSession(context) {
  try {
    const cookies = await context.cookies();
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies }, null, 2));
    logger.success('Session saved for reuse');
  } catch (err) {
    logger.warn('Failed to save session:', err.message);
  }
}

/**
 * Check if already logged in
 */
async function isLoggedIn(page) {
  try {
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // If we're redirected to login page, we're not logged in
    const url = page.url();
    if (url.includes('/account/login') || url.includes('/login')) {
      return false;
    }
    // Check for account page elements
    const accountEl = await page.$(SELECTORS.loginSuccess);
    return !!accountEl;
  } catch {
    return false;
  }
}

/**
 * Login to MobileSentrix
 */
async function login(page, context) {
  const email = process.env.MSX_EMAIL;
  const password = process.env.MSX_PASSWORD;

  if (!email || !password) {
    throw new Error('MSX_EMAIL and MSX_PASSWORD env vars are required. Add them to .env.local');
  }

  // Check if already logged in with saved session
  if (await isLoggedIn(page)) {
    logger.success('Already logged in (session restored)');
    return;
  }

  logger.info('Logging in to MobileSentrix...');
  await page.goto(`${BASE_URL}/account/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for login form
  await page.waitForSelector(SELECTORS.loginEmail, { timeout: 10000 });

  // Fill credentials
  await page.fill(SELECTORS.loginEmail, email);
  await page.fill(SELECTORS.loginPassword, password);

  // Submit
  await page.click(SELECTORS.loginButton);

  // Wait for navigation
  await page.waitForLoadState('domcontentloaded');
  await new Promise((r) => setTimeout(r, DELAYS.afterLogin));

  // Verify login
  if (await isLoggedIn(page)) {
    logger.success('Login successful');
    await saveSession(context);
  } else {
    throw new Error('Login failed — check MSX_EMAIL and MSX_PASSWORD');
  }
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

module.exports = { launchBrowser, login, closeBrowser, saveSession };
