import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

// Actual database schema interfaces
interface DeviceType {
  id: string;
  name: string;
  slug: string;
  icon_name?: string;
  is_active: boolean;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  type_id: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  device_type?: {
    id: string;
    name: string;
    slug: string;
  };
  release_year?: number;
  image_url?: string;
  is_active: boolean;
}

type TabType = 'device-types' | 'brands' | 'models';

export default function DevicesAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('device-types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Device Types State
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [deviceTypeForm, setDeviceTypeForm] = useState({
    name: '',
    slug: '',
    icon_name: '',
    is_active: true
  });
  
  // Brands State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    logo_url: '',
    is_active: true
  });
  
  // Models State
  const [models, setModels] = useState<Model[]>([]);
  const [modelForm, setModelForm] = useState({
    name: '',
    slug: '',
    brand_id: '',
    type_id: '',
    release_year: new Date().getFullYear(),
    image_url: '',
    is_active: true
  });

  // Load data on mount
  useEffect(() => {
    loadDeviceTypes();
    loadBrands();
    loadModels();
  }, []);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Load Device Types
  const loadDeviceTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/management/device-types');
      const result = await response.json();
      
      if (result.success) {
        setDeviceTypes(result.data || result.deviceTypes || []);
      } else {
        setError('Failed to load device types');
      }
    } catch (err) {
      setError('Error loading device types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Brands
  const loadBrands = async () => {
    try {
      const response = await fetch('/api/management/brands');
      const result = await response.json();
      
      if (result.success) {
        setBrands(result.data || result.brands || []);
      } else {
        setError('Failed to load brands');
      }
    } catch (err) {
      setError('Error loading brands');
      console.error(err);
    }
  };

  // Load Models
  const loadModels = async () => {
    try {
      const response = await fetch('/api/management/models');
      const result = await response.json();
      
      if (result.success) {
        setModels(result.data || result.models || []);
      } else {
        setError('Failed to load models');
      }
    } catch (err) {
      setError('Error loading models');
      console.error(err);
    }
  };

  // Device Type Handlers
  const handleDeviceTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!deviceTypeForm.name || !deviceTypeForm.slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/management/device-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceTypeForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Device type added successfully!');
        loadDeviceTypes();
        setDeviceTypeForm({ name: '', slug: '', icon_name: '', is_active: true });
      } else {
        setError(data.message || 'Failed to save device type');
      }
    } catch (err) {
      setError('Error saving device type');
      console.error(err);
    }
  };

  // Brand Handlers
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!brandForm.name || !brandForm.slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/management/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Brand added successfully!');
        loadBrands();
        setBrandForm({ name: '', slug: '', logo_url: '', is_active: true });
      } else {
        setError(data.message || 'Failed to save brand');
      }
    } catch (err) {
      setError('Error saving brand');
      console.error(err);
    }
  };

  // Model Handlers
  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!modelForm.name || !modelForm.slug || !modelForm.brand_id || !modelForm.type_id) {
      setError('Name, slug, brand, and device type are required');
      return;
    }

    try {
      const response = await fetch('/api/management/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Model added successfully!');
        loadModels();
        setModelForm({
          name: '',
          slug: '',
          brand_id: '',
          type_id: '',
          release_year: new Date().getFullYear(),
          image_url: '',
          is_active: true
        });
      } else {
        setError(data.message || 'Failed to save model');
      }
    } catch (err) {
      setError('Error saving model');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
          <button
            onClick={() => router.push('/management')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-900 hover:text-red-700">×</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
            <button onClick={() => setSuccess(null)} className="ml-2 text-green-900 hover:text-green-700">×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'device-types', label: 'Device Types', count: deviceTypes.length },
              { key: 'brands', label: 'Brands', count: brands.length },
              { key: 'models', label: 'Models', count: models.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Device Types Tab */}
        {activeTab === 'device-types' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Device Type</h2>
              <form onSubmit={handleDeviceTypeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={deviceTypeForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setDeviceTypeForm({
                        ...deviceTypeForm,
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Mobile Phone"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug * (auto-generated)</label>
                  <input
                    type="text"
                    value={deviceTypeForm.slug}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., mobile-phone"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={deviceTypeForm.icon_name}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, icon_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., smartphone"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deviceTypeForm.is_active}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, is_active: e.target.checked})}
                    className="mr-2"
                    id="devicetype-active"
                  />
                  <label htmlFor="devicetype-active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Add Device Type
                  </button>
                </div>
              </form>
            </div>

            {/* Device Types List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Device Types ({deviceTypes.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deviceTypes.map((deviceType) => (
                      <tr key={deviceType.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deviceType.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deviceType.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deviceType.icon_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            deviceType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {deviceType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Brand</h2>
              <form onSubmit={handleBrandSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setBrandForm({
                        ...brandForm,
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Apple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug * (auto-generated)</label>
                  <input
                    type="text"
                    value={brandForm.slug}
                    onChange={(e) => setBrandForm({...brandForm, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., apple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={brandForm.logo_url}
                    onChange={(e) => setBrandForm({...brandForm, logo_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandForm.is_active}
                    onChange={(e) => setBrandForm({...brandForm, is_active: e.target.checked})}
                    className="mr-2"
                    id="brand-active"
                  />
                  <label htmlFor="brand-active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Add Brand
                  </button>
                </div>
              </form>
            </div>

            {/* Brands List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Brands ({brands.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map((brand) => (
                      <tr key={brand.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.logo_url ? <span className="text-blue-600">✓</span> : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Model</h2>
              <form onSubmit={handleModelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setModelForm({
                        ...modelForm,
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., iPhone 15 Pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug * (auto-generated)</label>
                  <input
                    type="text"
                    value={modelForm.slug}
                    onChange={(e) => setModelForm({...modelForm, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., iphone-15-pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                  <select
                    value={modelForm.type_id}
                    onChange={(e) => setModelForm({...modelForm, type_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Device Type</option>
                    {deviceTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>{dt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <select
                    value={modelForm.brand_id}
                    onChange={(e) => setModelForm({...modelForm, brand_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={modelForm.release_year}
                    onChange={(e) => setModelForm({...modelForm, release_year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min="2000"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={modelForm.image_url}
                    onChange={(e) => setModelForm({...modelForm, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={modelForm.is_active}
                    onChange={(e) => setModelForm({...modelForm, is_active: e.target.checked})}
                    className="mr-2"
                    id="model-active"
                  />
                  <label htmlFor="model-active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Add Model
                  </button>
                </div>
              </form>
            </div>

            {/* Models List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Models ({models.length})</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{model.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.brand?.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.device_type?.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.release_year || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            model.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {model.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
