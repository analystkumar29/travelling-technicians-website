import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';

const envLogger = logger.createModuleLogger('env-debug');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Collect all environment variables
    const allEnvVars = process.env;
    
    // Find variables containing url6811
    const url6811Vars: Record<string, string> = {};
    const otherVars: Record<string, string> = {};
    
    Object.keys(allEnvVars).forEach(key => {
      const value = allEnvVars[key];
      if (value && value.includes('url6811')) {
        url6811Vars[key] = value;
      } else if (value && (key.includes('URL') || key.includes('SITE') || key.includes('DOMAIN'))) {
        otherVars[key] = value;
      }
    });
    
    // Check for specific URL-related variables
    const urlVars = {
      NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
      NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    const debugData = {
      timestamp: new Date().toISOString(),
      url6811Variables: {
        count: Object.keys(url6811Vars).length,
        variables: url6811Vars,
        recommendations: Object.keys(url6811Vars).length > 0 ? [
          '🚨 CRITICAL: Found environment variables containing url6811',
          'These must be removed from Vercel environment variables',
          'Check Vercel dashboard → Project Settings → Environment Variables'
        ] : ['✅ No url6811 variables found']
      },
      urlRelatedVariables: urlVars,
      otherUrlVariables: otherVars,
      environmentAnalysis: {
        isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
        usesCustomDomain: process.env.NEXT_PUBLIC_WEBSITE_URL?.includes('travelling-technicians.ca'),
        hasUrl6811: Object.keys(url6811Vars).length > 0,
        totalEnvVars: Object.keys(allEnvVars).length,
        url6811VarNames: Object.keys(url6811Vars)
      }
    };

    envLogger.info('Environment Debug Check', debugData);

    res.status(200).json({
      success: true,
      message: 'Environment variable debug information',
      data: debugData,
      actionItems: Object.keys(url6811Vars).length > 0 ? [
        '1. Go to Vercel dashboard → Project Settings → Environment Variables',
        '2. Find and delete any variable containing "url6811"',
        '3. Redeploy the application',
        '4. Test email links again'
      ] : [
        '✅ No url6811 variables found in environment',
        'If emails still have wrong URLs, check:',
        '1. SendGrid template caching',
        '2. Browser caching of old emails',
        '3. Create a NEW test booking to verify'
      ]
    });
    
  } catch (error: any) {
    envLogger.error('Error in environment debug endpoint:', {
      error: error.message || 'Unknown error'
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate environment debug information',
      error: error.message
    });
  }
}