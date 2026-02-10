/**
 * Timestamped console logging with progress tracking
 */

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const logger = {
  info(msg, ...args) {
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${msg}`, ...args);
  },
  success(msg, ...args) {
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.green}✓${colors.reset} ${msg}`, ...args);
  },
  warn(msg, ...args) {
    console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.yellow}⚠${colors.reset} ${msg}`, ...args);
  },
  error(msg, ...args) {
    console.error(`${colors.dim}[${timestamp()}]${colors.reset} ${colors.red}✗${colors.reset} ${msg}`, ...args);
  },
  progress(current, total, label) {
    const pct = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
    process.stdout.write(
      `\r${colors.dim}[${timestamp()}]${colors.reset} ${colors.cyan}${bar}${colors.reset} ${pct}% ${label} (${current}/${total})`
    );
    if (current === total) process.stdout.write('\n');
  },
  section(title) {
    console.log(`\n${colors.magenta}━━━ ${title} ━━━${colors.reset}\n`);
  },
};

module.exports = { logger };
