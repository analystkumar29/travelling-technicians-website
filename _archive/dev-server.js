const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Configure development environment
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Add development-specific headers
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      
      // Handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`
🚀 Development server running!
⭐️ Ready on http://${hostname}:${port}
📝 Environment: ${process.env.NODE_ENV}
    `);
  });
});
