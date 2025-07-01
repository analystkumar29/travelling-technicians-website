/**
 * Simple fallback HTTP server for development
 * This will serve files from the public directory if Next.js fails to start
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Attempt to start Next.js first
console.log('🚀 Attempting to start Next.js dev server...');

const nextProcess = exec('npm run dev');
let nextServerFailed = false;

nextProcess.stdout.on('data', (data) => {
  console.log(`Next.js: ${data}`);
  
  // Check if server is ready
  if (data.includes('Ready in')) {
    console.log('✅ Next.js server started successfully!');
    console.log('🌐 Access your site at: http://localhost:3000');
  }
});

nextProcess.stderr.on('data', (data) => {
  console.error(`Next.js Error: ${data}`);
  
  // Check for common fatal errors
  if (data.includes('EADDRINUSE') || 
      data.includes('Syntax Error') || 
      data.includes('Expected')) {
    nextServerFailed = true;
    
    // Start the fallback server
    startFallbackServer();
  }
});

// Start a simple fallback server after a delay or on Next.js failure
setTimeout(() => {
  if (nextServerFailed) {
    console.log('⚠️ Next.js server failed to start.');
    startFallbackServer();
  }
}, 10000);

function startFallbackServer() {
  console.log('\n⚠️ Starting fallback static file server...');
  
  const PORT = 3001;
  const PUBLIC_DIR = path.join(__dirname, 'public');
  
  // MIME types for common file extensions
  const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  
  // Create a simple HTTP server
  const server = http.createServer((req, res) => {
    console.log(`📝 Request: ${req.method} ${req.url}`);
    
    // Get the file path
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Check if the file exists
    fs.stat(filePath, (err, stats) => {
      if (err) {
        // If the file doesn't exist or there's an error, serve index.html
        filePath = path.join(PUBLIC_DIR, 'index.html');
        
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
        return;
      }
      
      if (stats.isDirectory()) {
        // If it's a directory, try to serve index.html from that directory
        filePath = path.join(filePath, 'index.html');
      }
      
      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
          return;
        }
        
        // Get the file extension
        const ext = path.extname(filePath);
        
        // Set the Content-Type
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
  });
  
  // Start the server
  server.listen(PORT, () => {
    console.log(`🌐 Fallback server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
    console.log(`⚠️ Only static files from the 'public' directory are available.`);
    console.log(`⚠️ Dynamic routes and server-side rendering are disabled in fallback mode.`);
  });
} 