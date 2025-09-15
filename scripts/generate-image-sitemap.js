#!/usr/bin/env node

/**
 * Generate Image Sitemap for SEO
 * Creates an XML sitemap specifically for images to improve Google image search rankings
 */

const fs = require('fs');
const path = require('path');

// Image metadata mapping
const IMAGE_METADATA = {
  // Brand logos
  'brands/apple.svg': {
    title: 'Apple Logo - iPhone iPad Repair Services',
    caption: 'Professional Apple device repair services for iPhone, iPad, and MacBook',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'brands/samsung.svg': {
    title: 'Samsung Logo - Galaxy Repair Services', 
    caption: 'Expert Samsung Galaxy phone and tablet repair services',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'brands/google.svg': {
    title: 'Google Logo - Pixel Repair Services',
    caption: 'Professional Google Pixel phone repair and support',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'brands/xiaomi.svg': {
    title: 'Xiaomi Logo - Mi Phone Repair Services',
    caption: 'Specialized Xiaomi Mi phone repair and maintenance',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'brands/oneplus.svg': {
    title: 'OnePlus Logo - OnePlus Repair Services',
    caption: 'Expert OnePlus smartphone repair and support services',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'brands/huawei.svg': {
    title: 'Huawei Logo - Huawei Repair Services',
    caption: 'Professional Huawei smartphone repair and maintenance',
    geoLocation: 'Vancouver, BC, Canada'
  },

  // Service area images
  'service-areas/vancouver-optimized.webp': {
    title: 'Vancouver Mobile Repair Services',
    caption: 'Professional mobile phone and laptop repair services in Vancouver, BC',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'service-areas/burnaby-optimized.webp': {
    title: 'Burnaby Mobile Repair Services',
    caption: 'Doorstep mobile phone and laptop repair services in Burnaby, BC',
    geoLocation: 'Burnaby, BC, Canada'
  },
  'service-areas/richmond-optimized.webp': {
    title: 'Richmond Mobile Repair Services',
    caption: 'Professional device repair services available in Richmond, BC',
    geoLocation: 'Richmond, BC, Canada'
  },
  'service-areas/coquitlam-optimized.webp': {
    title: 'Coquitlam Mobile Repair Services',
    caption: 'Mobile and laptop repair services in Coquitlam, BC',
    geoLocation: 'Coquitlam, BC, Canada'
  },
  'service-areas/north-vancouver-optimized.webp': {
    title: 'North Vancouver Mobile Repair Services',
    caption: 'Doorstep repair services in North Vancouver, BC',
    geoLocation: 'North Vancouver, BC, Canada'
  },
  'service-areas/west-vancouver-optimized.webp': {
    title: 'West Vancouver Mobile Repair Services',
    caption: 'Professional device repair services in West Vancouver, BC',
    geoLocation: 'West Vancouver, BC, Canada'
  },
  'service-areas/new-westminster-optimized.webp': {
    title: 'New Westminster Mobile Repair Services',
    caption: 'Mobile phone and laptop repair in New Westminster, BC',
    geoLocation: 'New Westminster, BC, Canada'
  },
  'service-areas/chilliwack-optimized.webp': {
    title: 'Chilliwack Mobile Repair Services',
    caption: 'Professional device repair services in Chilliwack, BC',
    geoLocation: 'Chilliwack, BC, Canada'
  },

  // Service illustrations
  'services/mobile-hero.svg': {
    title: 'Mobile Phone Repair Services',
    caption: 'Professional mobile phone repair technician fixing smartphone screen',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'services/laptop-hero.svg': {
    title: 'Laptop Repair Services',
    caption: 'Expert laptop repair technician working on computer maintenance',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'services/tablet-hero.svg': {
    title: 'Tablet Repair Services',
    caption: 'Professional tablet repair services for iPad and Android tablets',
    geoLocation: 'Vancouver, BC, Canada'
  },

  // Blog images
  'blog/phone-repair-signs-optimized.webp': {
    title: '5 Warning Signs Your Phone Needs Repair',
    caption: 'Common indicators that your mobile phone requires professional repair services',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'blog/screen-protection-optimized.webp': {
    title: 'Ultimate Guide to Screen Protection',
    caption: 'Complete guide to protecting your mobile device screen from damage',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'blog/water-damage-repair-optimized.webp': {
    title: 'Water Damage First Aid for Devices',
    caption: 'Emergency steps to take when your phone or laptop suffers water damage',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'blog/laptop-battery-optimized.webp': {
    title: 'How to Extend Your Laptop Battery Life',
    caption: 'Professional tips to maximize your laptop battery performance and lifespan',
    geoLocation: 'Vancouver, BC, Canada'
  },

  // Team photos
  'team/founder.jpg': {
    title: 'Company Founder - Expert Repair Technician',
    caption: 'Lead technician and founder specializing in mobile and laptop repair services',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'team/mobile-tech.jpg': {
    title: 'Mobile Repair Specialist',
    caption: 'Expert mobile phone repair technician specializing in iPhone and Android devices',
    geoLocation: 'Vancouver, BC, Canada'
  },
  'team/laptop-tech.jpg': {
    title: 'Laptop Repair Technician',
    caption: 'Professional laptop repair specialist for MacBook and PC repair services',
    geoLocation: 'Vancouver, BC, Canada'
  },

  // Company logo
  'logo/logo-orange.png': {
    title: 'The Travelling Technicians Logo',
    caption: 'Professional mobile phone and laptop repair services in Vancouver and Lower Mainland',
    geoLocation: 'Vancouver, BC, Canada'
  }
};

function getAllImages(dir, imageList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllImages(filePath, imageList);
    } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file)) {
      const relativePath = path.relative('public/images', filePath).replace(/\\/g, '/');
      imageList.push(relativePath);
    }
  }
  
  return imageList;
}

function generateImageSitemap() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const images = getAllImages(imagesDir);
  
  const baseUrl = 'https://travelling-technicians.ca';
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Group images by page context
  const pageImages = {
    '/': [
      'logo/logo-orange.png',
      'brands/apple.svg',
      'brands/samsung.svg', 
      'brands/google.svg',
      'brands/xiaomi.svg',
      'brands/oneplus.svg',
      'brands/huawei.svg'
    ],
    '/services/mobile-repair': [
      'services/mobile-hero.svg',
      'services/mobileRepair-optimized.webp',
      ...Array.from({length: 8}, (_, i) => `services/mobile-service-${i+1}.svg`)
    ],
    '/services/laptop-repair': [
      'services/laptop-hero.svg',
      'services/laptopRepair-optimized.webp',
      ...Array.from({length: 10}, (_, i) => `services/laptop-service-${i+1}.svg`)
    ],
    '/services/tablet-repair': [
      'services/tablet-hero.svg',
      'services/tabletRepair-optimized.webp',
      ...Array.from({length: 8}, (_, i) => `services/tablet-service-${i+1}.svg`)
    ],
    '/about': [
      'about/team-meeting.jpg',
      'about/repair-process.jpg',
      'team/founder.jpg',
      'team/mobile-tech.jpg',
      'team/laptop-tech.jpg',
      'certifications/apple.jpg',
      'certifications/samsung.jpg',
      'certifications/comptia.jpg'
    ],
    '/blog/signs-your-phone-needs-repair': [
      'blog/phone-repair-signs-optimized.webp'
    ],
    '/blog/ultimate-guide-to-screen-protection': [
      'blog/screen-protection-optimized.webp'
    ],
    '/blog/water-damage-first-aid-for-devices': [
      'blog/water-damage-repair-optimized.webp'
    ],
    '/blog/how-to-extend-your-laptop-battery-life': [
      'blog/laptop-battery-optimized.webp'
    ]
  };

  // Add service area pages
  const serviceAreas = ['vancouver', 'burnaby', 'richmond', 'coquitlam', 'north-vancouver', 'west-vancouver', 'new-westminster', 'chilliwack'];
  serviceAreas.forEach(area => {
    pageImages[`/repair/${area}`] = [`service-areas/${area}-optimized.webp`];
  });

  // Generate sitemap entries for each page
  Object.entries(pageImages).forEach(([pageUrl, pageImagePaths]) => {
    sitemap += `  <url>
    <loc>${baseUrl}${pageUrl}</loc>
`;
    
    pageImagePaths.forEach(imagePath => {
      if (images.includes(imagePath)) {
        const metadata = IMAGE_METADATA[imagePath] || {};
        const imageUrl = `${baseUrl}/images/${imagePath}`;
        
        sitemap += `    <image:image>
      <image:loc>${imageUrl}</image:loc>
`;
        
        if (metadata.title) {
          sitemap += `      <image:title><![CDATA[${metadata.title}]]></image:title>
`;
        }
        
        if (metadata.caption) {
          sitemap += `      <image:caption><![CDATA[${metadata.caption}]]></image:caption>
`;
        }
        
        if (metadata.geoLocation) {
          sitemap += `      <image:geo_location>${metadata.geoLocation}</image:geo_location>
`;
        }
        
        sitemap += `    </image:image>
`;
      }
    });
    
    sitemap += `  </url>
`;
  });

  sitemap += `</urlset>`;

  // Write sitemap file
  const sitemapPath = path.join(__dirname, '..', 'public', 'image-sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  console.log('✅ Image sitemap generated successfully!');
  console.log(`📁 Saved to: ${sitemapPath}`);
  console.log(`📊 Total pages: ${Object.keys(pageImages).length}`);
  console.log(`🖼️  Total images: ${Object.values(pageImages).flat().length}`);
  
  return sitemap;
}

// Generate summary report
function generateImageReport() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const images = getAllImages(imagesDir);
  
  const report = {
    totalImages: images.length,
    optimizedImages: images.filter(img => img.includes('-optimized') || img.endsWith('.webp')).length,
    svgImages: images.filter(img => img.endsWith('.svg')).length,
    needsOptimization: images.filter(img => !img.includes('-optimized') && !img.endsWith('.webp') && !img.endsWith('.svg')).length,
    byCategory: {
      brands: images.filter(img => img.startsWith('brands/')).length,
      services: images.filter(img => img.startsWith('services/')).length,
      blog: images.filter(img => img.startsWith('blog/')).length,
      serviceAreas: images.filter(img => img.startsWith('service-areas/')).length,
      team: images.filter(img => img.startsWith('team/')).length,
      other: images.filter(img => !['brands/', 'services/', 'blog/', 'service-areas/', 'team/'].some(cat => img.startsWith(cat))).length
    }
  };
  
  console.log('\n📊 IMAGE OPTIMIZATION REPORT');
  console.log('================================');
  console.log(`Total Images: ${report.totalImages}`);
  console.log(`Optimized (WebP/SVG): ${report.optimizedImages + report.svgImages} (${Math.round(((report.optimizedImages + report.svgImages) / report.totalImages) * 100)}%)`);
  console.log(`Needs Optimization: ${report.needsOptimization}`);
  console.log('\nBy Category:');
  Object.entries(report.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} images`);
  });
  
  return report;
}

if (require.main === module) {
  console.log('🚀 Generating Image Sitemap for SEO...\n');
  generateImageSitemap();
  generateImageReport();
  
  console.log('\n💡 Next Steps:');
  console.log('1. Submit image sitemap to Google Search Console');
  console.log('2. Add image sitemap to robots.txt');
  console.log('3. Monitor image search performance');
  console.log('\n🔗 Submit to: https://search.google.com/search-console/');
}
