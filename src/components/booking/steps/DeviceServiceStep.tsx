import React, { useMemo } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import Image from 'next/image';
import { Check, Loader2, AlertTriangle, Clock, DollarSign, Info } from 'lucide-react';
import type { CreateBookingRequest } from '@/types/booking';
import type { Brand, DeviceModel, Service, PricingData } from '@/hooks/useBookingData';
import TierPriceComparison from '../TierPriceComparison';

interface DeviceServiceStepProps {
  methods: UseFormReturn<CreateBookingRequest>;
  brandsData: Brand[] | undefined;
  brandsLoading: boolean;
  modelsData: DeviceModel[] | undefined;
  modelsLoading: boolean;
  servicesData: Service[] | undefined;
  servicesLoading: boolean;
  pricingData: PricingData | undefined;
  quotedPrice: number | undefined;
  validatedSteps: number[];
  visibleSections: Set<string>;
  showBrandWarning: boolean;
  revealSection: (name: string) => void;
  scrollToElement: (selector: string, delay?: number) => void;
  handleModelSelectionAttempt: () => boolean;
  getBrandLogo: (brand: string) => string | null;
  getServiceIcon: (serviceName: string, categorySlug?: string) => string;
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  watchedDeviceType: string | undefined;
  watchedDeviceBrand: string;
  watchedDeviceModel: string;
  watchedServiceType: string | string[];
  watchedPricingTier: string | undefined;
}

export default function DeviceServiceStep({
  methods,
  brandsData,
  brandsLoading,
  modelsData,
  modelsLoading,
  servicesData,
  servicesLoading,
  pricingData,
  quotedPrice,
  validatedSteps,
  visibleSections,
  showBrandWarning,
  revealSection,
  scrollToElement,
  handleModelSelectionAttempt,
  getBrandLogo,
  getServiceIcon,
  setSelectedBrandId,
  setSelectedModelId,
  watchedDeviceType,
  watchedDeviceBrand,
  watchedDeviceModel,
  watchedServiceType,
  watchedPricingTier,
}: DeviceServiceStepProps) {
  const deviceType = watchedDeviceType;
  const deviceBrand = watchedDeviceBrand;
  const showValidationErrors = validatedSteps.includes(0);

  // ── Transform services for UI ──────────────────────────────────────────
  const deviceServices = useMemo(() => {
    const apiServices = servicesData || [];
    const transformed = apiServices.map((service) => ({
      id: service.slug || service.name,
      label: service.display_name || service.name,
      doorstep: service.is_doorstep_eligible !== undefined ? service.is_doorstep_eligible : true,
      icon: getServiceIcon(service.name, service.category?.icon_name),
      time: service.estimated_duration_minutes ? `${service.estimated_duration_minutes} min` : '30-60 min',
      price: 'View pricing below',
      group: 'common',
    }));

    if (!servicesLoading && transformed.length > 0) return transformed;

    // Fallback services
    const fallback: Record<string, typeof transformed> = {
      mobile: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true, icon: getServiceIcon('screen_replacement'), time: '30-60 min', price: 'Get Quote', group: 'common' },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true, icon: getServiceIcon('battery_replacement'), time: '20-40 min', price: 'Get Quote', group: 'common' },
        { id: 'charging-port', label: 'Charging Port Repair', doorstep: true, icon: getServiceIcon('charging_port_repair'), time: '30-45 min', price: 'Get Quote', group: 'common' },
        { id: 'speaker-mic', label: 'Speaker/Microphone Repair', doorstep: true, icon: getServiceIcon('speaker_microphone_repair'), time: '25-45 min', price: 'Get Quote', group: 'common' },
        { id: 'camera-repair', label: 'Camera Repair', doorstep: true, icon: getServiceIcon('camera_repair'), time: '30-60 min', price: 'Get Quote', group: 'common' },
        { id: 'water-damage', label: 'Water Damage Diagnostics', doorstep: false, icon: getServiceIcon('water_damage_diagnostics'), time: '45-90 min', price: 'Get Quote', group: 'special' },
      ],
      laptop: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true, icon: getServiceIcon('screen_replacement'), time: '45-75 min', price: 'Get Quote', group: 'common' },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true, icon: getServiceIcon('battery_replacement'), time: '30-45 min', price: 'Get Quote', group: 'common' },
        { id: 'keyboard-repair', label: 'Keyboard Repair', doorstep: true, icon: getServiceIcon('keyboard_repair'), time: '45-75 min', price: 'Get Quote', group: 'common' },
        { id: 'trackpad-repair', label: 'Trackpad Repair', doorstep: true, icon: getServiceIcon('trackpad_repair'), time: '45-90 min', price: 'Get Quote', group: 'common' },
        { id: 'ram-upgrade', label: 'RAM Upgrade', doorstep: true, icon: getServiceIcon('ram_upgrade'), time: '20-40 min', price: 'Get Quote', group: 'upgrades' },
        { id: 'storage-upgrade', label: 'HDD/SSD Upgrade', doorstep: true, icon: getServiceIcon('storage_upgrade'), time: '30-60 min', price: 'Get Quote', group: 'upgrades' },
        { id: 'software-trouble', label: 'Software Troubleshooting', doorstep: true, icon: getServiceIcon('software_troubleshooting'), time: '45-90 min', price: 'Get Quote', group: 'software' },
        { id: 'virus-removal', label: 'Virus Removal', doorstep: true, icon: getServiceIcon('virus_removal'), time: '60-120 min', price: 'Get Quote', group: 'software' },
        { id: 'cooling-repair', label: 'Cooling System Repair', doorstep: true, icon: getServiceIcon('cooling_repair'), time: '45-90 min', price: 'Get Quote', group: 'hardware' },
        { id: 'power-jack', label: 'Power Jack Repair', doorstep: true, icon: getServiceIcon('power_jack_repair'), time: '60-90 min', price: 'Get Quote', group: 'hardware' },
      ],
      tablet: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true, icon: getServiceIcon('screen_replacement'), time: '45-75 min', price: 'Get Quote', group: 'common' },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true, icon: getServiceIcon('battery_replacement'), time: '30-60 min', price: 'Get Quote', group: 'common' },
        { id: 'charging-port', label: 'Charging Port Repair', doorstep: true, icon: getServiceIcon('charging_port_repair'), time: '30-60 min', price: 'Get Quote', group: 'common' },
      ],
    };
    return fallback[deviceType as string] || [];
  }, [servicesData, servicesLoading, deviceType, getServiceIcon]);

  // ── Brand list with "Other" appended ───────────────────────────────────
  const brandsWithOther = useMemo(() => {
    const brands = brandsData || [];
    return [
      ...brands,
      { id: 'other' as string, name: 'Other', slug: 'other', is_active: true, created_at: new Date().toISOString() } as Brand,
    ];
  }, [brandsData]);

  return (
    <div className="space-y-8">
      {/* ─── Device Type Selection ─────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-primary-900 mb-6">Select Your Device</h2>
        <label className="block text-sm font-medium text-primary-700 mb-3">
          Device Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['mobile', 'laptop'] as const).map((type) => (
            <label
              key={type}
              className={`glass-card p-4 flex items-center ${
                deviceType === type ? 'glass-card-selected' : ''
              }`}
            >
              <Controller
                name="deviceType"
                control={methods.control}
                rules={{ required: 'Please select a device type' }}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value={type}
                    checked={field.value === type}
                    onChange={() => {
                      field.onChange(type);
                      methods.setValue('deviceBrand', '');
                      methods.setValue('deviceModel', '');
                      revealSection('brandSelection');
                      scrollToElement('[data-section="brand-selection"]', 400);
                    }}
                  />
                )}
              />
              <div className={`rounded-full p-3 mr-3 transition-all duration-300 ${
                deviceType === type ? 'bg-primary-200/80' : 'bg-primary-100/60'
              }`}>
                {type === 'mobile' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-primary-900 capitalize">{type === 'mobile' ? 'Mobile Phone' : 'Laptop'}</span>
              {deviceType === type && (
                <div className="ml-auto">
                  <Check className="h-5 w-5 text-primary-600" />
                </div>
              )}
            </label>
          ))}
        </div>
        {methods.formState.errors.deviceType && showValidationErrors && (
          <p className="mt-2 text-sm text-red-600">{methods.formState.errors.deviceType.message}</p>
        )}
      </div>

      {/* ─── Brand Selection ──────────────────────────────────────────── */}
      {deviceType && (
        <div
          className={`form-section-reveal ${visibleSections.has('brandSelection') ? 'visible' : ''} ${
            showBrandWarning ? 'animate-pulse border-2 border-orange-300 bg-orange-50 rounded-xl p-4' : ''
          }`}
          data-section="brand-selection"
        >
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-primary-700">
              Brand <span className="text-red-500">*</span>
            </label>
            {showBrandWarning && (
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Please select a brand first!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {brandsLoading ? (
              <div className="col-span-3 text-center py-4 text-primary-500 flex items-center justify-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading brands...
              </div>
            ) : (
              brandsWithOther.map((brand) => {
                const brandSlug = (brand.slug || brand.name).toLowerCase();
                const logo = getBrandLogo(brandSlug);
                const isSelected = deviceBrand === brandSlug;
                return (
                  <label
                    key={brand.id}
                    className={`glass-card p-3 flex items-center ${isSelected ? 'glass-card-selected' : ''}`}
                  >
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: 'Please select a brand' }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value={brandSlug}
                          checked={field.value === brandSlug}
                          onChange={() => {
                            field.onChange(brandSlug);
                            methods.setValue('deviceModel', '');
                            revealSection('modelSelection');
                            setSelectedBrandId(brand.id as string);
                            scrollToElement('#model-selection-section', 400);
                          }}
                        />
                      )}
                    />
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
                      {logo ? (
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <Image src={logo} alt={`${brand.name} logo`} fill className="object-contain" sizes="32px" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full bg-primary-100/80 text-primary-700">
                          {brand.name === 'Other' ? '...' : brand.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-primary-900">{brand.name}</span>
                    {isSelected && (
                      <div className="ml-auto">
                        <Check className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {methods.formState.errors.deviceBrand && showValidationErrors && (
            <p className="mt-2 text-sm text-red-600">{methods.formState.errors.deviceBrand.message}</p>
          )}

          {/* Custom brand input */}
          {deviceBrand === 'other' && (
            <div className="mt-4 glass-surface-light p-4 rounded-xl">
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Enter Brand Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="customBrand"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      className="glass-input w-full"
                      placeholder="Enter brand name..."
                      {...field}
                    />
                    {fieldState.error && showValidationErrors && (
                      <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Model Selection ──────────────────────────────────────────── */}
      {deviceType && (
        <div id="model-selection-section" className="transition-opacity duration-300" style={{ opacity: deviceType ? '1' : '0.5' }}>
          <label htmlFor="deviceModel" className="block text-sm font-medium text-primary-700 mb-2">
            Model <span className="text-red-500">*</span>
          </label>
          <Controller
            name="deviceModel"
            control={methods.control}
            rules={{ required: 'Model is required' }}
            render={({ field, fieldState }) => {
              if (deviceBrand === 'other') {
                return (
                  <>
                    <input
                      type="text"
                      className="glass-input w-full"
                      placeholder={`Enter your ${deviceType} model`}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    {fieldState.error && showValidationErrors && (
                      <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                    )}
                  </>
                );
              }
              return (
                <>
                  <select
                    className="glass-input w-full appearance-none"
                    value={field.value || ''}
                    onChange={(e) => {
                      if (handleModelSelectionAttempt()) {
                        field.onChange(e.target.value);
                        const selectedModel = modelsData?.find((m) => m.name === e.target.value);
                        if (selectedModel) setSelectedModelId(selectedModel.id);
                        scrollToElement('#services-section', 400);
                      }
                    }}
                    disabled={!deviceBrand || modelsLoading || (!modelsData?.length && !modelsLoading)}
                  >
                    <option value="">
                      {!deviceBrand
                        ? 'Select a brand first'
                        : modelsLoading
                        ? 'Loading models...'
                        : !modelsData?.length
                        ? `No ${deviceBrand} ${deviceType} models available`
                        : `Select your ${deviceBrand} ${deviceType} model`}
                    </option>
                    {modelsData?.map((model) => (
                      <option key={model.id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                    {modelsData && modelsData.length > 0 && (
                      <option value="custom-model">My model isn&apos;t listed</option>
                    )}
                  </select>
                  {field.value === 'custom-model' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="glass-input w-full"
                        placeholder={`Enter your ${deviceType} model manually`}
                        onChange={(e) => field.onChange(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                  {modelsLoading && (
                    <div className="mt-2 flex items-center text-sm text-primary-500">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading available models...
                    </div>
                  )}
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              );
            }}
          />
        </div>
      )}

      {/* ─── Service Selection ────────────────────────────────────────── */}
      <div className="border-t border-primary-200/50 pt-8">
        <div className="glass-section-header mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Service Details & Pricing</h3>
          <p className="text-sm text-primary-700">
            Select the services you need and choose your preferred service tier.
          </p>
        </div>

        <div id="services-section" className="space-y-6">
          <h4 className="text-xl font-semibold text-primary-900">What needs repair?</h4>

          {servicesLoading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center text-primary-600">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading available services...
              </div>
            </div>
          )}

          <Controller
            name="serviceType"
            control={methods.control}
            rules={{ required: 'Please select at least one service' }}
            render={({ field, fieldState }) => (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deviceServices.map((service) => {
                    const isSelected = Array.isArray(field.value)
                      ? field.value.includes(service.id)
                      : field.value === service.id;
                    return (
                      <div
                        key={service.id}
                        className={`glass-card p-4 ${isSelected ? 'glass-card-selected' : ''}`}
                        onClick={() => {
                          let newValue;
                          if (Array.isArray(field.value)) {
                            newValue = isSelected
                              ? field.value.filter((id: string) => id !== service.id)
                              : [...field.value, service.id];
                          } else {
                            newValue = isSelected ? [] : [service.id];
                          }
                          field.onChange(newValue);
                          methods.trigger('serviceType');
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d={service.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-base font-medium text-primary-900">{service.label}</h4>
                              {service.doorstep && (
                                <span className="text-xs bg-green-100/80 text-green-800 px-2 py-1 rounded-full">
                                  Doorstep
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm text-primary-600">
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {service.time}
                              </span>
                              <span className="flex items-center font-medium">
                                <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                                {service.price}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <Check className="h-5 w-5 text-primary-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {/* Issue description */}
          <div className="space-y-2">
            <label htmlFor="issueDescription" className="block text-sm font-medium text-primary-700">
              Additional Details (Optional)
            </label>
            <Controller
              name="issueDescription"
              control={methods.control}
              render={({ field }) => (
                <textarea
                  id="issueDescription"
                  rows={3}
                  className="glass-input w-full"
                  placeholder="Please describe any additional details about the issue..."
                  {...field}
                />
              )}
            />
            <p className="text-xs text-primary-500">Help our technicians understand the problem better.</p>
          </div>
        </div>

        {/* ─── Tier & Pricing ─────────────────────────────────────────── */}
        <div id="pricing-tier-section" className="space-y-4 border-t border-primary-200/50 pt-8 mt-8">
          <h4 className="text-xl font-semibold text-primary-900 mb-2">Choose Your Service Tier</h4>
          <p className="text-sm text-primary-600 mb-4">
            Click on a pricing card below to select your preferred service tier
          </p>
          <Controller
            name="pricingTier"
            control={methods.control}
            rules={{ required: 'Please select a service tier' }}
            render={({ field, fieldState }) => (
              <>
                <TierPriceComparison
                  deviceType={deviceType}
                  brand={deviceBrand}
                  model={watchedDeviceModel}
                  services={watchedServiceType}
                  postalCode={methods.getValues('postalCode')}
                  enabled={!!(deviceType && deviceBrand && watchedDeviceModel && watchedServiceType)}
                  selectedTier={field.value}
                  onTierSelect={(tier: 'standard' | 'premium') => {
                    field.onChange(tier);
                    scrollToElement('#form-navigation', 600);
                  }}
                  className="mt-2"
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-2 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
