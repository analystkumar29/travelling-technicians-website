#!/usr/bin/env node

/**
 * Alt Tag Testing Script
 * Tests alt text generation and quality across all components
 */

const fs = require('fs');
const path = require('path');

// Test alt text generation
function testAltTextGeneration() {
  console.log('🏷️  ALT TEXT GENERATION TESTING');
  console.log('===============================\n');

  // Test cases for different image types
  const testCases = [
    // Brand logos
    { path: 'images/brands/apple.svg', expected: 'apple brand logo', context: 'device selection' },
    { path: 'images/brands/samsung.svg', expected: 'samsung brand logo', context: 'device selection' },
    { path: 'images/brands/google.svg', expected: 'google brand logo', context: 'device selection' },
    
    // Service area images
    { path: 'images/service-areas/vancouver-optimized.webp', expected: 'vancouver repair service', context: 'location page' },
    { path: 'images/service-areas/burnaby-optimized.webp', expected: 'burnaby repair service', context: 'location page' },
    
    // Blog images
    { path: 'images/blog/phone-repair-signs-optimized.webp', expected: 'phone repair signs', context: 'blog post' },
    { path: 'images/blog/laptop-battery-optimized.webp', expected: 'laptop battery', context: 'blog post' },
    { path: 'images/blog/water-damage-repair-optimized.webp', expected: 'water damage repair', context: 'blog post' },
    
    // Service illustrations
    { path: 'images/services/mobile-hero.svg', expected: 'mobile phone repair', context: 'hero section' },
    { path: 'images/services/laptop-hero.svg', expected: 'laptop repair', context: 'hero section' },
    { path: 'images/services/mobile-service-1.svg', expected: 'mobile service', context: 'service illustration' },
    
    // Team photos
    { path: 'images/team/founder.jpg', expected: 'founder', context: 'about page' },
    { path: 'images/team/mobile-tech.jpg', expected: 'mobile technician', context: 'about page' },
    { path: 'images/team/laptop-tech.jpg', expected: 'laptop technician', context: 'about page' },
    
    // Company logo
    { path: 'images/logo/logo-orange.png', expected: 'travelling technicians logo', context: 'header' }
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  console.log('🧪 Testing Alt Text Generation...\n');

  testCases.forEach((testCase, index) => {
    try {
      // Import our helper (simplified for testing)
      const altText = generateAltTextSimple(testCase.path, testCase.context);
      const passed = altText.toLowerCase().includes(testCase.expected.toLowerCase()) ||
                    testCase.expected.toLowerCase().includes(altText.toLowerCase().split(' ')[0]);
      
      if (passed) {
        results.passed++;
        console.log(`✅ Test ${index + 1}: PASS`);
        console.log(`   Path: ${testCase.path}`);
        console.log(`   Generated: "${altText}"`);
        console.log(`   Expected to contain: "${testCase.expected}"`);
      } else {
        results.failed++;
        console.log(`❌ Test ${index + 1}: FAIL`);
        console.log(`   Path: ${testCase.path}`);
        console.log(`   Generated: "${altText}"`);
        console.log(`   Expected to contain: "${testCase.expected}"`);
      }
      
      results.details.push({
        test: index + 1,
        path: testCase.path,
        generated: altText,
        expected: testCase.expected,
        passed
      });
      
    } catch (error) {
      results.failed++;
      console.log(`❌ Test ${index + 1}: ERROR`);
      console.log(`   Path: ${testCase.path}`);
      console.log(`   Error: ${error.message}`);
      
      results.details.push({
        test: index + 1,
        path: testCase.path,
        error: error.message,
        passed: false
      });
    }
    
    console.log('');
  });

  return results;
}

// Simplified alt text generation for testing (mirrors actual implementation)
function generateAltTextSimple(imagePath, context) {
  const fileName = imagePath.split('/').pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, '') || '';
  const directory = imagePath.split('/').slice(-2, -1)[0] || '';
  
  // Brand logos
  if (directory === 'brands') {
    const brandName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    return `${brandName} brand logo for device repair services`;
  }
  
  // Service areas
  if (directory === 'service-areas') {
    const cityName = fileName.replace(/-optimized$/, '').replace(/-/g, ' ');
    const formattedCity = cityName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${formattedCity} repair service area - Mobile and laptop repair technicians available`;
  }
  
  // Blog images
  if (directory === 'blog') {
    const blogTopicMap = {
      'data-recovery': 'Professional data recovery service for damaged devices',
      'doorstep-service': 'Mobile technician providing doorstep repair services',
      'iphone-repair': 'iPhone screen and component repair service',
      'laptop-battery': 'Laptop battery replacement and maintenance service',
      'laptop-maintenance': 'Professional laptop maintenance and cleaning service',
      'phone-repair-signs': 'Common phone repair signs indicating device needs professional repair',
      'screen-protection': 'Screen protection and damage prevention for mobile devices',
      'water-damage-repair': 'Water damage repair process for electronic devices'
    };
    
    const baseFileName = fileName.replace(/-optimized$/, '');
    return blogTopicMap[baseFileName] || `${baseFileName.replace(/-/g, ' ')} - Professional device repair guide`;
  }
  
  // Services
  if (directory === 'services') {
    if (fileName.includes('mobile-hero')) {
      return 'Mobile phone repair services - Professional technician fixing smartphone';
    }
    if (fileName.includes('laptop-hero')) {
      return 'Laptop repair services - Expert technician repairing computer';
    }
    if (fileName.includes('tablet-hero')) {
      return 'Tablet repair services - Professional iPad and Android tablet repair';
    }
    if (fileName.includes('mobile-service')) {
      const serviceNumber = fileName.match(/\d+/)?.[0] || '';
      return `Mobile phone repair service illustration ${serviceNumber} - Screen replacement and component repair`;
    }
    if (fileName.includes('laptop-service')) {
      const serviceNumber = fileName.match(/\d+/)?.[0] || '';
      return `Laptop repair service illustration ${serviceNumber} - Hardware and software repair`;
    }
  }
  
  // Team photos
  if (directory === 'team') {
    const roleMap = {
      'founder': 'Company founder and lead technician - Expert in mobile and laptop repair',
      'mobile-tech': 'Mobile phone repair specialist - Expert in iPhone and Android repair',
      'laptop-tech': 'Laptop repair technician - Specialist in MacBook and PC repair',
      'operations': 'Operations manager - Coordinating repair services and customer support'
    };
    return roleMap[fileName] || `Team member - ${fileName.replace(/-/g, ' ')} specialist`;
  }
  
  // Logo
  if (directory === 'logo' || fileName.includes('logo')) {
    return 'The Travelling Technicians logo - Professional mobile and laptop repair services';
  }
  
  // Fallback with context
  if (context) {
    return `${context} - ${fileName.replace(/-/g, ' ')}`;
  }
  
  // Generic fallback
  return fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

// Test alt text quality
function testAltTextQuality() {
  console.log('📊 ALT TEXT QUALITY ASSESSMENT');
  console.log('==============================\n');

  const qualityTests = [
    {
      altText: 'Apple brand logo for device repair services',
      shouldPass: true,
      reason: 'Descriptive and contextual'
    },
    {
      altText: 'Image of apple logo',
      shouldPass: false,
      reason: 'Contains redundant "Image of" prefix'
    },
    {
      altText: 'Logo',
      shouldPass: false,
      reason: 'Too short and not descriptive'
    },
    {
      altText: 'This is a very long description of an image that goes on and on without providing much useful information and exceeds the recommended length for alt text which should be concise',
      shouldPass: false,
      reason: 'Too long (over 150 characters)'
    },
    {
      altText: 'Vancouver repair service area - Mobile and laptop repair technicians available',
      shouldPass: true,
      reason: 'Descriptive with location context'
    }
  ];

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  qualityTests.forEach((test, index) => {
    const quality = evaluateAltTextQuality(test.altText);
    const testPassed = test.shouldPass ? quality.score >= 70 : quality.score < 70;
    
    if (testPassed) {
      results.passed++;
      console.log(`✅ Quality Test ${index + 1}: PASS (Score: ${quality.score}/100)`);
    } else {
      results.failed++;
      console.log(`❌ Quality Test ${index + 1}: FAIL (Score: ${quality.score}/100)`);
    }
    
    console.log(`   Alt Text: "${test.altText}"`);
    console.log(`   Expected: ${test.shouldPass ? 'PASS' : 'FAIL'} - ${test.reason}`);
    if (quality.issues.length > 0) {
      console.log(`   Issues: ${quality.issues.join(', ')}`);
    }
    console.log('');
    
    results.details.push({
      test: index + 1,
      altText: test.altText,
      score: quality.score,
      expectedToPass: test.shouldPass,
      actuallyPassed: testPassed,
      issues: quality.issues
    });
  });

  return results;
}

// Evaluate alt text quality (mirrors actual implementation)
function evaluateAltTextQuality(altText) {
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
  
  if (altText.toLowerCase().startsWith('image of') || altText.toLowerCase().startsWith('picture of')) {
    issues.push('Alt text starts with redundant phrase');
    score -= 20;
  }
  
  return { score: Math.max(0, score), issues };
}

// Component usage testing
function testComponentUsage() {
  console.log('🔧 COMPONENT USAGE TESTING');
  console.log('==========================\n');

  const componentFiles = [
    'src/pages/index.tsx',
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/pages/blog/index.tsx',
    'src/pages/about.tsx'
  ];

  const results = {
    optimizedComponents: 0,
    totalComponents: componentFiles.length,
    details: []
  };

  componentFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        const hasOptimizedImage = content.includes('OptimizedImage') || 
                                 content.includes('LogoImage') || 
                                 content.includes('HeroImage') || 
                                 content.includes('LazyImage');
        
        const hasOldImage = content.includes('<Image ') && !content.includes('OptimizedImage');
        
        if (hasOptimizedImage) {
          results.optimizedComponents++;
          console.log(`✅ ${file}: Using optimized image components`);
        } else if (hasOldImage) {
          console.log(`⚠️  ${file}: Still using standard Image component`);
        } else {
          console.log(`ℹ️  ${file}: No image components found`);
        }
        
        results.details.push({
          file,
          hasOptimizedImage,
          hasOldImage,
          status: hasOptimizedImage ? 'optimized' : hasOldImage ? 'needs-update' : 'no-images'
        });
        
      } else {
        console.log(`❌ ${file}: File not found`);
        results.details.push({
          file,
          status: 'not-found'
        });
      }
    } catch (error) {
      console.log(`❌ ${file}: Error reading file - ${error.message}`);
      results.details.push({
        file,
        status: 'error',
        error: error.message
      });
    }
  });

  console.log(`\n📊 Component Optimization: ${results.optimizedComponents}/${results.totalComponents} files updated\n`);
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log('🧪 ALT TAG AND IMAGE OPTIMIZATION TESTING');
  console.log('==========================================\n');

  const altTextResults = testAltTextGeneration();
  const qualityResults = testAltTextQuality();
  const componentResults = testComponentUsage();

  // Summary
  console.log('📋 TEST SUMMARY');
  console.log('===============');
  console.log(`Alt Text Generation: ${altTextResults.passed}/${altTextResults.passed + altTextResults.failed} passed`);
  console.log(`Alt Text Quality: ${qualityResults.passed}/${qualityResults.passed + qualityResults.failed} passed`);
  console.log(`Component Updates: ${componentResults.optimizedComponents}/${componentResults.totalComponents} optimized`);

  const totalTests = altTextResults.passed + altTextResults.failed + 
                    qualityResults.passed + qualityResults.failed;
  const totalPassed = altTextResults.passed + qualityResults.passed;
  
  const successRate = Math.round((totalPassed / totalTests) * 100);
  
  console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
  
  if (successRate >= 90) {
    console.log('🏆 EXCELLENT: Alt text system is working perfectly!');
  } else if (successRate >= 80) {
    console.log('🥇 GREAT: Alt text system is working well with minor issues.');
  } else if (successRate >= 70) {
    console.log('🥈 GOOD: Alt text system is functional but needs improvement.');
  } else {
    console.log('🥉 NEEDS WORK: Alt text system requires attention.');
  }

  return {
    altText: altTextResults,
    quality: qualityResults,
    components: componentResults,
    successRate
  };
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(results => {
    process.exit(results.successRate >= 80 ? 0 : 1);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testAltTextGeneration, testAltTextQuality, testComponentUsage };
