import { useEffect } from 'react';
import { logger } from '@/utils/logger';
import { applyAllRouterFixes } from '@/utils/fix-router-errors.js';

// Create module logger
const routerErrorLogger = logger?.createModuleLogger 
  ? logger.createModuleLogger('RouterErrorHandler') 
  : { debug: console.debug, error: console.error };

/**
 * This component applies direct patches to Next.js router files
 * to fix "Cannot read properties of undefined (reading 'data')" errors
 */
const RouterErrorHandler: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    routerErrorLogger.debug('Applying runtime patches for Next.js router');
    
    try {
      // Apply the fixes from our utility
      applyAllRouterFixes();
      
      routerErrorLogger.debug('Successfully applied Next.js router patches');
    } catch (err) {
      routerErrorLogger.error('Failed to apply Next.js router patches:', err);
    }
  }, []);
  
  // Component doesn't render anything
  return null;
};

export default RouterErrorHandler; 