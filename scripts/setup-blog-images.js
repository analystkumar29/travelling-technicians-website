const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Curated Unsplash images for blog posts
const blogImages = [
  {
    filename: 'phone-repair-signs.jpg',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&crop=center',
    alt: 'Smartphone with cracked screen showing repair signs'
  },
  {
    filename: 'laptop-battery.jpg', 
    url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&h=800&fit=crop&crop=center',
    alt: 'Laptop battery replacement and maintenance'
  },
  {
    filename: 'iphone-repair.jpg',
    url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=800&fit=crop&crop=center', 
    alt: 'iPhone repair process with professional tools'
  },
  {
    filename: 'doorstep-service.jpg',
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop&crop=center',
    alt: 'Mobile repair technician providing doorstep service'
  },
  {
    filename: 'laptop-maintenance.jpg',
    url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1200&h=800&fit=crop&crop=center',
    alt: 'Laptop maintenance and cleaning process'
  },
  {
    filename: 'data-recovery.jpg',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=800&fit=crop&crop=center',
    alt: 'Professional data recovery service setup'
  }
];

const downloadDir = path.join(__dirname, '..', 'public', 'images', 'blog');

// Ensure directory exists
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function downloadImage(url, filename) {
  console.log(`📥 Downloading ${filename}...`);
  
  return new Promise((resolve, reject) => {
    const tempFile = path.join(downloadDir, `temp_${filename}`);
    const file = fs.createWriteStream(tempFile);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', async () => {
        file.close();
        
        try {
          // Optimize and convert to WebP
          const finalPath = path.join(downloadDir, filename);
          const webpPath = path.join(downloadDir, filename.replace('.jpg', '.webp'));
          
          // Create optimized JPEG
          await sharp(tempFile)
            .resize(1200, 800, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ 
              quality: 85, 
              progressive: true 
            })
            .toFile(finalPath);
          
          // Create WebP version
          await sharp(tempFile)
            .resize(1200, 800, { 
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: 85 })
            .toFile(webpPath);
          
          // Remove temp file
          fs.unlinkSync(tempFile);
          
          const originalSize = fs.statSync(finalPath).size;
          const webpSize = fs.statSync(webpPath).size;
          const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
          
          console.log(`✅ ${filename} optimized (${savings}% size reduction with WebP)`);
          resolve();
          
        } catch (error) {
          console.error(`❌ Error optimizing ${filename}:`, error.message);
          reject(error);
        }
      });
      
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function setupBlogImages() {
  console.log('🎨 Setting up blog images with free stock photos...\n');
  
  try {
    for (const image of blogImages) {
      await downloadImage(image.url, image.filename);
    }
    
    console.log('\n✅ All blog images downloaded and optimized!');
    console.log('📁 Images saved to: public/images/blog/');
    console.log('🖼️  Both JPEG and WebP versions created for optimal performance');
    
  } catch (error) {
    console.error('❌ Error setting up blog images:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupBlogImages(); 