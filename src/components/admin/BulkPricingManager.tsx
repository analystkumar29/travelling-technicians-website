import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface DeviceType {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface DeviceModel {
  id: string;
  name: string;
  brand_id: string;
}

interface Service {
  id: string;
  name: string;
  display_name: string;
  device_type_id: string;
}

interface PricingMatrixCell {
  standard: number | null;
  premium: number | null;
  service_id: string;
  model_id: string;
}

type StepType = 'device-type' | 'brand' | 'models' | 'services' | 'pricing' | 'matrix';

export default function BulkPricingManager() {
  const [currentStep, setCurrentStep] = useState<StepType>('device-type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selection state
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [pricing, setPricing] = useState({ standard: '', premium: '' });

  // Data state
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [matrixData, setMatrixData] = useState<{
    models: DeviceModel[];
    services: Service[];
    matrix: PricingMatrixCell[][];
  } | null>(null);

  // Load initial data
  useEffect(() => {
    loadDeviceTypes();
  }, []);

  // Load brands when device type changes
  useEffect(() => {
    if (selectedDeviceType) {
      loadBrands();
      setSelectedBrand('');
      setSelectedModels(new Set());
    }
  }, [selectedDeviceType]);

  // Load models when brand changes
  useEffect(() => {
    if (selectedDeviceType && selectedBrand) {
      loadModels();
    }
  }, [selectedDeviceType, selectedBrand]);

  // Load services when device type changes
  useEffect(() => {
    if (selectedDeviceType) {
      loadServices();
    }
  }, [selectedDeviceType]);

  const loadDeviceTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/devices/types');
      const data = await response.json();
      if (data.success) {
        setDeviceTypes(data.types || []);
      }
    } catch (err) {
      setError('Failed to load device types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/devices/brands?device_type_id=${selectedDeviceType}`
      );
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (err) {
      setError('Failed to load brands');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/management/device-models?brand_id=${selectedBrand}`
      );
      const data = await response.json();
      if (data.success) {
        setModels(data.data || []);
      }
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/pricing/services?deviceType=${deviceTypes.find(dt => dt.id === selectedDeviceType)?.name || ''}`
      );
      const data = await response.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPricingMatrix = async () => {
    try {
      setLoading(true);
      const modelIds = Array.from(selectedModels).join(',');
      const serviceIds = Array.from(selectedServices).join(',');

      const response = await fetch(
        `/api/management/pricing-matrix?device_type_id=${selectedDeviceType}&brand_id=${selectedBrand}&model_ids=${modelIds}&service_ids=${serviceIds}`
      );
      const data = await response.json();
      if (data.success) {
        setMatrixData({
          models: data.models || [],
          services: data.services || [],
          matrix: data.matrix || []
        });
      }
    } catch (err) {
      setError('Failed to load pricing matrix');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/management/bulk-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_type_id: selectedDeviceType,
          brand_id: selectedBrand,
          model_ids: Array.from(selectedModels),
          service_ids: Array.from(selectedServices),
          pricing: {
            standard: parseFloat(pricing.standard),
            premium: parseFloat(pricing.premium)
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully updated ${data.updated} pricing records!`);
        await loadPricingMatrix();
        setCurrentStep('matrix');
      } else {
        setError(data.message || 'Failed to save pricing');
      }
    } catch (err) {
      setError('Error saving pricing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (modelId: string) => {
    const newSet = new Set(selectedModels);
    if (newSet.has(modelId)) {
      newSet.delete(modelId);
    } else {
      newSet.add(modelId);
    }
    setSelectedModels(newSet);
  };

  const toggleService = (serviceId: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(serviceId)) {
      newSet.delete(serviceId);
    } else {
      newSet.add(serviceId);
    }
    setSelectedServices(newSet);
  };

  const selectAllModels = () => {
    const allModelIds = models.map(m => m.id);
    setSelectedModels(new Set(allModelIds));
  };

  const selectAllServices = () => {
    const allServiceIds = services.map(s => s.id);
    setSelectedServices(new Set(allServiceIds));
  };

  const canProceedToServices = selectedDeviceType && selectedBrand && selectedModels.size > 0;
  const canProceedToPricing = canProceedToServices && selectedServices.size > 0;
  const canSavePricing = canProceedToPricing && pricing.standard && pricing.premium;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-900 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-900 hover:text-green-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {(['device-type', 'brand', 'models', 'services', 'pricing', 'matrix'] as const).map(
          (step, index) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep === step
                    ? 'bg-primary-600 text-white'
                    : index < ['device-type', 'brand', 'models', 'services', 'pricing', 'matrix'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < ['device-type', 'brand', 'models', 'services', 'pricing', 'matrix'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>

      {/* Step 1: Device Type */}
      {currentStep === 'device-type' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Select Device Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceTypes.map(dt => (
              <button
                key={dt.id}
                onClick={() => {
                  setSelectedDeviceType(dt.id);
                  setCurrentStep('brand');
                }}
                className={`p-4 border-2 rounded-lg font-semibold transition ${
                  selectedDeviceType === dt.id
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {dt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Brand */}
      {currentStep === 'brand' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Select Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => {
                  setSelectedBrand(brand.id);
                  setCurrentStep('models');
                }}
                className={`p-3 border-2 rounded-lg font-semibold transition text-sm ${
                  selectedBrand === brand.id
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep('device-type')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Models */}
      {currentStep === 'models' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Step 3: Select Models</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAllModels}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedModels(new Set())}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {models.map(model => (
              <label key={model.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedModels.has(model.id)}
                  onChange={() => toggleModel(model.id)}
                  className="mr-3"
                />
                <span className="font-medium">{model.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep('brand')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep('services')}
              disabled={selectedModels.size === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Services */}
      {currentStep === 'services' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Step 4: Select Services</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAllServices}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedServices(new Set())}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {services.map(service => (
              <label key={service.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedServices.has(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="mr-3"
                />
                <span className="font-medium">{service.display_name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep('models')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep('pricing')}
              disabled={selectedServices.size === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Pricing */}
      {currentStep === 'pricing' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">Step 5: Set Pricing</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Selected:</strong> {selectedModels.size} model(s) × {selectedServices.size} service(s) = {selectedModels.size * selectedServices.size} pricing entries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Tier Price (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.standard}
                  onChange={e => setPricing({ ...pricing, standard: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="225.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Aftermarket parts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Tier Price (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.premium}
                  onChange={e => setPricing({ ...pricing, premium: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="279.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">OEM parts</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <p className="text-sm text-gray-600">
              This will create or update <strong>{selectedModels.size * selectedServices.size * 2}</strong> pricing records
              ({selectedModels.size * selectedServices.size} services × 2 tiers)
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep('services')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back
            </button>
            <button
              onClick={handleSavePricing}
              disabled={!canSavePricing || loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Pricing'}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Matrix View */}
      {currentStep === 'matrix' && matrixData && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Pricing Matrix</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 text-left text-sm font-semibold">Service</th>
                  {matrixData.models.map(model => (
                    <th key={model.id} className="border p-2 bg-gray-100 text-center text-sm font-semibold">
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.services.map((service, serviceIndex) => (
                  <tr key={service.id}>
                    <td className="border p-2 font-medium text-sm bg-gray-50">{service.display_name}</td>
                    {matrixData.matrix[serviceIndex].map(cell => (
                      <td key={`${cell.service_id}-${cell.model_id}`} className="border p-2 text-center text-sm">
                        <div className="space-y-1">
                          {cell.standard !== null && (
                            <div className="text-gray-700">
                              <span className="text-xs text-gray-500">Std:</span> ${cell.standard.toFixed(2)}
                            </div>
                          )}
                          {cell.premium !== null && (
                            <div className="text-gray-700">
                              <span className="text-xs text-gray-500">Prem:</span> ${cell.premium.toFixed(2)}
                            </div>
                          )}
                          {!cell.standard && !cell.premium && (
                            <span className="text-gray-400 text-xs">No pricing</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => {
                setCurrentStep('device-type');
                setSelectedDeviceType('');
                setSelectedBrand('');
                setSelectedModels(new Set());
                setSelectedServices(new Set());
                setPricing({ standard: '', premium: '' });
                setMatrixData(null);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Start New Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
