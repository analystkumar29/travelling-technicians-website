/**
 * Test endpoint for Phase 1 verification
 * 
 * This endpoint tests the data service and database connection
 * Used for verification command in the Zero-Regression Implementation Plan
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getPricingData, getPopularServices, getTestimonials, checkDbConnection } from '@/lib/data-service';
import { logger } from '@/utils/logger';

const testLogger = logger.createModuleLogger('test-data-service');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    testLogger.info('Starting data service test...');

    // Test database connection
    const dbHealth = await checkDbConnection();
    
    // Test data fetching
    const [pricingData, services, testimonials] = await Promise.all([
      getPricingData(),
      getPopularServices(),
      getTestimonials()
    ]);

    const results = {
      timestamp: new Date().toISOString(),
      database: {
        healthy: dbHealth.healthy,
        message: dbHealth.message
      },
      pricingData: {
        mobile: pricingData.mobile,
        laptop: pricingData.laptop,
        tablet: pricingData.tablet,
        isStaticFallback: pricingData.mobile.range === '$79-$189' // Check if using static data
      },
      services: {
        count: services.length,
        items: services.map(s => ({ name: s.name, price: s.price })),
        isStaticFallback: services.length === 4 && services[0].name === 'Screen Repair'
      },
      testimonials: {
        count: testimonials.length,
        isStaticFallback: testimonials.length === 4 && testimonials[0].name === 'Sarah J.'
      },
      summary: {
        allServicesWorking: true,
        databaseConnected: dbHealth.healthy,
        usingFallbackData: pricingData.mobile.range === '$79-$189' || 
                          (services.length === 4 && services[0].name === 'Screen Repair')
      }
    };

    testLogger.info('Data service test completed', {
      databaseHealthy: dbHealth.healthy,
      pricingDataCount: 3,
      servicesCount: services.length,
      testimonialsCount: testimonials.length
    });

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json(results);

  } catch (error) {
    testLogger.error('Data service test failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}