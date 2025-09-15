#!/usr/bin/env node

/**
 * Legal Compliance Audit
 * Checks for unauthorized brand claims and trademark issues
 */

const fs = require('fs');
const path = require('path');

console.log('⚖️  LEGAL COMPLIANCE AUDIT');
console.log('==========================\n');

// Problematic terms that could imply official authorization
const problematicTerms = [
  // Authorization claims
  'authorized service provider',
  'authorized dealer',
  'certified repair partner',
  'official partner',
  'licensed by',
  'approved by',
  'endorsed by',
  'certified by apple',
  'certified by samsung',
  'apple authorized',
  'samsung authorized',
  'official apple',
  'official samsung',
  
  // Partnership claims
  'partner with apple',
  'partner with samsung',
  'apple certified',
  'samsung certified',
  'factory authorized',
  'manufacturer approved'
];

// Safe alternatives
const safeAlternatives = {
  'authorized service provider': 'independent repair service',
  'certified repair partner': 'specialized repair service',
  'official apple': 'apple device',
  'official samsung': 'samsung device',
  'apple authorized': 'apple device repair trained',
  'samsung authorized': 'samsung device repair trained',
  'apple certified': 'apple device repair experienced',
  'samsung certified': 'samsung device repair experienced'
};

// Files to audit
const filesToAudit = [
  'src/utils/imageHelpers.ts',
  'src/components/seo/StructuredData.tsx',
  'scripts/optimize-certification-images.js',
  'scripts/test-image-alt-tags.js',
  'IMAGE_OPTIMIZATION_100_SUMMARY.md',
  'IMAGE_OPTIMIZATION_COMPLETE.md'
];

function auditFile(filePath) {
  console.log(`🔍 Auditing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return { issues: [], suggestions: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
  const issues = [];
  const suggestions = [];
  
  problematicTerms.forEach(term => {
    if (content.includes(term.toLowerCase())) {
      issues.push({
        term,
        severity: 'HIGH',
        file: filePath,
        alternative: safeAlternatives[term] || 'Consider rephrasing to avoid authorization claims'
      });
    }
  });
  
  // Check for specific brand trademark issues
  const brandChecks = [
    { pattern: /apple.*authorized/gi, issue: 'Implies Apple authorization' },
    { pattern: /samsung.*authorized/gi, issue: 'Implies Samsung authorization' },
    { pattern: /certified.*apple/gi, issue: 'Implies Apple certification' },
    { pattern: /certified.*samsung/gi, issue: 'Implies Samsung certification' },
    { pattern: /official.*apple/gi, issue: 'Implies official Apple relationship' },
    { pattern: /official.*samsung/gi, issue: 'Implies official Samsung relationship' }
  ];
  
  brandChecks.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          term: match,
          severity: 'HIGH',
          file: filePath,
          issue: check.issue,
          alternative: 'Use "experienced with" or "trained for" instead'
        });
      });
    }
  });
  
  if (issues.length === 0) {
    console.log('   ✅ No legal compliance issues found');
  } else {
    console.log(`   ❌ Found ${issues.length} potential legal issues:`);
    issues.forEach((issue, index) => {
      console.log(`      ${index + 1}. "${issue.term}" - ${issue.issue || 'Authorization claim'}`);
      console.log(`         Suggested: ${issue.alternative}`);
    });
  }
  
  console.log('');
  return { issues, suggestions };
}

function generateComplianceReport() {
  console.log('📋 LEGAL COMPLIANCE REPORT');
  console.log('==========================\n');
  
  let totalIssues = 0;
  const auditResults = [];
  
  filesToAudit.forEach(file => {
    const result = auditFile(file);
    totalIssues += result.issues.length;
    auditResults.push({ file, ...result });
  });
  
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`Total files audited: ${filesToAudit.length}`);
  console.log(`Total legal issues found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('✅ COMPLIANCE: All files are legally compliant!');
  } else {
    console.log('❌ LEGAL RISKS: Issues found that need attention');
    
    console.log('\n🚨 HIGH PRIORITY FIXES NEEDED:');
    auditResults.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`\n📁 ${result.file}:`);
        result.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. Replace: "${issue.term}"`);
          console.log(`      With: "${issue.alternative}"`);
        });
      }
    });
  }
  
  console.log('\n💡 SAFE LANGUAGE GUIDELINES:');
  console.log('============================');
  console.log('✅ SAFE: "Technical training for Apple devices"');
  console.log('✅ SAFE: "Experienced with Samsung repairs"');
  console.log('✅ SAFE: "Specialized in iPhone repair"'); 
  console.log('✅ SAFE: "Professional Galaxy device service"');
  console.log('✅ SAFE: "Independent repair service"');
  console.log('✅ SAFE: "Third-party repair specialist"');
  console.log('');
  console.log('❌ AVOID: "Apple Authorized Service Provider"');
  console.log('❌ AVOID: "Samsung Certified Partner"');
  console.log('❌ AVOID: "Official Apple repair"');
  console.log('❌ AVOID: "Licensed Samsung service"');
  
  return totalIssues;
}

function createSafeTextSuggestions() {
  console.log('\n🛡️  LEGALLY SAFE TEXT SUGGESTIONS');
  console.log('==================================');
  
  const suggestions = {
    certifications: {
      apple: 'Technical training certification for Apple device repair services',
      samsung: 'Technical training certification for Samsung device repair services',
      general: 'Professional technical certification for mobile device repairs'
    },
    services: {
      apple: 'Professional iPhone, iPad, and MacBook repair services',
      samsung: 'Expert Galaxy smartphone and tablet repair services',
      general: 'Independent mobile and laptop repair services'
    },
    expertise: {
      apple: 'Experienced technicians trained in Apple device repair',
      samsung: 'Skilled professionals specializing in Samsung device repair',
      general: 'Qualified technicians with multi-brand device experience'
    }
  };
  
  Object.entries(suggestions).forEach(([category, items]) => {
    console.log(`\n📝 ${category.toUpperCase()}:`);
    Object.entries(items).forEach(([brand, text]) => {
      console.log(`   ${brand}: "${text}"`);
    });
  });
}

// Main execution
function main() {
  const issueCount = generateComplianceReport();
  createSafeTextSuggestions();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  if (issueCount > 0) {
    console.log('1. Fix all identified legal compliance issues');
    console.log('2. Review all marketing materials for similar issues');
    console.log('3. Consult legal counsel if unsure about any language');
  } else {
    console.log('1. ✅ Legal compliance is good');
    console.log('2. Continue using safe language patterns');
    console.log('3. Regular audits recommended');
  }
  
  console.log('\n⚖️  LEGAL COMPLIANCE AUDIT COMPLETE');
  return issueCount;
}

if (require.main === module) {
  const issues = main();
  process.exit(issues > 0 ? 1 : 0);
}

module.exports = { main };
