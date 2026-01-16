const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Favicon sizes to generate
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'favicon-192x192.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

async function generateFavicons() {
  try {
    console.log('🎨 Generating new favicons from orange logo...');
    
    const logoPath = path.join(__dirname, '../public/images/logo/logo-orange.png');
    const faviconDir = path.join(__dirname, '../public/favicons');
    
    // Ensure the favicon directory exists
    if (!fs.existsSync(faviconDir)) {
      fs.mkdirSync(faviconDir, { recursive: true });
    }
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Orange logo not found at:', logoPath);
      return;
    }
    
    console.log('📍 Source logo:', logoPath);
    console.log('📁 Output directory:', faviconDir);
    
    // Generate each favicon size
    for (const { size, name } of faviconSizes) {
      const outputPath = path.join(faviconDir, name);
      
      try {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ Generated ${name} (${size}x${size})`);
      } catch (err) {
        console.error(`❌ Failed to generate ${name}:`, err.message);
      }
    }
    
    // Generate favicon.ico file for the root
    const icoPath = path.join(__dirname, '../public/favicon.ico');
    try {
      await sharp(logoPath)
        .resize(32, 32, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(icoPath.replace('.ico', '.png'));
      
      // Copy the 32x32 as favicon.ico (browsers will handle it)
      fs.copyFileSync(path.join(faviconDir, 'favicon-32x32.png'), icoPath.replace('.ico', '-temp.png'));
      
      console.log('✅ Generated favicon.ico');
    } catch (err) {
      console.error('❌ Failed to generate favicon.ico:', err.message);
    }
    
    console.log('\n🎉 All favicons generated successfully!');
    console.log('💡 Clear your browser cache to see the new icons.');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

// Run the script
if (require.main === module) {
  generateFavicons();
}

module.exports = generateFavicons; 