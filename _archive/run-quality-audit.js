#!/usr/bin/env node

/**
 * Script to run quality audit on existing device models
 * and update their quality scores based on contamination patterns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Contamination patterns to detect
const CONTAMINATION_PATTERNS = [
  { pattern: /QV\d+/i, name: 'Technical code (QV#)' },
  { pattern: /\bV\d+\b/i, name: 'Version code (V#)' },
  { pattern: /CE\d+/i, name: 'CE code' },
  { pattern: /\bT\d+\b/i, name: 'T code' },
  { pattern: /\b(Premium|Standard|Economy|Compatible|Assembly|Aftermarket|OEM|Original)\b/i, name: 'Quality indicator' },
  { pattern: /\b(LCD|OLED|Screen|Display|Battery|Assembly|Replacement)\b/i, name: 'Part descriptor' },
  { pattern: /35[GH]00\d{3}/, name: 'Google part number' },
  { pattern: /^\d+$/, name: 'Just numbers' },
  { pattern: /^[A-Z]$/i, name: 'Single letter' },
  { pattern: /\(\d{4}\)/, name: 'Year in parentheses' },
  { pattern: /\(Version\s*\d+\)/i, name: 'Version indicator' },
  { pattern: /\((With|Without)\s*Frame\)/i, name: 'Frame indicator' },
  { pattern: /IC\s*Transfer/i, name: 'IC Transfer' },
  
  // NEW PATTERNS ADDED AFTER DATA QUALITY AUDIT
  { pattern: /^unknown$/i, name: 'Generic "unknown" name' },
  { pattern: /^\s*$/, name: 'Empty or whitespace-only' },
  { pattern: /^(null|undefined|n\/a|none)$/i, name: 'Null-type value' },
  { pattern: /^.{1,2}$/, name: 'Too short (1-2 chars)' },
  
  // Device type mismatches (for mobile category)
  { pattern: /\bipad\b/i, name: 'iPad in mobile category' },
  { pattern: /\bmacbook\b/i, name: 'MacBook in mobile category' },
  { pattern: /\bimac\b/i, name: 'iMac in mobile category' },
  { pattern: /\bwatch\b/i, name: 'Watch in mobile category' },
  { pattern: /\bairpods\b/i, name: 'AirPods in mobile category' }
];

function detectContamination(modelName) {
  const reasons = [];
  
  CONTAMINATION_PATTERNS.forEach(({ pattern, name }) => {
    if (pattern.test(modelName)) {
      reasons.push(name);
    }
  });
  
  return reasons;
}

async function runQualityAudit() {
  console.log('🔍 Running quality audit on device models...\n');

  try {
    // Fetch all active models
    const { data: models, error } = await supabase
      .from('device_models')
      .select('id, name, quality_score, data_source, needs_review')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching models:', error.message);
      return;
    }

    console.log(`📊 Found ${models.length} active models\n`);

    const contaminatedModels = [];
    const updateBatch = [];

    // Analyze each model
    models.forEach(model => {
      const contamination = detectContamination(model.name);
      
      if (contamination.length > 0) {
        contaminatedModels.push({
          id: model.id,
          name: model.name,
          issues: contamination,
          current_score: model.quality_score
        });

        // Prepare update if not already flagged
        if (model.quality_score > 50 || !model.needs_review) {
          updateBatch.push({
            id: model.id,
            quality_score: 50,
            needs_review: true,
            data_source: model.data_source === 'manual' ? model.data_source : 'scraped'
          });
        }
      }
    });

    console.log(`🚨 Found ${contaminatedModels.length} contaminated models\n`);

    // Display contaminated models
    if (contaminatedModels.length > 0) {
      console.log('Contaminated Models:');
      console.log('===================');
      contaminatedModels.slice(0, 20).forEach(model => {
        console.log(`\n📱 ${model.name}`);
        console.log(`   Current Score: ${model.current_score}`);
        console.log(`   Issues: ${model.issues.join(', ')}`);
      });
      
      if (contaminatedModels.length > 20) {
        console.log(`\n... and ${contaminatedModels.length - 20} more\n`);
      }
    }

    // Ask for confirmation to update
    if (updateBatch.length > 0) {
      console.log(`\n⚠️  ${updateBatch.length} models need quality score updates`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('\nDo you want to update these models? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          console.log('\n🔄 Updating quality scores...');
          
          // Update in batches
          const batchSize = 100;
          let updated = 0;
          
          for (let i = 0; i < updateBatch.length; i += batchSize) {
            const batch = updateBatch.slice(i, i + batchSize);
            
            for (const update of batch) {
              const { error: updateError } = await supabase
                .from('device_models')
                .update({
                  quality_score: update.quality_score,
                  needs_review: update.needs_review,
                  data_source: update.data_source
                })
                .eq('id', update.id);
              
              if (updateError) {
                console.error(`❌ Error updating model ${update.id}:`, updateError.message);
              } else {
                updated++;
              }
            }
            
            console.log(`   Updated ${updated}/${updateBatch.length} models...`);
          }
          
          console.log(`\n✅ Successfully updated ${updated} models`);
        } else {
          console.log('\n❌ Update cancelled');
        }
        
        readline.close();
        
        // Show summary
        console.log('\n📊 Quality Audit Summary:');
        console.log('========================');
        console.log(`Total Models: ${models.length}`);
        console.log(`Contaminated: ${contaminatedModels.length} (${((contaminatedModels.length / models.length) * 100).toFixed(1)}%)`);
        console.log(`Clean: ${models.length - contaminatedModels.length} (${(((models.length - contaminatedModels.length) / models.length) * 100).toFixed(1)}%)`);
      });
    } else {
      console.log('\n✅ No models need updating - all contaminated models already flagged');
      
      // Show summary
      console.log('\n📊 Quality Audit Summary:');
      console.log('========================');
      console.log(`Total Models: ${models.length}`);
      console.log(`Contaminated: ${contaminatedModels.length} (${((contaminatedModels.length / models.length) * 100).toFixed(1)}%)`);
      console.log(`Clean: ${models.length - contaminatedModels.length} (${(((models.length - contaminatedModels.length) / models.length) * 100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the audit
runQualityAudit();
