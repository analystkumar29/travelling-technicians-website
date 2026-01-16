#!/usr/bin/env node

/**
 * Script to populate review queue with existing models that need review
 * This helps bootstrap the review system with current contaminated models
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateReviewQueue() {
  console.log('🔍 Populating review queue with models needing review...\n');

  try {
    // Get all models that need review
    const { data: modelsNeedingReview, error: modelsError } = await supabase
      .from('device_models')
      .select('id, name, quality_score, needs_review, data_source')
      .eq('is_active', true)
      .eq('needs_review', true);

    if (modelsError) {
      console.error('❌ Error fetching models:', modelsError.message);
      return;
    }

    console.log(`📱 Found ${modelsNeedingReview.length} models needing review\n`);

    if (modelsNeedingReview.length === 0) {
      console.log('✅ No models need review at this time');
      return;
    }

    // Check which models already have review queue entries
    const modelIds = modelsNeedingReview.map(m => m.id);
    const { data: existingReviews, error: reviewsError } = await supabase
      .from('review_queue')
      .select('record_id')
      .eq('table_name', 'device_models')
      .eq('review_type', 'quality_check')
      .in('record_id', modelIds)
      .in('status', ['pending', 'in_review']);

    if (reviewsError) {
      console.error('❌ Error checking existing reviews:', reviewsError.message);
      return;
    }

    const existingReviewIds = new Set(existingReviews.map(r => r.record_id));
    const modelsToAdd = modelsNeedingReview.filter(m => !existingReviewIds.has(m.id));

    console.log(`📋 ${modelsToAdd.length} models need to be added to review queue\n`);

    if (modelsToAdd.length === 0) {
      console.log('✅ All models already in review queue');
      return;
    }

    // Prepare review queue entries
    const reviewEntries = modelsToAdd.map(model => {
      // Determine priority based on quality score and data source
      let priority = 'normal';
      if (model.quality_score < 30) {
        priority = 'critical';
      } else if (model.quality_score < 50) {
        priority = 'high';
      } else if (model.data_source === 'scraped') {
        priority = 'normal';
      } else {
        priority = 'low';
      }

      return {
        table_name: 'device_models',
        record_id: model.id,
        review_type: 'quality_check',
        priority: priority,
        status: 'pending',
        created_by: 'system',
        review_notes: `Model "${model.name}" requires quality review`,
        review_data: {
          current_quality_score: model.quality_score,
          data_source: model.data_source,
          suggested_quality_score: model.quality_score < 50 ? 50 : model.quality_score,
          contamination_detected: model.quality_score < 70
        }
      };
    });

    // Insert review entries in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < reviewEntries.length; i += batchSize) {
      const batch = reviewEntries.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('review_queue')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError.message);
      } else {
        inserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} items`);
      }
    }

    console.log(`\n📊 Review Queue Population Summary:`);
    console.log('=====================================');
    console.log(`Models needing review: ${modelsNeedingReview.length}`);
    console.log(`Already in queue: ${existingReviewIds.size}`);
    console.log(`Added to queue: ${inserted}`);
    console.log(`Failed to add: ${modelsToAdd.length - inserted}`);

    // Show priority breakdown
    const priorityBreakdown = reviewEntries.reduce((acc, entry) => {
      acc[entry.priority] = (acc[entry.priority] || 0) + 1;
      return acc;
    }, {});

    console.log('\nPriority Breakdown:');
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} items`);
    });

    // Also populate data lineage for existing models
    console.log('\n🔗 Populating data lineage...');
    await populateDataLineage(modelsNeedingReview);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function populateDataLineage(models) {
  try {
    const lineageEntries = models.map(model => ({
      table_name: 'device_models',
      record_id: model.id,
      source_system: model.data_source || 'unknown',
      quality_score: model.quality_score,
      confidence_score: model.quality_score / 100,
      validation_status: model.needs_review ? 'needs_review' : 'pending',
      metadata: {
        name: model.name,
        quality_issues: model.quality_score < 70 ? ['contaminated_name'] : []
      }
    }));

    const { error: lineageError } = await supabase
      .from('data_lineage')
      .upsert(lineageEntries, {
        onConflict: 'table_name,record_id'
      });

    if (lineageError) {
      console.error('❌ Error populating data lineage:', lineageError.message);
    } else {
      console.log(`✅ Updated data lineage for ${lineageEntries.length} models`);
    }
  } catch (error) {
    console.error('❌ Error in data lineage population:', error);
  }
}

// Run the script
populateReviewQueue();
