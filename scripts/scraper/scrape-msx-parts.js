#!/usr/bin/env node

/**
 * MobileSentrix MacBook Parts Scraper
 *
 * Usage:
 *   npm run scrape:parts                  Full scrape (MacBook Pro + Air)
 *   npm run scrape:parts -- --dry-run     Parse only, no DB writes
 *   npm run scrape:parts -- --category=air    MacBook Air only
 *   npm run scrape:parts -- --category=pro    MacBook Pro only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

// Load env vars from .env.local
require('dotenv').config({ path: '.env.local' });

const { launchBrowser, closeBrowser } = require('./lib/browser');
const { crawlAll } = require('./lib/crawler');
const { createScrapeLog, updateScrapeLog, upsertProducts, getCatalogStats } = require('./lib/db');
const { logger } = require('./lib/logger');

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    categories: ['pro', 'air'],
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg.startsWith('--category=')) {
      const val = arg.split('=')[1].toLowerCase();
      if (val === 'pro' || val === 'air') {
        opts.categories = [val];
      } else {
        logger.error(`Unknown category: ${val}. Use 'pro' or 'air'.`);
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
MobileSentrix MacBook Parts Scraper

Usage:
  npm run scrape:parts                     Full scrape
  npm run scrape:parts -- --dry-run        Parse only, no DB writes
  npm run scrape:parts -- --category=pro   MacBook Pro only
  npm run scrape:parts -- --category=air   MacBook Air only
`);
      process.exit(0);
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const startTime = Date.now();
  let browser = null;
  let scrapeLog = null;

  logger.section('MobileSentrix Parts Scraper');
  logger.info(`Mode: ${opts.dryRun ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
  logger.info(`Categories: ${opts.categories.join(', ')}`);

  try {
    // Create scrape log (unless dry run)
    if (!opts.dryRun) {
      scrapeLog = await createScrapeLog();
      if (scrapeLog) {
        logger.info(`Scrape log ID: ${scrapeLog.id}`);
      }
    }

    // Launch browser (no login needed — prices are public on MobileSentrix)
    const { browser: b, context, page } = await launchBrowser();
    browser = b;

    // Crawl categories
    const products = await crawlAll(page, opts.categories);

    logger.section('Results');
    logger.info(`Products found: ${products.length}`);

    if (opts.dryRun) {
      // Print product summary
      logger.info('\nSample products:');
      const sample = products.slice(0, 10);
      for (const p of sample) {
        logger.info(
          `  [${p.sku}] ${p.name} — $${p.wholesale_price || '?'} — ${p.category} — ${p.is_in_stock ? 'In Stock' : 'Out of Stock'}`
        );
      }
      if (products.length > 10) {
        logger.info(`  ... and ${products.length - 10} more`);
      }

      // Category breakdown
      const byCat = {};
      for (const p of products) {
        byCat[p.category] = (byCat[p.category] || 0) + 1;
      }
      logger.info('\nBy category:');
      for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
        logger.info(`  ${cat}: ${count}`);
      }

      // Device line breakdown
      const byLine = {};
      for (const p of products) {
        byLine[p.device_line || 'unknown'] = (byLine[p.device_line || 'unknown'] || 0) + 1;
      }
      logger.info('\nBy device line:');
      for (const [line, count] of Object.entries(byLine)) {
        logger.info(`  ${line}: ${count}`);
      }
    } else {
      // Upsert to DB
      logger.section('Database Upsert');
      const { upserted, errors } = await upsertProducts(products);

      const duration = Date.now() - startTime;

      // Update scrape log
      if (scrapeLog) {
        await updateScrapeLog(scrapeLog.id, {
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          products_found: products.length,
          products_upserted: upserted,
          errors: errors.length > 0 ? errors : [],
          duration_ms: duration,
        });
      }

      // Print final stats
      const stats = await getCatalogStats();
      logger.section('Final Stats');
      logger.info(`Products in catalog: ${stats.total}`);
      logger.info(`In stock: ${stats.inStock}`);
      logger.info(`Duration: ${(duration / 1000).toFixed(1)}s`);
    }

    logger.success('Scrape complete!');
  } catch (err) {
    logger.error(`Scrape failed: ${err.message}`);
    console.error(err.stack);

    // Update scrape log with failure
    if (scrapeLog) {
      await updateScrapeLog(scrapeLog.id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        errors: [{ error: err.message }],
        duration_ms: Date.now() - startTime,
      });
    }

    process.exit(1);
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

main();
