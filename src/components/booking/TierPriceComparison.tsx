import React from 'react';
import { usePriceCalculation } from '@/hooks/usePriceCalculation';

interface TierPriceComparisonProps {
  deviceType?: string;
  brand?: string;
  model?: string;
  services?: string | string[];
  postalCode?: string;
  enabled?: boolean;
  selectedTier?: 'standard' | 'premium';
  onTierSelect?: (tier: 'standard' | 'premium') => void;
  className?: string;
}

export default function TierPriceComparison({
  deviceType,
  brand,
  model,
  services,
  postalCode,
  enabled = true,
  selectedTier,
  onTierSelect,
  className = ''
}: TierPriceComparisonProps) {
  const standardPricing = usePriceCalculation({
    deviceType,
    brand,
    model,
    services,
    tier: 'standard',
    postalCode,
    enabled
  });

  const premiumPricing = usePriceCalculation({
    deviceType,
    brand,
    model,
    services,
    tier: 'premium',
    postalCode,
    enabled
  });

  if (!enabled || !deviceType || !brand || !model || !services) {
    return null;
  }

  if (standardPricing.loading || premiumPricing.loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (standardPricing.error || premiumPricing.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700">Unable to calculate tier pricing comparison</span>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const servicesList = Array.isArray(services) ? services : [services];
  const isMultipleServices = servicesList.length > 1;
  const savings = premiumPricing.totalPrice - standardPricing.totalPrice;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <svg className="h-6 w-6 text-blue-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm6 2a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
        <h4 className="text-lg font-semibold text-blue-900">
          {isMultipleServices ? 'Service Pricing Comparison' : 'Tier Pricing Comparison'}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Standard Tier Pricing - Clickable */}
        <button
          type="button"
          onClick={() => onTierSelect?.('standard')}
          className={`bg-white rounded-lg border-2 p-4 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
            selectedTier === 'standard' 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-green-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-gray-900">Standard Repair</h5>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Most Popular</span>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-green-600">{formatPrice(standardPricing.totalPrice)}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Warranty:</span>
              <span className="font-medium text-gray-900">3 Months</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Parts Quality:</span>
              <span className="font-medium text-gray-900">Standard</span>
            </div>
          </div>

          {isMultipleServices && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {servicesList.length} service{servicesList.length > 1 ? 's' : ''} selected
              </div>
            </div>
          )}
          
          {/* Selected indicator */}
          {selectedTier === 'standard' && (
            <div className="mt-3 flex items-center justify-center text-green-600">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Selected</span>
            </div>
          )}
        </button>

        {/* Premium Tier Pricing - Clickable */}
        <button
          type="button"
          onClick={() => onTierSelect?.('premium')}
          className={`bg-white rounded-lg border-2 p-4 text-left relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
            selectedTier === 'premium' 
              ? 'border-orange-500 bg-orange-50 shadow-md' 
              : 'border-orange-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-gray-900">Premium Service</h5>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Recommended</span>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-orange-600">{formatPrice(premiumPricing.totalPrice)}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Warranty:</span>
              <span className="font-medium text-gray-900">6 Months</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Parts Quality:</span>
              <span className="font-medium text-gray-900">Premium</span>
            </div>
          </div>

          {isMultipleServices && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {servicesList.length} service{servicesList.length > 1 ? 's' : ''} selected
              </div>
            </div>
          )}

          {/* Price difference indicator */}
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            +{formatPrice(savings)}
          </div>
          
          {/* Selected indicator */}
          {selectedTier === 'premium' && (
            <div className="mt-3 flex items-center justify-center text-orange-600">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Selected</span>
            </div>
          )}
        </button>
      </div>

      {/* Summary comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Premium vs Standard:</span> {formatPrice(savings)} extra for 2x longer warranty + premium parts
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              You save {formatPrice(savings * 0.5)} on warranty coverage with Premium
            </div>
            <div className="text-xs text-gray-500">
              (Based on typical warranty claim value)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h5 className="font-medium text-blue-800 text-sm">What's included in both tiers:</h5>
            <ul className="text-sm text-blue-700 mt-1 space-y-0.5">
              <li>• Free diagnostics and assessment</li>
              <li>• Free doorstep pickup and delivery</li>
              <li>• Professional technician service</li>
              <li>• No-fix, no-charge guarantee</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 