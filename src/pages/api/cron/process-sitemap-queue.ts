import type { NextApiRequest, NextApiResponse } from 'next';

// Import the queue processor function
// Note: We need to handle the CommonJS module import
async function importQueueProcessor() {
  try {
    // Dynamic import for CommonJS module
    const module = await import('../../../../scripts/process-sitemap-queue');
    return module;
  } catch (error) {
    console.error('Failed to import queue processor:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  // Verify cron secret for security
  const cronSecret = req.headers['x-vercel-cron-secret'] || req.headers['x-cron-secret'];
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret) {
    console.error('CRON_SECRET environment variable not set');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'CRON_SECRET not configured'
    });
  }

  if (cronSecret !== expectedSecret) {
    console.warn('Unauthorized cron job attempt');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing cron secret'
    });
  }

  try {
    console.log('Starting sitemap queue processing via Vercel Cron...');
    console.log('Request IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    console.log('User Agent:', req.headers['user-agent']);
    
    // Import and run the queue processor
    const module = await importQueueProcessor();
    
    // The queue processor exports: processQueue, cleanupOldQueueItems, getQueueStats
    // We'll run the main processing logic
    const processResult = await module.processQueue();
    const cleanupResult = await module.cleanupOldQueueItems();
    const stats = await module.getQueueStats();
    
    console.log('Sitemap queue processing completed:', processResult);
    
    res.status(200).json({
      success: true,
      message: 'Sitemap queue processed successfully',
      timestamp: new Date().toISOString(),
      result: {
        processed: processResult.processed,
        failed: processResult.failed,
        cleaned: cleanupResult,
        stats: stats
      }
    });
  } catch (error) {
    console.error('Error processing sitemap queue:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
}

// Configuration for Vercel serverless function
export const config = {
  api: {
    bodyParser: false, // We don't need body parsing for cron jobs
    externalResolver: true, // Let Vercel handle request/response
  },
};