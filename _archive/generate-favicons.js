const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas for the favicon
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Fill the canvas with transparent background
ctx.fillStyle = 'rgba(0, 0, 0, 0)';
ctx.fillRect(0, 0, size, size);

// Draw the teal square (our logo background)
ctx.fillStyle = '#0d9488';
ctx.beginPath();
ctx.roundRect(4, 4, 24, 24, 4); // x, y, width, height, radius
ctx.fill();

// Draw the TT letters
ctx.strokeStyle = 'white';
ctx.lineWidth = 2.5;
ctx.lineCap = 'round';

// T horizontal
ctx.beginPath();
ctx.moveTo(10, 12);
ctx.lineTo(22, 12);
ctx.stroke();

// T vertical
ctx.beginPath();
ctx.moveTo(16, 12);
ctx.lineTo(16, 22);
ctx.stroke();

// Draw the orange accent dot
ctx.fillStyle = '#f97316';
ctx.beginPath();
ctx.arc(24, 8, 3, 0, 2 * Math.PI);
ctx.fill();

// Convert to PNG and save as favicon files
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./public/favicons/favicon-32x32.png', buffer);
fs.writeFileSync('./public/favicon.ico', buffer); // Basic favicon.ico

console.log('Favicon files have been generated in public/favicons/ and public/');

// Now generate a larger favicon for other uses (192x192 for PWA)
const largeSize = 192;
const largeCanvas = createCanvas(largeSize, largeSize);
const largeCtx = largeCanvas.getContext('2d');

// Scale everything up
const scale = largeSize / size;

// Fill the canvas with transparent background
largeCtx.fillStyle = 'rgba(0, 0, 0, 0)';
largeCtx.fillRect(0, 0, largeSize, largeSize);

// Draw the teal square (our logo background)
largeCtx.fillStyle = '#0d9488';
largeCtx.beginPath();
largeCtx.roundRect(4 * scale, 4 * scale, 24 * scale, 24 * scale, 4 * scale);
largeCtx.fill();

// Draw the TT letters
largeCtx.strokeStyle = 'white';
largeCtx.lineWidth = 2.5 * scale;
largeCtx.lineCap = 'round';

// T horizontal
largeCtx.beginPath();
largeCtx.moveTo(10 * scale, 12 * scale);
largeCtx.lineTo(22 * scale, 12 * scale);
largeCtx.stroke();

// T vertical
largeCtx.beginPath();
largeCtx.moveTo(16 * scale, 12 * scale);
largeCtx.lineTo(16 * scale, 22 * scale);
largeCtx.stroke();

// Draw the orange accent dot
largeCtx.fillStyle = '#f97316';
largeCtx.beginPath();
largeCtx.arc(24 * scale, 8 * scale, 3 * scale, 0, 2 * Math.PI);
largeCtx.fill();

// Convert to PNG and save larger favicon
const largeBuffer = largeCanvas.toBuffer('image/png');
fs.writeFileSync('./public/favicons/favicon-192x192.png', largeBuffer);

console.log('Large favicon (192x192) has been generated'); 