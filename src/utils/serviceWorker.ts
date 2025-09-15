/**
 * Service Worker Registration and Management
 * Handles registration, updates, and communication with the service worker
 */

import { logger } from './logger';

const swLogger = logger.createModuleLogger('serviceWorker');

export interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  clearCache: (cacheName?: string) => Promise<boolean>;
  getCacheSize: () => Promise<number>;
  warmCache: (urls: string[]) => Promise<boolean>;
  isSupported: () => boolean;
  isOnline: () => boolean;
}

// Service worker management class
class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable: boolean = false;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  /**
   * Check if browser is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      swLogger.warn('Service workers not supported');
      return null;
    }

    try {
      swLogger.info('Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        swLogger.info('Service worker update found');
        this.handleUpdateFound(registration);
      });

      // Check for immediate updates
      if (registration.waiting) {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }

      swLogger.info('Service worker registered successfully', {
        scope: registration.scope,
        active: !!registration.active
      });

      return registration;
    } catch (error) {
      swLogger.error('Service worker registration failed', { error });
      return null;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      swLogger.info('Service worker unregistered', { success: result });
      this.registration = null;
      return result;
    } catch (error) {
      swLogger.error('Failed to unregister service worker', { error });
      return false;
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('No service worker registration found');
    }

    try {
      await this.registration.update();
      swLogger.info('Service worker update check completed');
    } catch (error) {
      swLogger.error('Service worker update failed', { error });
      throw error;
    }
  }

  /**
   * Clear service worker cache
   */
  async clearCache(cacheName?: string): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      swLogger.warn('No active service worker found');
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };

      this.registration!.active!.postMessage({
        type: 'CLEAR_CACHE',
        payload: { cacheName }
      }, [messageChannel.port2]);
    });
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    if (!this.registration || !this.registration.active) {
      return 0;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size || 0);
      };

      this.registration!.active!.postMessage({
        type: 'GET_CACHE_SIZE'
      }, [messageChannel.port2]);
    });
  }

  /**
   * Warm cache with specific URLs
   */
  async warmCache(urls: string[]): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };

      this.registration!.active!.postMessage({
        type: 'WARM_CACHE',
        payload: { urls }
      }, [messageChannel.port2]);
    });
  }

  /**
   * Handle service worker update found
   */
  private handleUpdateFound(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  /**
   * Notify user of available update
   */
  private notifyUpdateAvailable(): void {
    swLogger.info('Service worker update available');
    
    // Dispatch custom event for app to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-update-available', {
        detail: { registration: this.registration }
      }));
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    swLogger.info('Browser came online');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-online'));
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    swLogger.info('Browser went offline');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sw-offline'));
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Wait for the new service worker to take control
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
      });
    });
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManagerImpl();

/**
 * React hook for service worker management
 */
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(() => serviceWorkerManager.isOnline());
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    serviceWorkerManager.register().then(setRegistration);

    // Listen for update events
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-online', handleOnline);
    window.addEventListener('sw-offline', handleOffline);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-online', handleOnline);
      window.removeEventListener('sw-offline', handleOffline);
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    if (registration && registration.waiting) {
      await serviceWorkerManager.skipWaiting();
      setUpdateAvailable(false);
      // Reload the page to get the new version
      window.location.reload();
    }
  }, [registration]);

  return {
    isOnline,
    updateAvailable,
    registration,
    applyUpdate,
    manager: serviceWorkerManager
  };
}

/**
 * Initialize service worker for the app
 */
export async function initializeServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await serviceWorkerManager.register();
    
    // Warm cache with important URLs
    const importantUrls = [
      '/',
      '/services/mobile-repair',
      '/services/laptop-repair',
      '/api/devices/brands?deviceType=mobile',
      '/api/devices/brands?deviceType=laptop'
    ];
    
    await serviceWorkerManager.warmCache(importantUrls);
    swLogger.info('Service worker initialized and cache warmed');
  } catch (error) {
    swLogger.error('Failed to initialize service worker', { error });
  }
}

// Auto-register on import (for Next.js)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Delay registration to avoid blocking initial page load
  setTimeout(() => {
    initializeServiceWorker();
  }, 1000);
}

export default serviceWorkerManager;

// Note: React imports would be added if this was used in components
// For now, keeping it framework-agnostic
function useState<T>(initialValue: T | (() => T)): [T, (value: T) => void] {
  // Placeholder implementation - would use actual React useState in real app
  throw new Error('useState hook not available - import from React when using in components');
}

function useEffect(effect: () => void | (() => void), deps?: any[]): void {
  // Placeholder implementation - would use actual React useEffect in real app
  throw new Error('useEffect hook not available - import from React when using in components');
}

function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
  // Placeholder implementation - would use actual React useCallback in real app
  throw new Error('useCallback hook not available - import from React when using in components');
}
