import { useState, useEffect, useRef } from 'react';

// Define types for device models
type DeviceType = 'mobile' | 'laptop' | 'tablet';
type BrandType = 'apple' | 'samsung' | 'google' | 'oneplus' | 'xiaomi' | 'dell' | 'hp' | 'lenovo' | 'asus' | 'microsoft' | 'other';

// Create a type that represents the structure of deviceModels
type DeviceModelsType = {
  [key in DeviceType]: {
    [brand in BrandType]?: string[];
  }
};

// Common device models by brand and type
const deviceModels: DeviceModelsType = {
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

interface DeviceModelSelectorProps {
  deviceType: DeviceType | string; // Accept string but will cast to DeviceType internally
  brand: string;
  value: string;
  onChange: (model: string) => void;
}

export default function DeviceModelSelector({
  deviceType,
  brand,
  value,
  onChange
}: DeviceModelSelectorProps) {
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Normalize inputs
  const normalizedDeviceType = deviceType?.toLowerCase() as DeviceType;
  const normalizedBrand = brand?.toLowerCase() as BrandType;

  // Get models for the selected device type and brand
  const getAvailableModels = () => {
    if (!deviceType || !brand || brand.toLowerCase() === 'other') {
      return [];
    }
    
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
      console.error('Error getting models:', error);
      return [];
    }
  };

  // Available models
  const availableModels = getAvailableModels();
  
  // Debug info
  console.log('DeviceModelSelector:', {
    deviceType: normalizedDeviceType,
    brand: normalizedBrand,
    value,
    availableModels: availableModels.length
  });

  // Effect to reset when device type or brand changes
  useEffect(() => {
    // If the current value is no longer in the available models, reset it
    if (value && !availableModels.includes(value)) {
      onChange('');
      setUseCustomModel(false);
      setCustomModel('');
    }
  }, [deviceType, brand, value, availableModels, onChange]);

  // Effect to handle value changes from outside
  useEffect(() => {
    if (value && !availableModels.includes(value) && value !== customModel) {
      setCustomModel(value);
      setUseCustomModel(true);
    }
  }, [value, availableModels, customModel]);

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
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Get placeholder text
  const getPlaceholderText = () => {
    if (!brand) return 'Select a brand first';
    return `Select your ${brand} ${deviceType} model`;
  };

  return (
    <div>
      {/* Model selector */}
      <select
        ref={selectRef}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        value={useCustomModel ? 'custom' : value}
        onChange={handleSelectChange}
        disabled={!brand || availableModels.length === 0}
      >
        <option value="" disabled selected={!value && !useCustomModel}>
          {getPlaceholderText()}
        </option>
        
        {availableModels.map((model, index) => (
          <option key={index} value={model}>
            {model}
          </option>
        ))}
        
        <option value="custom">My model isn't listed</option>
      </select>

      {/* Custom model input - shown when "My model isn't listed" is selected */}
      {useCustomModel && (
        <div className="mt-2">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={`Enter your ${deviceType} model manually`}
            value={customModel}
            onChange={handleCustomModelChange}
            autoFocus
          />
        </div>
      )}
      
      {/* Quick model links for common models */}
      {!value && !useCustomModel && availableModels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {availableModels.slice(0, 3).map((model, idx) => (
            <button
              key={idx}
              type="button"
              className="text-primary-600 hover:text-primary-800 underline"
              onClick={() => {
                onChange(model);
                if (selectRef.current) {
                  selectRef.current.value = model;
                }
              }}
            >
              {model}
            </button>
          ))}
          {availableModels.length > 3 && (
            <span className="text-gray-500">
              + {availableModels.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
} 