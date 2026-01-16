const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'services');

const images = [
  {
    input: 'mobileRepair.png',
    output: 'mobileRepair-optimized.webp',
    alt: 'mobileRepair-optimized.jpg'
  },
  {
    input: 'laptopRepair.png', 
    output: 'laptopRepair-optimized.webp',
    alt: 'laptopRepair-optimized.jpg'
  },
  {
    input: 'tabletRepair.png',
    output: 'tabletRepair-optimized.webp', 
    alt: 'tabletRepair-optimized.jpg'
  }
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  for (const image of images) {
    const inputPath = path.join(IMAGES_DIR, image.input);
    const outputWebpPath = path.join(IMAGES_DIR, image.output);
    const outputJpgPath = path.join(IMAGES_DIR, image.alt);

    if (!fs.existsSync(inputPath)) {
      console.log(`❌ Input file not found: ${image.input}`);
      continue;
    }

    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSize = (originalStats.size / 1024 / 1024).toFixed(2);

      // Create WebP version (better compression, modern browsers)
      await sharp(inputPath)
        .resize(1200, 800, { 
          fit: 'cover', 
          position: 'center' 
        })
        .webp({ 
          quality: 85,
          effort: 6 
        })
        .toFile(outputWebpPath);

      // Create JPEG fallback (for older browsers)
      await sharp(inputPath)
        .resize(1200, 800, { 
          fit: 'cover', 
          position: 'center' 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toFile(outputJpgPath);

      // Get optimized file sizes
      const webpStats = fs.statSync(outputWebpPath);
      const jpgStats = fs.statSync(outputJpgPath);
      const webpSize = (webpStats.size / 1024).toFixed(0);
      const jpgSize = (jpgStats.size / 1024).toFixed(0);

      console.log(`✅ ${image.input}:`);
      console.log(`   Original: ${originalSize}MB`);
      console.log(`   WebP: ${webpSize}KB (${((1 - webpStats.size / originalStats.size) * 100).toFixed(1)}% reduction)`);
      console.log(`   JPEG: ${jpgSize}KB (${((1 - jpgStats.size / originalStats.size) * 100).toFixed(1)}% reduction)`);
      console.log('');

    } catch (error) {
      console.log(`❌ Error optimizing ${image.input}:`, error.message);
    }
  }

  console.log('🎉 Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your service page components to use the optimized images');
  console.log('2. Use WebP with JPEG fallback for best compatibility');
  console.log('3. Expected loading speed improvement: 80-90% faster!');
}

optimizeImages().catch(console.error); 