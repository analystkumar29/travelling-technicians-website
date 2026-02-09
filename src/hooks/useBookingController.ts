import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useWatch, UseFormReturn } from 'react-hook-form';
import type { CreateBookingRequest } from '@/types/booking';
import {
  checkServiceArea,
  getCurrentLocationPostalCode,
  isValidPostalCodeFormat,
} from '@/utils/locationUtils';
import {
  useBrands,
  useModels,
  useServices,
  useCalculatePrice,
  type Brand,
  type DeviceModel,
  type Service,
  type PricingData,
} from '@/hooks/useBookingData';
import {
  getTimeSlotsForDate,
  type TimeSlot,
} from '@/utils/bookingTimeSlots';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseBookingControllerParams {
  onSubmit: (data: CreateBookingRequest) => void;
  initialData?: Partial<CreateBookingRequest>;
}

export interface BookingController {
  // Form
  methods: UseFormReturn<CreateBookingRequest>;

  // Navigation
  currentStep: number;
  steps: string[];
  nextStep: () => Promise<void>;
  prevStep: () => void;

  // Data
  brandsData: Brand[] | undefined;
  brandsLoading: boolean;
  modelsData: DeviceModel[] | undefined;
  modelsLoading: boolean;
  servicesData: Service[] | undefined;
  servicesLoading: boolean;
  pricingData: PricingData | undefined;
  timeSlots: TimeSlot[];
  isLoadingTimeSlots: boolean;

  // State
  agreeToTerms: boolean;
  setAgreeToTerms: (v: boolean) => void;
  submitAttempted: boolean;
  isSubmitting: boolean;
  quotedPrice: number | undefined;
  formTouched: boolean;
  validatedSteps: number[];
  visibleSections: Set<string>;
  showBrandWarning: boolean;
  showSwipeIndicator: boolean;
  locationWasPreFilled: boolean;
  detectingLocation: boolean;
  needsPostalCodeAttention: boolean;

  // Actions
  handleFinalSubmit: () => Promise<void>;
  revealSection: (name: string) => void;
  scrollToElement: (selector: string, delay?: number) => void;
  handleModelSelectionAttempt: () => boolean;
  getBrandLogo: (brand: string) => string | null;
  getServiceIcon: (serviceName: string, categorySlug?: string) => string;
  detectCurrentLocation: () => Promise<void>;
  handleAddressSelect: (address: string, isValid: boolean, postalCode?: string) => void;
  setNeedsPostalCodeAttention: (v: boolean) => void;
  setDetectingLocation: (v: boolean) => void;
  setLocationWasPreFilled: (v: boolean) => void;

  // Watched values (use these instead of calling methods.watch())
  watchedDeviceType: string | undefined;
  watchedDeviceBrand: string;
  watchedDeviceModel: string;
  watchedServiceType: string | string[];
  watchedPricingTier: string | undefined;
  watchedAppointmentDate: string;

  // UUID tracking
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  selectedServiceIds: string[];
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
}

// ─── Service Icon Map ────────────────────────────────────────────────────────

const SERVICE_ICON_MAP: Record<string, string> = {
  screen_replacement: 'M12 18h-1.5v-2H18v2H12zM6 11v-1h12v1H6zm0 6H4.5v-2H6v2zm10.5-6a.75.75 0 100-1.5.75.75 0 000 1.5zM12 6V4h6v2h-6zM6 6V4h4.5v2H6z',
  battery_replacement: 'M20 10V8h-3V4H7v4H4v2h3v8a2 2 0 002 2h6a2 2 0 002-2v-8h3zM13 8V6h1v2h-1zm-3 0V6h1v2h-1z',
  charging_port_repair: 'M9 4v4h6V4h2v4h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V4h2zm1 16h4v-4h-4v4z',
  speaker_microphone_repair: 'M10 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3zm7-5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2z',
  camera_repair: 'M12 9a3 3 0 100 6 3 3 0 000-6zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-8 11a5 5 0 110-10 5 5 0 010 10z',
  water_damage_diagnostics: 'M12 3.25a.75.75 0 01.75.75v6.701a4.25 4.25 0 11-1.5 0V4a.75.75 0 01.75-.75zM7.266 7.5a7 7 0 1113.468 2.5 7 7 0 01-13.468-2.5z',
  keyboard_repair: 'M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm0 11.5H4V7h16v9.5zM6 10h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z',
  trackpad_repair: 'M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v10zm-8-7a2 2 0 100 4 2 2 0 000-4z',
  ram_upgrade: 'M4 4h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm0 8h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1zm3-6h2v2H7V6zm0 8h2v2H7v-2z',
  storage_upgrade: 'M15 15a2 2 0 100-4 2 2 0 000 4zm4-11h-1V3a1 1 0 00-1-1H7a1 1 0 00-1 1v1H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-4 10a4 4 0 110-8 4 4 0 010 8zm-6-8.5a.5.5 0 100-1 .5.5 0 000 1z',
  software_troubleshooting: 'M13 13.5a1 1 0 11-2 0 1 1 0 012 0zm-.25-5v2.992l.25.26a1 1 0 11-2 0l.25-.26V8.5a1 1 0 112 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
  virus_removal: 'M11 16.75a.75.75 0 001.5 0v-1.061l.344-.282a4.5 4.5 0 10-2.196.003l.352.279v1.06zm1.956-8.909a1 1 0 00-1.912 0L9.96 9.575A3 3 0 008.633 11H7a1 1 0 100 2h1.633A3.001 3.001 0 0012 15a3.001 3.001 0 003.367-2H17a1 1 0 100-2h-1.633a3 3 0 00-1.327-1.425l-1.084-1.734z',
  cooling_repair: 'M10 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zM8.5 12.5L7 11l-3 3 3 3 1.5-1.5L7 14l1.5-1.5zm7 0L14 14l1.5 1.5L17 14l-3-3-3 3 1.5 1.5 1.5-1.5zM12 2a10 10 0 100 20 10 10 0 000-20zm-8 10a8 8 0 1116 0 8 8 0 01-16 0z',
  power_jack_repair: 'M12 7V5M8 9l-2-2M16 9l2-2M7 13H5M19 13h-2M12 17a2 2 0 100-4 2 2 0 000 4z',
  // Category fallbacks
  screen_repair: 'M12 18h-1.5v-2H18v2H12zM6 11v-1h12v1H6zm0 6H4.5v-2H6v2zm10.5-6a.75.75 0 100-1.5.75.75 0 000 1.5z',
  battery_repair: 'M20 10V8h-3V4H7v4H4v2h3v8a2 2 0 002 2h6a2 2 0 002-2v-8h3z',
  charging_repair: 'M9 4v4h6V4h2v4h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V4h2z',
  audio_repair: 'M10 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z',
  diagnostics: 'M12 3.25a.75.75 0 01.75.75v6.701a4.25 4.25 0 11-1.5 0V4a.75.75 0 01.75-.75z',
  input_repair: 'M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2z',
  hardware_upgrade: 'M4 4h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z',
  software_repair: 'M13 13.5a1 1 0 11-2 0 1 1 0 012 0z',
  hardware_repair: 'M10 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0z',
};

const DEFAULT_ICON = 'M12 18h-1.5v-2H18v2H12zM6 11v-1h12v1H6z';

const BRAND_LOGOS: Record<string, string> = {
  apple: '/images/brands/apple.svg',
  samsung: '/images/brands/samsung.svg',
  google: '/images/brands/google.svg',
  oneplus: '/images/brands/oneplus.svg',
  xiaomi: '/images/brands/xiaomi.svg',
  huawei: '/images/brands/huawei.svg',
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBookingController({
  onSubmit,
  initialData = {},
}: UseBookingControllerParams): BookingController {
  // ── State ────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [validatedSteps, setValidatedSteps] = useState<number[]>([]);
  const [locationWasPreFilled, setLocationWasPreFilled] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [needsPostalCodeAttention, setNeedsPostalCodeAttention] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(['deviceType', 'brandSelection'])
  );
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [showBrandWarning, setShowBrandWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UUID tracking
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number | undefined>();

  // Time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // ── Steps ────────────────────────────────────────────────────────────────
  const steps = useMemo(
    () => ['Device & Service', 'Contact & Location', 'Schedule & Confirm'],
    []
  );

  // ── Form ─────────────────────────────────────────────────────────────────
  const defaultValues: Partial<CreateBookingRequest> = useMemo(() => {
    const vals: Partial<CreateBookingRequest> = {
      deviceType: initialData.deviceType || undefined,
      deviceBrand: initialData.deviceBrand || '',
      deviceModel: initialData.deviceModel || '',
      customBrand: initialData.customBrand || '',
      serviceType: initialData.serviceType || '',
      issueDescription: initialData.issueDescription || '',
      appointmentDate: initialData.appointmentDate || '',
      appointmentTime: initialData.appointmentTime || '',
      customerName: initialData.customerName || '',
      customerEmail: initialData.customerEmail || '',
      customerPhone: initialData.customerPhone || '',
      address: initialData.address || '',
      postalCode: initialData.postalCode || '',
      quoted_price: initialData.quoted_price || undefined,
      city: initialData.city || 'Vancouver',
      province: initialData.province || 'BC',
      pricingTier: initialData.pricingTier || 'standard',
    };
    return vals;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const methods = useForm<CreateBookingRequest>({
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  });

  // ── Watched values (useWatch subscribes at field level, not whole form) ─
  const [deviceType, deviceBrand, deviceModel, serviceType, pricingTier, appointmentDate] = useWatch({
    control: methods.control,
    name: ['deviceType', 'deviceBrand', 'deviceModel', 'serviceType', 'pricingTier', 'appointmentDate'],
  });

  // ── Data hooks ───────────────────────────────────────────────────────────
  const { data: brandsData, isLoading: brandsLoading } = useBrands(deviceType || 'mobile');
  const { data: modelsData, isLoading: modelsLoading } = useModels(deviceType || 'mobile', deviceBrand || '');
  const { data: servicesData, isLoading: servicesLoading } = useServices(deviceType || 'mobile');

  const serviceSlug = useMemo(() => {
    if (Array.isArray(serviceType) && serviceType.length > 0) return serviceType[0];
    if (typeof serviceType === 'string') return serviceType;
    return '';
  }, [serviceType]);

  const { data: pricingData } = useCalculatePrice(
    deviceType || 'mobile',
    deviceBrand || '',
    deviceModel || '',
    serviceSlug,
    pricingTier || 'standard',
    { enabled: !!(deviceType && deviceBrand && deviceModel && serviceSlug) }
  );

  // ── Helpers ──────────────────────────────────────────────────────────────

  const revealSection = useCallback((sectionName: string) => {
    setVisibleSections((prev) => {
      if (prev.has(sectionName)) return prev;
      return new Set([...Array.from(prev), sectionName]);
    });
  }, []);

  const smartScroll = useCallback(() => {
    const stepContent = document.querySelector('.step-content');
    if (stepContent) {
      const rect = stepContent.getBoundingClientRect();
      const offset = window.innerHeight * 0.2;
      window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'smooth' });
    }
  }, []);

  const scrollToElement = useCallback((selector: string, delay: number = 350) => {
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isInView) return;
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const offset = window.innerHeight * 0.2;
        window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, delay);
  }, []);

  const handleModelSelectionAttempt = useCallback(() => {
    const currentBrand = methods.watch('deviceBrand');
    if (!currentBrand) {
      setShowBrandWarning(true);
      const brandSection = document.querySelector('[data-section="brand-selection"]');
      if (brandSection) {
        brandSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setShowBrandWarning(false), 3000);
      return false;
    }
    setShowBrandWarning(false);
    return true;
  }, [methods]);

  const getBrandLogo = useCallback((brandValue: string): string | null => {
    return BRAND_LOGOS[brandValue] || null;
  }, []);

  const getServiceIcon = useCallback((serviceName: string, categorySlug?: string): string => {
    const serviceKey = serviceName.toLowerCase().replace(/[\s/]/g, '_');
    if (SERVICE_ICON_MAP[serviceKey]) return SERVICE_ICON_MAP[serviceKey];
    if (categorySlug && SERVICE_ICON_MAP[categorySlug]) return SERVICE_ICON_MAP[categorySlug];
    return DEFAULT_ICON;
  }, []);

  const mapServiceSlugsToIds = useCallback(
    (serviceSlugs: string | string[]): string[] => {
      if (!servicesData || servicesData.length === 0) return [];
      const slugs = Array.isArray(serviceSlugs) ? serviceSlugs : [serviceSlugs];
      const ids: string[] = [];
      slugs.forEach((slug) => {
        const service = servicesData.find(
          (s) =>
            s.slug === slug ||
            s.name.toLowerCase().replace(/\s+/g, '-') === slug ||
            s.display_name?.toLowerCase().replace(/\s+/g, '-') === slug
        );
        if (service?.id) ids.push(service.id);
      });
      return ids;
    },
    [servicesData]
  );

  // ── Location helpers ─────────────────────────────────────────────────────

  const detectCurrentLocation = useCallback(async () => {
    try {
      setDetectingLocation(true);
      const postalCode = await getCurrentLocationPostalCode();
      const serviceArea = checkServiceArea(postalCode);

      if (serviceArea && serviceArea.serviceable) {
        let detailedAddress = '';
        let city = serviceArea.city;

        try {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
                  {
                    headers: {
                      'Accept-Language': 'en-US,en',
                      'User-Agent': 'TheTravellingTechnicians/1.0',
                    },
                    cache: 'no-cache',
                  }
                );
                if (response.ok) {
                  const data = await response.json();
                  if (data.address) {
                    const addr = data.address;
                    const streetNumber = addr.house_number || '';
                    const street = addr.road || addr.street || addr.footway || addr.path || '';
                    const unit = addr.unit || addr.apartment || '';
                    if (streetNumber && street) {
                      detailedAddress = unit
                        ? `${unit}-${streetNumber} ${street}`
                        : `${streetNumber} ${street}`;
                      methods.setValue('address', detailedAddress);
                      if (addr.city || addr.town || addr.village || addr.suburb) {
                        city = addr.city || addr.town || addr.village || addr.suburb;
                        methods.setValue('city', city);
                      }
                    }
                  }
                }
              } catch (_) {
                /* geocoding error — ignore */
              }
            });
          }
        } catch (_) {
          /* geolocation error — ignore */
        }

        methods.setValue('postalCode', postalCode);
        methods.setValue('city', city);
        methods.setValue('province', 'BC');
        if (!detailedAddress) {
          methods.setValue('address', `${postalCode} area`);
        }

        const locationData = {
          postalCode,
          city,
          province: 'BC',
          address: detailedAddress || `${postalCode} area`,
          serviceable: true,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
        setLocationWasPreFilled(true);
        setNeedsPostalCodeAttention(false);
      } else {
        alert("We couldn't determine if your location is within our service area. Please enter your address manually.");
        setNeedsPostalCodeAttention(true);
      }
    } catch (_) {
      alert("Couldn't detect your location. Please enter your address manually.");
      setNeedsPostalCodeAttention(true);
    } finally {
      setDetectingLocation(false);
    }
  }, [methods]);

  const handleAddressSelect = useCallback(
    (address: string, isValid: boolean, postalCode?: string) => {
      methods.setValue('address', address);
      if (postalCode) {
        methods.setValue('postalCode', postalCode);
        setNeedsPostalCodeAttention(!isValid);
        if (!isValid) {
          methods.setError('postalCode', {
            type: 'validate',
            message: `Unfortunately, we don't service ${postalCode} at this time.`,
          });
        }
        scrollToElement('#city-postal-section', 400);
      } else {
        setNeedsPostalCodeAttention(true);
        scrollToElement('#city-postal-section', 400);
      }
    },
    [methods, scrollToElement]
  );

  // ── Effects ──────────────────────────────────────────────────────────────

  // Sync service IDs
  useEffect(() => {
    if (serviceType && servicesData && servicesData.length > 0) {
      setSelectedServiceIds(mapServiceSlugsToIds(serviceType));
    }
  }, [serviceType, servicesData, mapServiceSlugsToIds]);

  // Sync quoted price
  useEffect(() => {
    if (pricingData?.final_price !== undefined) {
      setQuotedPrice(pricingData.final_price);
      methods.setValue('quoted_price', pricingData.final_price);
    }
  }, [pricingData, methods]);

  // Custom brand validation
  useEffect(() => {
    if (deviceBrand === 'other') {
      methods.register('customBrand', { required: 'Brand name is required' });
    } else {
      methods.unregister('customBrand');
    }
  }, [deviceBrand, methods]);

  // localStorage location pre-fill
  useEffect(() => {
    try {
      const saved = localStorage.getItem('travellingTech_location');
      if (saved) {
        const loc = JSON.parse(saved);
        const hoursDiff =
          (new Date().getTime() - new Date(loc.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 24 && loc.serviceable) {
          methods.setValue('address', loc.address || '');
          methods.setValue('postalCode', loc.postalCode || '');
          methods.setValue('city', loc.city || 'Vancouver');
          methods.setValue('province', loc.province || 'BC');
          setLocationWasPreFilled(true);
        } else if (hoursDiff >= 24) {
          localStorage.removeItem('travellingTech_location');
        }
      }
    } catch (_) {
      /* ignore parse errors */
    }
  }, [methods]);

  // Time slots
  useEffect(() => {
    if (appointmentDate) {
      const fetchSlots = async () => {
        setIsLoadingTimeSlots(true);
        try {
          // Check if selected date is tomorrow to apply cutoff
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          const isTomorrow = appointmentDate === tomorrowStr;
          const slots = await getTimeSlotsForDate(appointmentDate, isTomorrow);
          setTimeSlots(slots);
          const currentTime = methods.watch('appointmentTime');
          if (currentTime && !slots.some((s) => s.value === currentTime)) {
            methods.setValue('appointmentTime', '');
          }
        } catch (_) {
          setTimeSlots([
            { value: '8:00', label: '8:00 AM - 10:00 AM', startHour: 8, endHour: 10 },
            { value: '10:00', label: '10:00 AM - 12:00 PM', startHour: 10, endHour: 12 },
            { value: '12:00', label: '12:00 PM - 2:00 PM', startHour: 12, endHour: 14 },
            { value: '14:00', label: '2:00 PM - 4:00 PM', startHour: 14, endHour: 16 },
            { value: '16:00', label: '4:00 PM - 6:00 PM', startHour: 16, endHour: 18 },
            { value: '18:00', label: '6:00 PM - 8:00 PM', startHour: 18, endHour: 20 },
          ]);
        } finally {
          setIsLoadingTimeSlots(false);
        }
      };
      fetchSlots();
    } else {
      setTimeSlots([]);
    }
  }, [appointmentDate, methods]);

  // ── Validation ───────────────────────────────────────────────────────────

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      const data = methods.getValues();
      switch (step) {
        case 0: {
          if (!data.deviceType) {
            methods.setError('deviceType', { type: 'required', message: 'Please select a device type' });
            return false;
          }
          if (!data.deviceBrand) {
            methods.setError('deviceBrand', { type: 'required', message: 'Please select a brand' });
            return false;
          }
          if (data.deviceBrand === 'other' && !data.customBrand) {
            methods.setError('customBrand', { type: 'required', message: 'Please enter a brand name' });
            return false;
          }
          if (!data.deviceModel) {
            methods.setError('deviceModel', { type: 'required', message: 'Please select or enter a model' });
            return false;
          }
          const st = methods.watch('serviceType');
          if (!st || (Array.isArray(st) && st.length === 0)) {
            methods.setError('serviceType', { type: 'required', message: 'Please select at least one service' });
            return false;
          }
          if (!data.pricingTier) {
            methods.setError('pricingTier', { type: 'required', message: 'Please select a service tier' });
            return false;
          }
          return await methods.trigger(['deviceType', 'deviceBrand', 'deviceModel', 'serviceType', 'pricingTier']);
        }
        case 1: {
          const contactValid = await methods.trigger(['customerName', 'customerEmail', 'customerPhone']);
          const locationValid = await methods.trigger(['address', 'city', 'postalCode']);
          return contactValid && locationValid;
        }
        case 2: {
          const appointmentValid = await methods.trigger(['appointmentDate', 'appointmentTime']);
          if (!agreeToTerms) {
            setSubmitAttempted(true);
            return false;
          }
          return appointmentValid;
        }
        default:
          return true;
      }
    },
    [methods, agreeToTerms]
  );

  // ── Navigation ───────────────────────────────────────────────────────────

  const nextStep = useCallback(async () => {
    setFormTouched(true);
    if (!validatedSteps.includes(currentStep)) {
      setValidatedSteps((prev) => [...prev, currentStep]);
    }
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setTimeout(() => smartScroll(), 200);
    } else {
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, validatedSteps, validateStep, steps.length, smartScroll]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // ── Submission ───────────────────────────────────────────────────────────

  const handleFinalSubmit = useCallback(async () => {
    if (!agreeToTerms) {
      setSubmitAttempted(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = methods.getValues();
      const processedData: CreateBookingRequest = {
        ...data,
        brand: data.deviceBrand === 'other' && data.customBrand ? data.customBrand : data.deviceBrand,
        model: data.deviceModel,
        quoted_price: quotedPrice ?? undefined,
        city: data.city || 'Vancouver',
        province: data.province || 'BC',
        issueDescription: data.issueDescription || '',
        agreedToTerms: true,
        termsVersion: '2026-02-06-v1',
      };
      await onSubmit(processedData);
    } finally {
      setIsSubmitting(false);
    }
  }, [agreeToTerms, isSubmitting, methods, quotedPrice, onSubmit]);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    methods,
    currentStep,
    steps,
    nextStep,
    prevStep,
    brandsData,
    brandsLoading,
    modelsData,
    modelsLoading,
    servicesData,
    servicesLoading,
    pricingData,
    timeSlots,
    isLoadingTimeSlots,
    agreeToTerms,
    setAgreeToTerms,
    submitAttempted,
    isSubmitting,
    quotedPrice,
    formTouched,
    validatedSteps,
    visibleSections,
    showBrandWarning,
    showSwipeIndicator,
    locationWasPreFilled,
    detectingLocation,
    needsPostalCodeAttention,
    handleFinalSubmit,
    revealSection,
    scrollToElement,
    handleModelSelectionAttempt,
    getBrandLogo,
    getServiceIcon,
    detectCurrentLocation,
    handleAddressSelect,
    setNeedsPostalCodeAttention,
    setDetectingLocation,
    setLocationWasPreFilled,
    watchedDeviceType: deviceType,
    watchedDeviceBrand: deviceBrand,
    watchedDeviceModel: deviceModel,
    watchedServiceType: serviceType,
    watchedPricingTier: pricingTier,
    watchedAppointmentDate: appointmentDate,
    selectedBrandId,
    setSelectedBrandId,
    selectedModelId,
    setSelectedModelId,
    selectedServiceIds,
    selectedLocationId,
    setSelectedLocationId,
  };
}
