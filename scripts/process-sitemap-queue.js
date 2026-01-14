#!/usr/bin/env node

// Sitemap Regeneration Queue Processor
// 
// This script processes the sitemap_regeneration_queue table and calls
// the webhook endpoint to regenerate the sitemap cache.
// 
// Run as a cron job every 5 minutes:
// Example: 0,5,10,15,20,25,30,35,40,45,50,55 * * * * 
// Command: cd /Users/manojkumar/WEBSITE && node scripts/process-sitemap-queue.js

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ussjnyphwtmhpovmahnb.supabase.co',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  webhookUrl: process.env.SITEMAP_WEBHOOK_URL || 'https://travelling-technicians.ca/api/webhooks/sitemap-regenerate',
  // For local testing: 'http://localhost:3000/api/webhooks/sitemap-regenerate'
  batchSize: 10,
  maxRetries: 3
};

// Validate configuration
if (!config.supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Process pending queue items
 */
async function processQueue() {
  console.log('🔄 Starting sitemap regeneration queue processing...');
  
  try {
    // Get pending queue items
    const { data: queueItems, error: fetchError } = await supabase
      .from('sitemap_regeneration_queue')
      .select('*')
      .eq('status', 'pending')
      .order('triggered_at', { ascending: true })
      .limit(config.batchSize);
    
    if (fetchError) {
      throw new Error(`Failed to fetch queue items: ${fetchError.message}`);
    }
    
    if (!queueItems || queueItems.length === 0) {
      console.log('✅ No pending queue items to process');
      return { processed: 0, failed: 0 };
    }
    
    console.log(`📋 Found ${queueItems.length} pending queue items`);
    
    let processedCount = 0;
    let failedCount = 0;
    
    // Process each queue item
    for (const item of queueItems) {
      console.log(`🔧 Processing queue item ${item.id} for table ${item.table_name}...`);
      
      try {
        // Update status to processing
        const { error: updateError } = await supabase
          .from('sitemap_regeneration_queue')
          .update({
            status: 'processing',
            attempts: item.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        if (updateError) {
          throw new Error(`Failed to update queue item status: ${updateError.message}`);
        }
        
        // Call the webhook endpoint
        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.supabaseKey}`,
            'X-Sitemap-Queue-Id': item.id.toString()
          },
          body: JSON.stringify({
            table: item.table_name,
            operation: item.operation,
            recordId: item.record_id,
            oldRecordId: item.old_record_id,
            schema: item.schema_name,
            timestamp: item.triggered_at,
            queueId: item.id
          }),
          timeout: 30000 // 30 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(`Webhook reported failure: ${result.message || 'Unknown error'}`);
        }
        
        // Mark as completed
        await supabase
          .from('sitemap_regeneration_queue')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        console.log(`✅ Successfully processed queue item ${item.id}`);
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to process queue item ${item.id}:`, error.message);
        
        // Check if we should retry or mark as failed
        const attempts = item.attempts + 1;
        const status = attempts >= config.maxRetries ? 'failed' : 'pending';
        
        await supabase
          .from('sitemap_regeneration_queue')
          .update({
            status,
            error_message: error.message,
            attempts,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        failedCount++;
      }
    }
    
    console.log(`📊 Processing complete: ${processedCount} processed, ${failedCount} failed`);
    return { processed: processedCount, failed: failedCount };
    
  } catch (error) {
    console.error('❌ Fatal error processing queue:', error);
    return { processed: 0, failed: 0, error: error.message };
  }
}

/**
 * Clean up old completed queue items (older than 7 days)
 */
async function cleanupOldQueueItems() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('sitemap_regeneration_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('triggered_at', sevenDaysAgo.toISOString());
    
    if (error) {
      console.error('❌ Failed to cleanup old queue items:', error.message);
      return 0;
    }
    
    if (data && data.length > 0) {
      console.log(`🧹 Cleaned up ${data.length} old queue items`);
      return data.length;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    return 0;
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  try {
    const { data, error } = await supabase
      .from('sitemap_regeneration_status')
      .select('*');
    
    if (error) {
      throw new Error(`Failed to get queue stats: ${error.message}`);
    }
    
    console.log('📊 Current queue statistics:');
    data?.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count} items`);
      if (stat.status === 'pending') {
        console.log(`    Oldest: ${stat.oldest_pending}`);
        console.log(`    Newest: ${stat.newest_pending}`);
      }
    });
    
    return data;
  } catch (error) {
    console.error('❌ Failed to get queue statistics:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Sitemap Regeneration Queue Processor');
  console.log('=======================================');
  
  // Get current stats
  await getQueueStats();
  
  // Process the queue
  const result = await processQueue();
  
  // Cleanup old items
  const cleaned = await cleanupOldQueueItems();
  
  // Get updated stats
  await getQueueStats();
  
  console.log('=======================================');
  console.log(`🎯 Summary:`);
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Cleaned up: ${cleaned}`);
  
  if (result.error) {
    console.error(`  Error: ${result.error}`);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error in main:', error);
    process.exit(1);
  });
}

module.exports = {
  processQueue,
  cleanupOldQueueItems,
  getQueueStats
};