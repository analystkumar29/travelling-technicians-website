import { useState, useEffect } from 'react';

// Common device models by brand and type
const deviceModels = {
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
  deviceType: string;
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
  const [showModelList, setShowModelList] = useState(false);
  const [otherModel, setOtherModel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  // Reset when device type or brand changes
  useEffect(() => {
    setShowModelList(false);
    setOtherModel('');
    setSearchTerm('');
    setSelectedModel('');
    onChange('');
  }, [deviceType, brand, onChange]);

  // Set the model when selected model changes
  useEffect(() => {
    if (selectedModel) {
      onChange(selectedModel);
    } else if (otherModel) {
      onChange(otherModel);
    }
  }, [selectedModel, otherModel, onChange]);

  // Get models for the selected device type and brand
  const getModelsForSelection = () => {
    if (!deviceType || !brand || brand === 'other') {
      return [];
    }
    
    try {
      return deviceModels[deviceType as keyof typeof deviceModels][brand as any] || [];
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  };

  // Filter models based on search term
  const filteredModels = getModelsForSelection().filter(
    model => model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-6">
      <label htmlFor="device-model" className="block text-gray-700 font-medium mb-2">
        Model *
      </label>
      
      {brand === 'other' ? (
        // For "Other Brand", just show a text input
        <input
          type="text"
          id="device-model"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={`Enter your ${deviceType} model (e.g., ${
            deviceType === 'mobile' ? 'Motorola Edge 40' : 
            deviceType === 'laptop' ? 'Acer Swift 5' : 'Huawei MatePad Pro'
          })`}
          value={otherModel}
          onChange={(e) => setOtherModel(e.target.value)}
        />
      ) : (
        <div>
          {/* Button to show/hide model list */}
          <button
            type="button"
            onClick={() => setShowModelList(!showModelList)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center"
          >
            <span className={selectedModel ? 'text-gray-900' : 'text-gray-500'}>
              {selectedModel || 'Select your device model'}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${showModelList ? 'transform rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Model list dropdown */}
          {showModelList && (
            <div className="mt-2 border border-gray-300 rounded-md shadow-sm overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-gray-300">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Search for your model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Model list */}
              <div className="max-h-60 overflow-y-auto">
                {filteredModels.length > 0 ? (
                  filteredModels.map((model, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedModel === model ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                      onClick={() => {
                        setSelectedModel(model);
                        setOtherModel('');
                        setShowModelList(false);
                      }}
                    >
                      {model}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No models match your search' : 'No models available'}
                  </div>
                )}
              </div>

              {/* Enter custom model option */}
              <div className="p-2 border-t border-gray-300">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md flex items-center"
                  onClick={() => {
                    setShowModelList(false);
                    setSelectedModel('');
                    // Set focus to the custom model input
                    setTimeout(() => {
                      const customModelInput = document.getElementById('custom-model-input');
                      if (customModelInput) {
                        (customModelInput as HTMLInputElement).focus();
                      }
                    }, 10);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  My model isn't listed
                </button>
              </div>
            </div>
          )}

          {/* Custom model input */}
          {!showModelList && !selectedModel && (
            <div className="mt-2">
              <input
                id="custom-model-input"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={`Enter your ${deviceType} model manually`}
                value={otherModel}
                onChange={(e) => setOtherModel(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Selected or entered model display */}
      {(selectedModel || otherModel) && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {selectedModel || otherModel}
        </div>
      )}
    </div>
  );
} 