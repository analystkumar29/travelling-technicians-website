const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas with the same dimensions as our SVG
const width = 110;
const height = 40;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill the canvas with white (transparent background)
ctx.fillStyle = 'rgba(0, 0, 0, 0)';
ctx.fillRect(0, 0, width, height);

// Draw the teal square
ctx.fillStyle = '#0d9488';
ctx.beginPath();
ctx.roundRect(5, 8, 24, 24, 4); // x, y, width, height, radius
ctx.fill();

// Draw the TT letters
ctx.strokeStyle = 'white';
ctx.lineWidth = 2.5;
ctx.lineCap = 'round';

// T horizontal
ctx.beginPath();
ctx.moveTo(12, 16);
ctx.lineTo(24, 16);
ctx.stroke();

// T vertical
ctx.beginPath();
ctx.moveTo(18, 16);
ctx.lineTo(18, 26);
ctx.stroke();

// Draw the horizontal line
ctx.strokeStyle = '#1e293b';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(5, 32);
ctx.lineTo(29, 32);
ctx.stroke();

// Draw the orange accent dot
ctx.fillStyle = '#f97316';
ctx.beginPath();
ctx.arc(29, 8, 3, 0, 2 * Math.PI);
ctx.fill();

// Convert to PNG and save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./public/images/logo.png', buffer);

console.log('Logo PNG has been generated at public/images/logo.png'); 