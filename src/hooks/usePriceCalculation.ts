import { useState, useEffect, useCallback } from 'react';

interface PriceCalculation {
  service: {
    id: number;
    name: string;
    display_name: string;
    estimated_duration_minutes?: number;
    warranty_period_days: number;
    is_doorstep_eligible: boolean;
  };
  device: {
    type: string;
    brand: string;
    model: string;
  };
  pricing: {
    base_price: number;
    discounted_price?: number;
    final_price: number;
    tier_multiplier: number;
    location_adjustment: number;
    savings?: number;
  };
  tier: {
    name: string;
    display_name: string;
    estimated_delivery_hours?: number;
    includes_features: string[];
  };
  location?: {
    name: string;
    adjustment_percentage: number;
  };
}

interface PriceCalculationHookResult {
  calculations: PriceCalculation[];
  totalPrice: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePriceCalculationParams {
  deviceType?: string;
  brand?: string;
  model?: string;
  services?: string | string[];
  tier?: string;
  postalCode?: string;
  enabled?: boolean;
}

export function usePriceCalculation({
  deviceType,
  brand,
  model,
  services,
  tier = 'standard',
  postalCode,
  enabled = true
}: UsePriceCalculationParams): PriceCalculationHookResult {
  const [calculations, setCalculations] = useState<PriceCalculation[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const servicesList = Array.isArray(services) ? services : services ? [services] : [];

  const fetchPricing = useCallback(async () => {
    if (!enabled || !deviceType || !brand || !model || servicesList.length === 0) {
      setCalculations([]);
      setTotalPrice(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pricePromises = servicesList.map(async (service) => {
        const params = new URLSearchParams({
          deviceType,
          brand,
          model,
          service,
          tier,
          ...(postalCode && { postalCode })
        });

        const response = await fetch(`/api/pricing/calculate?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to calculate price for ${service}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to calculate price');
        }

        return data.calculation;
      });

      const results = await Promise.all(pricePromises);
      setCalculations(results);
      
      // Calculate total price
      const total = results.reduce((sum, calc) => sum + calc.pricing.final_price, 0);
      setTotalPrice(total);
      
    } catch (err) {
      console.error('Price calculation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate pricing');
      setCalculations([]);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  }, [deviceType, brand, model, servicesList, tier, postalCode, enabled]);

  const refetch = () => {
    fetchPricing();
  };

  useEffect(() => {
    fetchPricing();
  }, [deviceType, brand, model, servicesList, tier, postalCode, enabled, fetchPricing]);

  return {
    calculations,
    totalPrice,
    loading,
    error,
    refetch
  };
}

export default usePriceCalculation; 