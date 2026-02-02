import { useState, useEffect, useRef, useCallback } from 'react';

// Define types for device models
type DeviceType = 'mobile' | 'laptop' | 'tablet';

interface Model {
  id: number;
  name: string;
  brandId: number;
  isActive: boolean;
  quality_score?: number;
  needs_review?: boolean;
  data_source?: string;
}

interface DeviceModelSelectorProps {
  deviceType: DeviceType | string;
  brand: string;
  value: string;
  onChange: (model: string) => void;
}

// Emergency blacklist for contaminated model names
const EMERGENCY_BLACKLIST = [
  'QV7', 'QV6', 'QV8', 
  'CE2', 'CE3', 'T1', 'T2', 'T3',
  'Premium', 'Standard', 'Economy', 'Compatible', 'Assembly',
  '35G00263', '35H00261', '35G00262', '35G00264', '35G00265', '35G00266',
  'LCD', 'OLED', 'Aftermarket', 'OEM', 'Original',
  // More specific patterns that won't match legitimate model numbers
  'unknown', 'null', 'undefined', 'n/a', 'none'
];

// Function to check if a model name is blacklisted
const isBlacklistedModel = (modelName: string): boolean => {
  const normalizedName = modelName.toLowerCase().trim();
  
  // Check for exact matches or whole word matches for contaminated terms
  return EMERGENCY_BLACKLIST.some(blocked => {
    const normalizedBlocked = blocked.toLowerCase();
    
    // Exact match for short terms
    if (normalizedName === normalizedBlocked) {
      return true;
    }
    
    // For technical codes, check if they appear as standalone terms
    if (/^[A-Z]+\d+$/i.test(blocked)) {
      const regex = new RegExp(`\\b${normalizedBlocked}\\b`, 'i');
      return regex.test(normalizedName);
    }
    
    // For part numbers, check exact match
    if (/^\d{5}[A-Z0-9]{5}$/.test(blocked)) {
      return normalizedName.includes(normalizedBlocked);
    }
    
    // For word-based blacklist items, check as whole words
    const regex = new RegExp(`\\b${normalizedBlocked}\\b`, 'i');
    return regex.test(normalizedName);
  });
};

// Function to filter models based on quality score and blacklist
const filterQualityModels = (models: Model[]): Model[] => {
  return models.filter(model => {
    // Filter out blacklisted models
    if (isBlacklistedModel(model.name)) {
      return false;
    }
    
    // Filter out models that need review
    if (model.needs_review === true) {
      return false;
    }
    
    // Filter out low quality scores (if quality_score exists)
    if (model.quality_score !== undefined && model.quality_score < 70) {
      return false;
    }
    
    // Keep model if it passes all checks
    return true;
  });
};

export default function DeviceModelSelector({
  deviceType,
  brand,
  value,
  onChange
}: DeviceModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Normalize inputs
  const normalizedDeviceType = deviceType?.toLowerCase() as DeviceType;
  const normalizedBrand = brand?.toLowerCase();

  // Static models as fallback (keeping the original logic temporarily)
  const getStaticModels = useCallback((): string[] => {
    // Hardcoded fallback data structure (temporary)
    const deviceModels: Record<string, Record<string, string[]>> = {
      mobile: {
        apple: [
          'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
          'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
          'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
          'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
          'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
          'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
          'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7',
          'iPhone SE (3rd Gen)', 'iPhone SE (2nd Gen)', 'iPhone SE'
        ],
        samsung: [
          'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
          'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
          'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
          'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
          'Galaxy Note 20 Ultra', 'Galaxy Note 20',
          'Galaxy Note 10+', 'Galaxy Note 10',
          'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3',
          'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
          'Galaxy A54', 'Galaxy A53', 'Galaxy A52', 'Galaxy A51',
          'Galaxy A34', 'Galaxy A33', 'Galaxy A32',
          'Galaxy A24', 'Galaxy A23', 'Galaxy A22'
        ],
        google: [
          'Pixel 8 Pro', 'Pixel 8', 
          'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
          'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
          'Pixel 5', 'Pixel 5a',
          'Pixel 4 XL', 'Pixel 4', 'Pixel 4a',
          'Pixel 3 XL', 'Pixel 3', 'Pixel 3a'
        ],
        oneplus: [
          'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 10T',
          'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9R',
          'OnePlus 8 Pro', 'OnePlus 8', 'OnePlus 8T',
          'OnePlus 7 Pro', 'OnePlus 7', 'OnePlus 7T',
          'OnePlus Nord 3', 'OnePlus Nord 2', 'OnePlus Nord'
        ],
        xiaomi: [
          'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 12 Pro', 'Xiaomi 12',
          'Xiaomi 11 Ultra', 'Xiaomi 11', 'Xiaomi 11T Pro', 'Xiaomi 11T',
          'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
          'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11',
          'POCO F5 Pro', 'POCO F5', 'POCO F4', 'POCO F3'
        ]
      },
      laptop: {
        apple: [
          'MacBook Pro 16" (M3 Pro/Max)', 'MacBook Pro 14" (M3 Pro/Max)', 'MacBook Pro 13" (M3)',
          'MacBook Pro 16" (M2 Pro/Max)', 'MacBook Pro 14" (M2 Pro/Max)', 'MacBook Pro 13" (M2)',
          'MacBook Pro 16" (M1 Pro/Max)', 'MacBook Pro 14" (M1 Pro/Max)', 'MacBook Pro 13" (M1)',
          'MacBook Pro 16" (2019)', 'MacBook Pro 15" (2019)', 'MacBook Pro 13" (2020)',
          'MacBook Air 15" (M3)', 'MacBook Air 13" (M3)',
          'MacBook Air 13" (M2)', 'MacBook Air 13" (M1)',
          'MacBook Air 13" (2020)', 'MacBook Air 13" (2019)'
        ],
        dell: [
          'XPS 17 (2023)', 'XPS 15 (2023)', 'XPS 13 (2023)', 'XPS 13 Plus (2023)',
          'XPS 17 (2022)', 'XPS 15 (2022)', 'XPS 13 (2022)', 'XPS 13 Plus (2022)',
          'Inspiron 16 Plus', 'Inspiron 16', 'Inspiron 15', 'Inspiron 14',
          'Latitude 9430', 'Latitude 7430', 'Latitude 5430', 'Latitude 3430',
          'Precision 7780', 'Precision 5680', 'Precision 3480'
        ],
        hp: [
          'Spectre x360 16', 'Spectre x360 14', 'Spectre x360 13',
          'Envy x360 15', 'Envy x360 14', 'Envy x360 13',
          'EliteBook 1040', 'EliteBook 840', 'EliteBook 640',
          'Pavilion 15', 'Pavilion 14', 'Pavilion x360',
          'Omen 17', 'Omen 16', 'Omen 15',
          'ZBook Fury 17', 'ZBook Fury 16', 'ZBook Power'
        ],
        lenovo: [
          'ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Yoga Gen 8', 'ThinkPad X1 Nano Gen 3',
          'ThinkPad T14s Gen 4', 'ThinkPad T14 Gen 4', 'ThinkPad T16 Gen 2',
          'ThinkPad P1 Gen 6', 'ThinkPad P16 Gen 1', 'ThinkPad P15 Gen 2',
          'Yoga 9i Gen 8', 'Yoga 7i Gen 8', 'Yoga 6 Gen 8',
          'IdeaPad Slim 7', 'IdeaPad Slim 5', 'IdeaPad Flex 5',
          'Legion 7 Gen 8', 'Legion 5 Pro Gen 8', 'Legion 5 Gen 8'
        ],
        asus: [
          'ZenBook Pro 16X', 'ZenBook Pro 14', 'ZenBook 14X',
          'ROG Zephyrus G16', 'ROG Zephyrus G14', 'ROG Strix Scar 17',
          'ROG Flow X16', 'ROG Flow X13', 'ROG Flow Z13',
          'TUF Gaming A17', 'TUF Gaming A15', 'TUF Gaming F15',
          'VivoBook Pro 16X', 'VivoBook Pro 15', 'VivoBook S15',
          'ExpertBook B9', 'ExpertBook B7', 'ExpertBook B5'
        ]
      },
      tablet: {
        apple: [
          'iPad Pro 12.9" (M2)', 'iPad Pro 11" (M2)',
          'iPad Air (5th Gen)', 'iPad Air (4th Gen)',
          'iPad (10th Gen)', 'iPad (9th Gen)',
          'iPad Mini (6th Gen)', 'iPad Mini (5th Gen)'
        ],
        samsung: [
          'Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9',
          'Galaxy Tab S8 Ultra', 'Galaxy Tab S8+', 'Galaxy Tab S8',
          'Galaxy Tab S7+', 'Galaxy Tab S7',
          'Galaxy Tab A9+', 'Galaxy Tab A9', 'Galaxy Tab A8', 'Galaxy Tab A7'
        ],
        microsoft: [
          'Surface Pro 9', 'Surface Pro 8', 'Surface Pro 7+', 'Surface Pro 7',
          'Surface Pro X', 'Surface Go 3', 'Surface Go 2'
        ],
        lenovo: [
          'Tab P12 Pro', 'Tab P11 Pro Gen 2', 'Tab P11 Pro',
          'Tab P11 (2nd Gen)', 'Tab P11',
          'Tab M10 Plus Gen 3', 'Tab M10 FHD Plus',
          'Yoga Tab 13', 'Yoga Tab 11'
        ]
      }
    };

    try {
      const deviceTypeModels = deviceModels[normalizedDeviceType];
      if (!deviceTypeModels) {
        return [];
      }
      
      const brandModels = deviceTypeModels[normalizedBrand];
      if (!brandModels) {
        return [];
      }
      
      return brandModels;
    } catch (error) {
      console.error('Error getting fallback models:', error);
      return [];
    }
  }, [normalizedDeviceType, normalizedBrand]);

  // Fallback static data (temporary until API is fully implemented)
  const getFallbackModels = useCallback((): Model[] => {
    const staticModels = getStaticModels();
    return staticModels.map((name, index) => ({
      id: index + 1,
      name,
      brandId: 1,
      isActive: true
    }));
  }, [getStaticModels]);

  // Fetch models from API when brand or device type changes
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try dynamic API first, fall back to static data if API not available
      const response = await fetch(`/api/devices/models?deviceType=${encodeURIComponent(normalizedDeviceType)}&brand=${encodeURIComponent(normalizedBrand)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Apply quality filtering to API models
        const filteredModels = filterQualityModels(data.models || []);
        
        // If no quality models found from API, use static fallback
        if (filteredModels.length === 0) {
          console.log('No quality models found in API, using fallback static data');
          const fallbackModels = getFallbackModels();
          setModels(fallbackModels);
        } else {
          setModels(filteredModels);
        }
      } else {
        // Fallback to static data if API endpoint doesn't exist yet
        console.log('API endpoint not available, using fallback static data');
        const fallbackModels = getFallbackModels();
        setModels(fallbackModels);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to load models');
      
      // Fallback to static data on error
      const fallbackModels = getFallbackModels();
      setModels(fallbackModels);
    } finally {
      setLoading(false);
    }
  }, [normalizedBrand, normalizedDeviceType, getFallbackModels]);

  useEffect(() => {
    if (!deviceType || !brand || brand.toLowerCase() === 'other') {
      setModels([]);
      return;
    }

    fetchModels();
  }, [deviceType, brand, fetchModels]);

  // Effect to reset when device type or brand changes
  useEffect(() => {
    // If the current value is no longer in the available models, reset it
    const modelNames = models.map(m => m.name);
    if (value && !modelNames.includes(value)) {
      onChange('');
      setUseCustomModel(false);
      setCustomModel('');
    }
  }, [models, value, onChange]);

  // Effect to handle value changes from outside
  useEffect(() => {
    const modelNames = models.map(m => m.name);
    if (value && !modelNames.includes(value) && value !== customModel) {
      setCustomModel(value);
      setUseCustomModel(true);
    }
  }, [value, models, customModel]);

  // Handle selection change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'custom') {
      setUseCustomModel(true);
      // Don't change the model yet - wait for custom input
    } else {
      setUseCustomModel(false);
      onChange(selectedValue);
    }
  };

  // Handle custom model input
  const handleCustomModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomModel(newValue);
    onChange(newValue);
  };

  // For "Other" brand, just show a text input
  if (brand && brand.toLowerCase() === 'other') {
    return (
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder={`Enter your ${deviceType} model (e.g., ${
          deviceType === 'mobile' ? 'Motorola Edge 40' : 
          deviceType === 'laptop' ? 'Acer Swift 5' : 'Huawei MatePad Pro'
        })`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Get placeholder text
  const getPlaceholderText = () => {
    if (!brand) return 'Select a brand first';
    if (loading) return 'Loading models...';
    if (error) return 'Error loading models';
    if (models.length === 0) return `No ${brand} ${deviceType} models available`;
    return `Select your ${brand} ${deviceType} model`;
  };

  return (
    <div>
      {/* Model selector */}
      <select
        ref={selectRef}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={useCustomModel ? 'custom' : (value || '')}
        onChange={handleSelectChange}
        disabled={!brand || loading || models.length === 0}
      >
        <option value="">
          {getPlaceholderText()}
        </option>
        
        {models.map((model) => (
          <option key={model.id} value={model.name}>
            {model.name}
          </option>
        ))}
        
        {models.length > 0 && (
          <option value="custom">My model isn't listed</option>
        )}
      </select>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading available models...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error} (using fallback data)
        </div>
      )}

      {/* Custom model input - shown when "My model isn't listed" is selected */}
      {useCustomModel && (
        <div className="mt-2">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={`Enter your ${deviceType} model manually`}
            value={customModel || ''}
            onChange={handleCustomModelChange}
            autoFocus
          />
        </div>
      )}
      
      {/* Quick model links for popular models */}
      {!value && !useCustomModel && models.length > 0 && !loading && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {models.slice(0, 3).map((model) => (
            <button
              key={model.id}
              type="button"
              className="text-primary-600 hover:text-primary-800 underline"
              onClick={() => {
                onChange(model.name);
              }}
            >
              {model.name}
            </button>
          ))}
          {models.length > 3 && (
            <span className="text-gray-500">
              + {models.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
