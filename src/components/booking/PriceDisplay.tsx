import React from 'react';
import { usePriceCalculation } from '@/hooks/usePriceCalculation';

interface PriceDisplayProps {
  deviceType?: string;
  brand?: string;
  model?: string;
  services?: string | string[];
  tier?: string;
  postalCode?: string;
  enabled?: boolean;
  className?: string;
}

export default function PriceDisplay({
  deviceType,
  brand,
  model,
  services,
  tier,
  postalCode,
  enabled = true,
  className = ''
}: PriceDisplayProps) {
  const { calculations, totalPrice, loading, error } = usePriceCalculation({
    deviceType,
    brand,
    model,
    services,
    tier,
    postalCode,
    enabled
  });

  if (!enabled || !deviceType || !brand || !model || !services) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700">Unable to calculate pricing at this time</span>
        </div>
      </div>
    );
  }

  if (calculations.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const servicesList = Array.isArray(services) ? services : [services];
  const isMultipleServices = servicesList.length > 1;

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <svg className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <h4 className="font-semibold text-green-800">
          {isMultipleServices ? 'Service Pricing Breakdown' : 'Service Pricing'}
        </h4>
      </div>

      <div className="space-y-3">
        {calculations.map((calc, index) => (
          <div key={index} className="bg-white rounded-md p-3 border border-green-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-medium text-gray-900">{calc.service.display_name}</h5>
                <p className="text-sm text-gray-600">
                  {calc.device.brand} {calc.device.model} • {calc.tier.display_name}
                </p>
              </div>
              <div className="text-right">
                {calc.pricing.discounted_price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(calc.pricing.base_price)}
                  </div>
                )}
                <div className="font-semibold text-lg text-green-700">
                  {formatPrice(calc.pricing.final_price)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {calc.tier.estimated_delivery_hours ? 
                  `${calc.tier.estimated_delivery_hours}h turnaround` : 
                  'Standard timing'
                }
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {calc.service.warranty_period_days} day warranty
              </div>
            </div>

            {calc.pricing.discounted_price && calc.pricing.savings && (
              <div className="mt-2 flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                You save {formatPrice(calc.pricing.savings)}!
              </div>
            )}

            {calc.location && calc.location.adjustment_percentage > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                *Includes {calc.location.adjustment_percentage}% adjustment for {calc.location.name}
              </div>
            )}
          </div>
        ))}

        {isMultipleServices && (
          <div className="border-t border-green-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Service Cost:</span>
              <span className="font-bold text-xl text-green-700">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              All services include free pickup, delivery, and diagnostics
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-blue-800 text-sm">Price includes:</h5>
              <ul className="text-sm text-blue-700 mt-1 space-y-0.5">
                <li>• Free diagnostics and assessment</li>
                <li>• Quality parts and professional service</li>
                <li>• Free doorstep pickup and delivery</li>
                <li>• {tier === 'premium' ? '6-month' : '3-month'} warranty</li>
                {tier === 'premium' && <li>• Priority handling and express service</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 