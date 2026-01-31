import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface Brand {
  id: number;
  name: string;
  display_name: string;
  logo_url?: string;
  model_count: number;
  brand_colors?: {
    primary: string;
    secondary: string;
  };
}

interface Model {
  id: number;
  name: string;
  display_name: string;
  brand: string;
  image_url?: string;
  release_year?: number;
  is_featured: boolean;
  popularity_score?: number;
  price_range?: {
    min: number;
    max: number;
  };
}

interface PricingTier {
  name: string;
  price: number;
  savings?: number;
  warranty: string;
  benefits: string[];
  recommended?: boolean;
}

interface PricingDisplay {
  service: string;
  tiers: {
    economy: PricingTier;
    standard: PricingTier;
    premium: PricingTier;
    express: PricingTier;
  };
  cost_breakdown: {
    parts_cost: number;
    labor_cost: number;
    markup_percentage: number;
  };
  availability: {
    in_stock: boolean;
    lead_time_days: number;
    supplier_sku: string;
  };
}

interface BrandModelPricingDisplayProps {
  deviceType: string;
  selectedBrand?: Brand;
  selectedModel?: Model;
  selectedService?: string;
  pricing?: PricingDisplay;
  onBrandSelect: (brand: Brand) => void;
  onModelSelect: (model: Model) => void;
  onServiceSelect: (service: string) => void;
  onTierSelect: (tier: string) => void;
}

const BrandModelPricingDisplay: React.FC<BrandModelPricingDisplayProps> = ({
  deviceType,
  selectedBrand,
  selectedModel,
  selectedService,
  pricing,
  onBrandSelect,
  onModelSelect,
  onServiceSelect,
  onTierSelect
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock brand data with enhanced metadata
  const mockBrands: Brand[] = useMemo(() => [
    {
      id: 1,
      name: 'apple',
      display_name: 'Apple',
      logo_url: '/images/brands/apple.svg',
      model_count: 84,
      brand_colors: { primary: '#000000', secondary: '#007AFF' }
    },
    {
      id: 2,
      name: 'samsung',
      display_name: 'Samsung',
      logo_url: '/images/brands/samsung.svg',
      model_count: 78,
      brand_colors: { primary: '#1428A0', secondary: '#000000' }
    },
    {
      id: 3,
      name: 'google',
      display_name: 'Google',
      logo_url: '/images/brands/google.svg',
      model_count: 26,
      brand_colors: { primary: '#4285F4', secondary: '#34A853' }
    }
  ], []);

  // Mock models data with enhanced metadata
  const mockModels: Model[] = useMemo(() => [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      display_name: 'iPhone 15 Pro Max',
      brand: 'apple',
      image_url: '/images/models/iphone-15-pro-max.jpg',
      release_year: 2023,
      is_featured: true,
      popularity_score: 0.95,
      price_range: { min: 150, max: 300 }
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      display_name: 'iPhone 15 Pro',
      brand: 'apple',
      image_url: '/images/models/iphone-15-pro.jpg',
      release_year: 2023,
      is_featured: true,
      popularity_score: 0.90,
      price_range: { min: 130, max: 280 }
    },
    {
      id: 3,
      name: 'Galaxy S23 Ultra',
      display_name: 'Galaxy S23 Ultra',
      brand: 'samsung',
      image_url: '/images/models/galaxy-s23-ultra.jpg',
      release_year: 2023,
      is_featured: true,
      popularity_score: 0.88,
      price_range: { min: 140, max: 320 }
    }
  ], []);

  useEffect(() => {
    setBrands(mockBrands);
  }, [deviceType, mockBrands]);

  useEffect(() => {
    if (selectedBrand) {
      const brandModels = mockModels.filter(model => model.brand === selectedBrand.name);
      setModels(brandModels);
    }
  }, [selectedBrand, mockModels]);

  const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => (
    <div 
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${selectedBrand?.id === brand.id 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={() => onBrandSelect(brand)}
      style={{
        background: selectedBrand?.id === brand.id 
          ? `linear-gradient(135deg, ${brand.brand_colors?.primary}10, ${brand.brand_colors?.secondary}10)`
          : undefined
      }}
    >
      <div className="flex items-center space-x-4">
        {brand.logo_url && (
          <div className="w-16 h-16 relative">
            <Image
              src={brand.logo_url}
              alt={brand.display_name}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{brand.display_name}</h3>
          <p className="text-sm text-gray-600">{brand.model_count} models available</p>
        </div>
        <div className="text-right">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
    </div>
  );

  const ModelCard: React.FC<{ model: Model }> = ({ model }) => (
    <div 
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
        ${selectedModel?.id === model.id 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={() => onModelSelect(model)}
    >
      <div className="flex items-center space-x-3">
        {model.image_url && (
          <div className="w-12 h-12 relative rounded-lg overflow-hidden">
            <Image
              src={model.image_url}
              alt={model.display_name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{model.display_name}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {model.release_year && <span>{model.release_year}</span>}
            {model.popularity_score && (
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span>{(model.popularity_score * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          {model.price_range && (
            <p className="text-xs text-gray-500">
              From ${model.price_range.min} - ${model.price_range.max}
            </p>
          )}
        </div>
        {model.is_featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Popular
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const PricingCard: React.FC<{ tier: string; data: PricingTier }> = ({ tier, data }) => (
    <div 
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-300
        ${data.recommended 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onTierSelect(tier)}
    >
      {data.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
            Recommended
          </span>
        </div>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">{tier}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">${data.price}</span>
          {data.savings && (
            <span className="text-sm text-green-600 ml-2">Save ${data.savings}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-sm text-gray-600">{data.warranty}</span>
        </div>
        
        <ul className="space-y-2">
          {data.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Brand Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Brand</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {selectedBrand && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Select Your Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </div>
      )}

      {/* Pricing Display */}
      {selectedModel && pricing && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Pricing Options</h2>
          
          {/* Service Header */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 capitalize">
              {selectedService?.replace('_', ' ')} for {selectedModel.display_name}
            </h3>
            <p className="text-gray-600 mt-2">
              Professional repair service with quality parts and warranty
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(pricing.tiers).map(([tier, data]) => (
              <PricingCard key={tier} tier={tier} data={data} />
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${pricing.cost_breakdown.parts_cost}</div>
                <div className="text-sm text-gray-600">Parts Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${pricing.cost_breakdown.labor_cost}</div>
                <div className="text-sm text-gray-600">Labor Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{pricing.cost_breakdown.markup_percentage}%</div>
                <div className="text-sm text-gray-600">Markup</div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Availability</h4>
                <p className="text-sm text-gray-600">
                  {pricing.availability.in_stock ? 'In Stock' : 'Out of Stock'} • 
                  {pricing.availability.lead_time_days} day lead time
                </p>
              </div>
              <div className="text-right">
                <div className={`w-3 h-3 rounded-full ${pricing.availability.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandModelPricingDisplay; 