const next = require('next');
const { createServer } = require('http');

// Configure development environment
process.env.NODE_ENV = 'development';

const dev = true;
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`
🚀 Development server running!
⭐️ Ready on http://${hostname}:${port}
📝 Environment: ${process.env.NODE_ENV}
    `);
  });
});
