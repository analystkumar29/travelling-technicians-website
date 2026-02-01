import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';

const debugLogger = logger.createModuleLogger('url-debug');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 🔧 ROBUST URL GENERATION - Same logic as email APIs
    function getBaseUrl(): string {
      // In production, always use the custom domain
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        return 'https://www.travelling-technicians.ca';
      }
      
      // Try multiple environment variables in order of preference
      const possibleUrls = [
        process.env.NEXT_PUBLIC_WEBSITE_URL,
        process.env.NEXT_PUBLIC_FRONTEND_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        // If on Vercel but not production (preview/deployment)
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        // Fallback for local development
        'http://localhost:3000'
      ];
      
      // Find the first valid URL
      const validUrl = possibleUrls.find(url => url && !url.includes('url6811'));
      return validUrl || 'http://localhost:3000';
    }
    
    const baseUrl = getBaseUrl();
    
    // Generate test URLs
    const testToken = 'test-token-123';
    const testReference = 'TEST-REF-456';
    const verificationUrl = `${baseUrl}/verify-booking?token=${testToken}&reference=${testReference}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking?token=${testToken}&reference=${testReference}`;

    const debugData = {
      generatedUrls: {
        baseUrl,
        verificationUrl,
        rescheduleUrl
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
        NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        // Check for url6811 in any environment variable
        hasUrl6811: Object.keys(process.env).some(key => 
          process.env[key]?.includes('url6811')
        )
      },
      urlAnalysis: {
        isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
        usesCustomDomain: baseUrl.includes('travelling-technicians.ca'),
        usesUrl6811: baseUrl.includes('url6811'),
        isHttps: baseUrl.startsWith('https://'),
        isValidForEmail: !baseUrl.includes('url6811') && baseUrl.startsWith('https://')
      },
      timestamp: new Date().toISOString(),
      deploymentInfo: {
        region: process.env.VERCEL_REGION,
        gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
        gitRepo: process.env.VERCEL_GIT_REPO_SLUG
      }
    };

    debugLogger.info('URL Debug Check', debugData);

    res.status(200).json({
      success: true,
      message: 'URL generation debug information',
      data: debugData,
      recommendations: debugData.urlAnalysis.usesUrl6811 ? [
        '⚠️ WARNING: URL generation is using url6811.travelling-technicians.ca',
        'This will cause SSL warnings for customers',
        'Check environment variables in Vercel dashboard',
        'Ensure NEXT_PUBLIC_WEBSITE_URL and NEXT_PUBLIC_FRONTEND_URL are set to https://www.travelling-technicians.ca'
      ] : debugData.urlAnalysis.isValidForEmail ? [
        '✅ SUCCESS: URL generation is using correct domain',
        'Email links will work without SSL warnings'
      ] : [
        '⚠️ WARNING: URL generation may have issues',
        'Check that HTTPS is being used in production'
      ]
    });
    
  } catch (error: any) {
    debugLogger.error('Error in URL debug endpoint:', {
      error: error.message || 'Unknown error'
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate debug information',
      error: error.message
    });
  }
}