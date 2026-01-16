#!/usr/bin/env node

/**
 * Comprehensive Image Audit Script
 * Tests image optimization, performance, and SEO compliance
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Simplified image helpers for auditing (standalone)
const generateImageAlt = (imagePath, context) => {
  const fileName = imagePath.split('/').pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, '') || '';
  const directory = imagePath.split('/').slice(-2, -1)[0] || '';
  
  if (directory === 'brands') {
    const brandName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    return `${brandName} brand logo for device repair services`;
  }
  
  if (directory === 'service-areas') {
    const cityName = fileName.replace(/-optimized$/, '').replace(/-/g, ' ');
    const formattedCity = cityName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${formattedCity} repair service area - Mobile and laptop repair technicians available`;
  }
  
  if (directory === 'blog') {
    const blogTopicMap = {
      'data-recovery': 'Professional data recovery service for damaged devices',
      'doorstep-service': 'Mobile technician providing doorstep repair services',
      'iphone-repair': 'iPhone screen and component repair service',
      'laptop-battery': 'Laptop battery replacement and maintenance service',
      'phone-repair-signs': 'Common signs indicating phone needs professional repair',
      'screen-protection': 'Screen protection and damage prevention for mobile devices',
      'water-damage-repair': 'Water damage repair process for electronic devices'
    };
    
    const baseFileName = fileName.replace(/-optimized$/, '');
    return blogTopicMap[baseFileName] || `${baseFileName.replace(/-/g, ' ')} - Professional device repair guide`;
  }
  
  if (directory === 'services') {
    if (fileName.includes('mobile-hero')) return 'Mobile phone repair services - Professional technician fixing smartphone';
    if (fileName.includes('laptop-hero')) return 'Laptop repair services - Expert technician repairing computer';
    if (fileName.includes('mobile-service')) return `Mobile phone repair service illustration`;
    if (fileName.includes('laptop-service')) return `Laptop repair service illustration`;
  }
  
  if (directory === 'team') {
    const roleMap = {
      'founder': 'Company founder and lead technician - Expert in mobile and laptop repair',
      'mobile-tech': 'Mobile phone repair specialist - Expert in iPhone and Android repair',
      'laptop-tech': 'Laptop repair technician - Specialist in MacBook and PC repair'
    };
    return roleMap[fileName] || `Team member - ${fileName.replace(/-/g, ' ')} specialist`;
  }
  
  if (directory === 'logo' || fileName.includes('logo')) {
    return 'The Travelling Technicians logo - Professional mobile and laptop repair services';
  }
  
  return fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
};

class ImageAuditor {
  constructor() {
    this.results = {
      total: 0,
      optimized: 0,
      needsOptimization: 0,
      altTextCoverage: 0,
      performanceScore: 0,
      seoScore: 0,
      issues: [],
      recommendations: []
    };
  }

  // Get all images from public directory
  getAllImages(dir = path.join(__dirname, '..', 'public', 'images'), imageList = []) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          this.getAllImages(filePath, imageList);
        } else if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file)) {
          const relativePath = path.relative(path.join(__dirname, '..', 'public'), filePath).replace(/\\/g, '/');
          imageList.push(relativePath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
    
    return imageList;
  }

  // Check if image has optimized version
  hasOptimizedVersion(imagePath) {
    const basePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
    const extension = imagePath.match(/\.(jpg|jpeg|png|webp|svg)$/i)?.[0] || '';
    
    if (extension.toLowerCase() === '.svg') return true; // SVGs are already optimized
    if (imagePath.includes('-optimized')) return true;
    if (extension.toLowerCase() === '.webp') return true;
    
    // Check if optimized versions exist
    const optimizedWebP = `${basePath}-optimized.webp`;
    const optimizedJpg = `${basePath}-optimized.jpg`;
    
    try {
      const publicDir = path.join(__dirname, '..', 'public');
      return fs.existsSync(path.join(publicDir, optimizedWebP)) || 
             fs.existsSync(path.join(publicDir, optimizedJpg));
    } catch {
      return false;
    }
  }

  // Estimate file size (simplified)
  getFileSize(imagePath) {
    try {
      const fullPath = path.join(__dirname, '..', 'public', imagePath);
      const stats = fs.statSync(fullPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // Check image format efficiency
  checkFormatEfficiency(imagePath) {
    const extension = path.extname(imagePath).toLowerCase();
    const fileSize = this.getFileSize(imagePath);
    
    const scores = {
      '.svg': { score: 100, reason: 'Vector format - perfect for icons and logos' },
      '.webp': { score: 95, reason: 'Modern format with excellent compression' },
      '.png': fileSize > 100000 ? 
        { score: 60, reason: 'PNG is large - consider WebP for photos' } :
        { score: 85, reason: 'PNG is good for graphics with transparency' },
      '.jpg': fileSize > 200000 ? 
        { score: 70, reason: 'JPEG is large - consider compression or WebP' } :
        { score: 80, reason: 'JPEG is acceptable for photos' },
      '.jpeg': fileSize > 200000 ? 
        { score: 70, reason: 'JPEG is large - consider compression or WebP' } :
        { score: 80, reason: 'JPEG is acceptable for photos' }
    };
    
    return scores[extension] || { score: 50, reason: 'Unknown format' };
  }

  // Test alt text generation
  testAltTextGeneration(imagePath) {
    try {
      const altText = generateImageAlt(imagePath);
      const quality = this.evaluateAltText(altText, imagePath);
      return { altText, quality };
    } catch (error) {
      return { altText: '', quality: { score: 0, issues: ['Failed to generate alt text'] } };
    }
  }

  // Evaluate alt text quality
  evaluateAltText(altText, imagePath) {
    const issues = [];
    let score = 100;
    
    if (!altText) {
      return { score: 0, issues: ['No alt text provided'] };
    }
    
    if (altText.length < 10) {
      issues.push('Alt text too short (less than 10 characters)');
      score -= 30;
    }
    
    if (altText.length > 150) {
      issues.push('Alt text too long (over 150 characters)');
      score -= 20;
    }
    
    if (altText.toLowerCase().includes('image') || altText.toLowerCase().includes('picture')) {
      issues.push('Alt text contains redundant words like "image" or "picture"');
      score -= 15;
    }
    
    if (!altText.includes('repair') && imagePath.includes('service')) {
      issues.push('Service image missing relevant context (repair, service, etc.)');
      score -= 10;
    }
    
    return { score: Math.max(0, score), issues };
  }

  // Test loading optimization
  testLoadingOptimization(imagePath) {
    try {
      const optimization = optimizeImageLoading(imagePath, false, false);
      return {
        strategy: optimization,
        score: this.evaluateLoadingStrategy(optimization, imagePath)
      };
    } catch (error) {
      return { strategy: {}, score: { score: 0, issues: ['Failed to optimize loading'] } };
    }
  }

  // Evaluate loading strategy
  evaluateLoadingStrategy(strategy, imagePath) {
    let score = 100;
    const issues = [];
    
    // Check if critical images have priority
    if (imagePath.includes('logo') && !strategy.priority) {
      issues.push('Logo should have priority loading');
      score -= 20;
    }
    
    if (imagePath.includes('hero') && !strategy.priority) {
      issues.push('Hero image should have priority loading');
      score -= 15;
    }
    
    // Check if non-critical images are lazy loaded
    if (imagePath.includes('blog') && strategy.loading !== 'lazy') {
      issues.push('Blog images should be lazy loaded');
      score -= 10;
    }
    
    if (!strategy.sizes) {
      issues.push('Missing responsive sizes configuration');
      score -= 10;
    }
    
    return { score: Math.max(0, score), issues };
  }

  // Run comprehensive audit
  async runAudit() {
    console.log('🔍 COMPREHENSIVE IMAGE AUDIT');
    console.log('============================\n');
    
    const startTime = performance.now();
    const images = this.getAllImages();
    
    console.log(`📊 Found ${images.length} images to audit...\n`);
    
    let totalScore = 0;
    let optimizedCount = 0;
    let altTextScore = 0;
    let performanceScore = 0;
    
    const detailedResults = [];
    
    for (const imagePath of images) {
      const result = await this.auditSingleImage(imagePath);
      detailedResults.push(result);
      
      totalScore += result.overallScore;
      if (result.isOptimized) optimizedCount++;
      altTextScore += result.altText.quality.score;
      performanceScore += result.loading.score.score;
      
      // Collect issues
      this.results.issues.push(...result.issues);
    }
    
    const endTime = performance.now();
    
    // Calculate final scores
    this.results.total = images.length;
    this.results.optimized = optimizedCount;
    this.results.needsOptimization = images.length - optimizedCount;
    this.results.altTextCoverage = Math.round(altTextScore / images.length);
    this.results.performanceScore = Math.round(performanceScore / images.length);
    this.results.seoScore = Math.round(totalScore / images.length);
    
    // Generate recommendations
    this.generateRecommendations(detailedResults);
    
    // Display results
    this.displayResults(detailedResults, endTime - startTime);
    
    return this.results;
  }

  async auditSingleImage(imagePath) {
    const isOptimized = this.hasOptimizedVersion(imagePath);
    const fileSize = this.getFileSize(imagePath);
    const formatEfficiency = this.checkFormatEfficiency(imagePath);
    const altText = this.testAltTextGeneration(imagePath);
    const loading = this.testLoadingOptimization(imagePath);
    
    const issues = [
      ...formatEfficiency.score < 80 ? [`Format: ${formatEfficiency.reason}`] : [],
      ...altText.quality.issues,
      ...loading.score.issues,
      ...!isOptimized ? ['No optimized version available'] : []
    ];
    
    const overallScore = Math.round(
      (formatEfficiency.score + altText.quality.score + loading.score.score + (isOptimized ? 100 : 50)) / 4
    );
    
    return {
      imagePath,
      isOptimized,
      fileSize,
      formatEfficiency,
      altText,
      loading,
      issues,
      overallScore
    };
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    // Format recommendations
    const largeImages = results.filter(r => r.fileSize > 200000);
    if (largeImages.length > 0) {
      recommendations.push(`📏 ${largeImages.length} images are over 200KB - consider compression or WebP conversion`);
    }
    
    // Optimization recommendations
    const unoptimized = results.filter(r => !r.isOptimized);
    if (unoptimized.length > 0) {
      recommendations.push(`🔧 ${unoptimized.length} images need WebP optimization`);
    }
    
    // Alt text recommendations
    const poorAltText = results.filter(r => r.altText.quality.score < 70);
    if (poorAltText.length > 0) {
      recommendations.push(`📝 ${poorAltText.length} images have poor alt text quality`);
    }
    
    // Performance recommendations
    const poorPerformance = results.filter(r => r.loading.score.score < 80);
    if (poorPerformance.length > 0) {
      recommendations.push(`⚡ ${poorPerformance.length} images have suboptimal loading configuration`);
    }
    
    this.results.recommendations = recommendations;
  }

  displayResults(detailedResults, auditTime) {
    console.log('📋 AUDIT SUMMARY');
    console.log('================');
    console.log(`Total Images: ${this.results.total}`);
    console.log(`Optimized: ${this.results.optimized} (${Math.round((this.results.optimized/this.results.total)*100)}%)`);
    console.log(`Need Optimization: ${this.results.needsOptimization}`);
    console.log(`Alt Text Score: ${this.results.altTextCoverage}/100`);
    console.log(`Performance Score: ${this.results.performanceScore}/100`);
    console.log(`Overall SEO Score: ${this.results.seoScore}/100`);
    console.log(`Audit Time: ${Math.round(auditTime)}ms\n`);
    
    // Grade assignment
    const grade = this.results.seoScore >= 90 ? 'A+' :
                  this.results.seoScore >= 80 ? 'A' :
                  this.results.seoScore >= 70 ? 'B' :
                  this.results.seoScore >= 60 ? 'C' : 'D';
    
    console.log(`🎯 GRADE: ${grade}`);
    console.log(`${this.getGradeEmoji(grade)} ${this.getGradeMessage(grade)}\n`);
    
    // Show recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('==================');
      this.results.recommendations.forEach(rec => console.log(rec));
      console.log('');
    }
    
    // Show worst performing images
    const worstImages = detailedResults
      .filter(r => r.overallScore < 70)
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 5);
    
    if (worstImages.length > 0) {
      console.log('⚠️  NEEDS ATTENTION');
      console.log('===================');
      worstImages.forEach(img => {
        console.log(`${img.imagePath} (Score: ${img.overallScore}/100)`);
        img.issues.forEach(issue => console.log(`   • ${issue}`));
      });
      console.log('');
    }
    
    // Show best performing images
    const bestImages = detailedResults
      .filter(r => r.overallScore >= 90)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);
    
    if (bestImages.length > 0) {
      console.log('✅ EXCELLENT PERFORMANCE');
      console.log('========================');
      bestImages.forEach(img => {
        console.log(`${img.imagePath} (Score: ${img.overallScore}/100)`);
      });
      console.log('');
    }
  }

  getGradeEmoji(grade) {
    const emojis = { 'A+': '🏆', 'A': '🥇', 'B': '🥈', 'C': '🥉', 'D': '📈' };
    return emojis[grade] || '📊';
  }

  getGradeMessage(grade) {
    const messages = {
      'A+': 'Outstanding! Your images are perfectly optimized.',
      'A': 'Excellent image optimization with minor improvements possible.',
      'B': 'Good optimization with some areas for improvement.',
      'C': 'Decent optimization but significant improvements needed.',
      'D': 'Poor optimization - major improvements required.'
    };
    return messages[grade] || 'Optimization assessment complete.';
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new ImageAuditor();
  auditor.runAudit().then(results => {
    process.exit(results.seoScore >= 70 ? 0 : 1);
  }).catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

module.exports = ImageAuditor;
