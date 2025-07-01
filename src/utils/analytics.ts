/**
 * Google Analytics 4 (GA4) utility for The Travelling Technicians website
 * Tracking ID: G-80YKX5JXKG
 */

// Extend the global window object to include gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

// GA4 Configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-80YKX5JXKG';

// Check if GA4 is loaded
const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track page views in GA4
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!isGALoaded()) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: url,
    page_title: title || document.title,
    send_page_view: true
  });
};

/**
 * Track custom events in GA4
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
): void => {
  if (!isGALoaded()) return;
  
  window.gtag('event', eventName, {
    event_category: parameters?.category || 'engagement',
    event_label: parameters?.label,
    value: parameters?.value,
    ...parameters
  });
};

/**
 * Track booking-related events
 */
export const trackBookingEvent = (
  action: 'started' | 'completed' | 'abandoned',
  serviceType: 'mobile' | 'laptop',
  deviceBrand?: string,
  repairType?: string,
  price?: number
): void => {
  trackEvent(`booking_${action}`, {
    category: 'booking',
    service_type: serviceType,
    device_brand: deviceBrand,
    repair_type: repairType,
    value: price,
    currency: 'CAD'
  });
};

/**
 * Track phone clicks (for ads attribution)
 */
export const trackPhoneClick = (source: string = 'header'): void => {
  trackEvent('phone_click', {
    category: 'contact',
    label: source,
    event_label: 'Phone Click'
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmission = (
  formType: 'booking' | 'contact' | 'quote',
  success: boolean = true
): void => {
  trackEvent(success ? 'form_submit' : 'form_error', {
    category: 'form',
    form_type: formType,
    success: success
  });
};

/**
 * Track service page visits
 */
export const trackServiceView = (
  serviceType: 'mobile' | 'laptop',
  specificService?: string
): void => {
  trackEvent('service_view', {
    category: 'service',
    service_type: serviceType,
    specific_service: specificService
  });
};

/**
 * Track location-based events
 */
export const trackLocationEvent = (
  action: 'area_selected' | 'postal_code_checked',
  location: string
): void => {
  trackEvent(`location_${action}`, {
    category: 'location',
    location: location,
    event_label: location
  });
};

/**
 * Track repair completion (conversion)
 */
export const trackRepairCompletion = (
  serviceType: 'mobile' | 'laptop',
  repairType: string,
  deviceBrand: string,
  price: number,
  satisfactionRating?: number
): void => {
  // Track as conversion
  trackEvent('purchase', {
    transaction_id: `repair_${Date.now()}`,
    value: price,
    currency: 'CAD',
    items: [{
      item_id: `${serviceType}_${repairType}`,
      item_name: `${deviceBrand} ${repairType}`,
      category: serviceType,
      price: price,
      quantity: 1
    }]
  });
  
  // Track satisfaction if provided
  if (satisfactionRating) {
    trackEvent('satisfaction_rating', {
      category: 'feedback',
      rating: satisfactionRating,
      service_type: serviceType,
      repair_type: repairType
    });
  }
};

/**
 * Track ad click attribution
 */
export const trackAdClick = (
  source: 'google_ads' | 'facebook_ads' | 'other',
  campaign?: string,
  adGroup?: string
): void => {
  trackEvent('ad_click', {
    category: 'advertising',
    source: source,
    campaign: campaign,
    ad_group: adGroup
  });
};

/**
 * Track scroll depth for engagement
 */
export const trackScrollDepth = (percentage: number): void => {
  trackEvent('scroll', {
    category: 'engagement',
    scroll_depth: percentage,
    event_label: `${percentage}%`
  });
};

/**
 * Track outbound link clicks
 */
export const trackOutboundClick = (url: string, linkText?: string): void => {
  trackEvent('click', {
    category: 'outbound',
    link_url: url,
    link_text: linkText,
    event_label: url
  });
};

/**
 * Track file downloads (like repair guides)
 */
export const trackDownload = (fileName: string, fileType: string): void => {
  trackEvent('file_download', {
    category: 'download',
    file_name: fileName,
    file_type: fileType
  });
};

/**
 * Track email signups
 */
export const trackEmailSignup = (source: string = 'newsletter'): void => {
  trackEvent('sign_up', {
    category: 'engagement',
    method: 'email',
    source: source
  });
};

/**
 * Track search queries on site
 */
export const trackSiteSearch = (query: string, results?: number): void => {
  trackEvent('search', {
    category: 'site_search',
    search_term: query,
    results_count: results
  });
};

// Initialize scroll tracking
export const initScrollTracking = (): void => {
  if (typeof window === 'undefined') return;
  
  let scrollMarks = [25, 50, 75, 100];
  let scrolledMarks: number[] = [];
  
  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    scrollMarks.forEach(mark => {
      if (scrollPercent >= mark && !scrolledMarks.includes(mark)) {
        scrolledMarks.push(mark);
        trackScrollDepth(mark);
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
};

// Auto-initialize scroll tracking on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollTracking);
  } else {
    initScrollTracking();
  }
}

// Export all tracking functions
const analytics = {
  trackPageView,
  trackEvent,
  trackBookingEvent,
  trackPhoneClick,
  trackFormSubmission,
  trackServiceView,
  trackLocationEvent,
  trackRepairCompletion,
  trackAdClick,
  trackScrollDepth,
  trackOutboundClick,
  trackDownload,
  trackEmailSignup,
  trackSiteSearch,
  initScrollTracking,
};

export default analytics;
