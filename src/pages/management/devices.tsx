import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

interface DeviceType {
  id: number;
  name: string;
  display_name: string;
  is_active: boolean;
  sort_order: number;
}

interface Brand {
  id: number;
  name: string;
  display_name: string;
  device_type_id: number;
  device_type?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface Model {
  id: number;
  name: string;
  display_name?: string;
  brand_id: number;
  brand?: Brand;
  model_year?: number;
  screen_size?: string;
  color_options?: string[];
  storage_options?: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

type TabType = 'device-types' | 'brands' | 'models';

export default function DevicesAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('device-types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Device Types State
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [deviceTypeForm, setDeviceTypeForm] = useState({
    name: '',
    display_name: '',
    is_active: true,
    sort_order: 0
  });
  const [editingDeviceType, setEditingDeviceType] = useState<DeviceType | null>(null);
  
  // Brands State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandForm, setBrandForm] = useState({
    name: '',
    display_name: '',
    device_type_id: 0,
    logo_url: '',
    website_url: '',
    is_active: true,
    sort_order: 0
  });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Models State
  const [models, setModels] = useState<Model[]>([]);
  const [modelForm, setModelForm] = useState({
    name: '',
    display_name: '',
    brand_id: 0,
    model_year: new Date().getFullYear(),
    screen_size: '',
    color_options: '',
    storage_options: '',
    is_active: true,
    is_featured: false,
    sort_order: 0
  });
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadDeviceTypes();
    loadBrands();
    loadModels();
  }, []);

  // Load Device Types
  const loadDeviceTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/management/device-types');
      const data = await response.json();
      
      if (data.success) {
        setDeviceTypes(data.deviceTypes || []);
      } else {
        setError('Failed to load device types');
      }
    } catch (err) {
      setError('Error loading device types');
      console.error('Error loading device types:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Brands
  const loadBrands = async () => {
    try {
      const response = await fetch('/api/management/brands');
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.brands || []);
      } else {
        setError('Failed to load brands');
      }
    } catch (err) {
      setError('Error loading brands');
      console.error('Error loading brands:', err);
    }
  };

  // Load Models
  const loadModels = async () => {
    try {
      const response = await fetch('/api/management/models');
      const data = await response.json();
      
      if (data.success) {
        setModels(data.models || []);
      } else {
        setError('Failed to load models');
      }
    } catch (err) {
      setError('Error loading models');
      console.error('Error loading models:', err);
    }
  };

  // Device Type Functions
  const handleDeviceTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDeviceType 
        ? `/api/management/device-types/${editingDeviceType.id}`
        : '/api/management/device-types';
      
      const response = await fetch(url, {
        method: editingDeviceType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceTypeForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadDeviceTypes();
        setDeviceTypeForm({ name: '', display_name: '', is_active: true, sort_order: 0 });
        setEditingDeviceType(null);
      } else {
        setError(data.message || 'Failed to save device type');
      }
    } catch (err) {
      setError('Error saving device type');
      console.error('Error saving device type:', err);
    }
  };

  const handleEditDeviceType = (deviceType: DeviceType) => {
    setEditingDeviceType(deviceType);
    setDeviceTypeForm({
      name: deviceType.name,
      display_name: deviceType.display_name,
      is_active: deviceType.is_active,
      sort_order: deviceType.sort_order
    });
  };

  const handleDeleteDeviceType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this device type?')) return;
    
    try {
      const response = await fetch(`/api/management/device-types/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadDeviceTypes();
      } else {
        setError(data.message || 'Failed to delete device type');
      }
    } catch (err) {
      setError('Error deleting device type');
      console.error('Error deleting device type:', err);
    }
  };

  // Brand Functions
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBrand 
        ? `/api/management/brands/${editingBrand.id}`
        : '/api/management/brands';
      
      const response = await fetch(url, {
        method: editingBrand ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadBrands();
        setBrandForm({
          name: '',
          display_name: '',
          device_type_id: 0,
          logo_url: '',
          website_url: '',
          is_active: true,
          sort_order: 0
        });
        setEditingBrand(null);
      } else {
        setError(data.message || 'Failed to save brand');
      }
    } catch (err) {
      setError('Error saving brand');
      console.error('Error saving brand:', err);
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      display_name: brand.display_name,
      device_type_id: brand.device_type_id,
      logo_url: brand.logo_url || '',
      website_url: brand.website_url || '',
      is_active: brand.is_active,
      sort_order: brand.sort_order
    });
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      const response = await fetch(`/api/management/brands/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadBrands();
      } else {
        setError(data.message || 'Failed to delete brand');
      }
    } catch (err) {
      setError('Error deleting brand');
      console.error('Error deleting brand:', err);
    }
  };

  // Model Functions
  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingModel 
        ? `/api/management/models/${editingModel.id}`
        : '/api/management/models';
      
      const modelData = {
        ...modelForm,
        color_options: modelForm.color_options ? modelForm.color_options.split(',').map(c => c.trim()) : [],
        storage_options: modelForm.storage_options ? modelForm.storage_options.split(',').map(s => s.trim()) : []
      };
      
      const response = await fetch(url, {
        method: editingModel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadModels();
        setModelForm({
          name: '',
          display_name: '',
          brand_id: 0,
          model_year: new Date().getFullYear(),
          screen_size: '',
          color_options: '',
          storage_options: '',
          is_active: true,
          is_featured: false,
          sort_order: 0
        });
        setEditingModel(null);
      } else {
        setError(data.message || 'Failed to save model');
      }
    } catch (err) {
      setError('Error saving model');
      console.error('Error saving model:', err);
    }
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      display_name: model.display_name || '',
      brand_id: model.brand_id,
      model_year: model.model_year || new Date().getFullYear(),
      screen_size: model.screen_size || '',
      color_options: model.color_options?.join(', ') || '',
      storage_options: model.storage_options?.join(', ') || '',
      is_active: model.is_active,
      is_featured: model.is_featured,
      sort_order: model.sort_order
    });
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    
    try {
      const response = await fetch(`/api/management/models/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadModels();
      } else {
        setError(data.message || 'Failed to delete model');
      }
    } catch (err) {
      setError('Error deleting model');
      console.error('Error deleting model:', err);
    }
  };

  const getDeviceTypeName = (id: number) => {
    const deviceType = deviceTypes.find(dt => dt.id === id);
    return deviceType ? deviceType.display_name : 'Unknown';
  };

  const getBrandName = (id: number) => {
    const brand = brands.find(b => b.id === id);
    return brand ? brand.display_name : 'Unknown';
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
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-900 hover:text-red-700"
            >
              ×
            </button>
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
              <h2 className="text-xl font-semibold mb-4">
                {editingDeviceType ? 'Edit Device Type' : 'Add New Device Type'}
              </h2>
              <form onSubmit={handleDeviceTypeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={deviceTypeForm.name}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., mobile"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={deviceTypeForm.display_name}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Mobile Phone"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={deviceTypeForm.sort_order}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, sort_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deviceTypeForm.is_active}
                    onChange={(e) => setDeviceTypeForm({...deviceTypeForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingDeviceType ? 'Update' : 'Add'} Device Type
                  </button>
                  {editingDeviceType && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDeviceType(null);
                        setDeviceTypeForm({ name: '', display_name: '', is_active: true, sort_order: 0 });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Device Types List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Device Types</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deviceTypes.map((deviceType) => (
                      <tr key={deviceType.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {deviceType.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deviceType.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deviceType.sort_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            deviceType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {deviceType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditDeviceType(deviceType)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDeviceType(deviceType.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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
              <h2 className="text-xl font-semibold mb-4">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <form onSubmit={handleBrandSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., apple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={brandForm.display_name}
                    onChange={(e) => setBrandForm({...brandForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Apple"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <select
                    value={brandForm.device_type_id}
                    onChange={(e) => setBrandForm({...brandForm, device_type_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value={0}>Select Device Type</option>
                    {deviceTypes.map((deviceType) => (
                      <option key={deviceType.id} value={deviceType.id}>
                        {deviceType.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={brandForm.sort_order}
                    onChange={(e) => setBrandForm({...brandForm, sort_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={brandForm.website_url}
                    onChange={(e) => setBrandForm({...brandForm, website_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandForm.is_active}
                    onChange={(e) => setBrandForm({...brandForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingBrand ? 'Update' : 'Add'} Brand
                  </button>
                  {editingBrand && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(null);
                        setBrandForm({
                          name: '',
                          display_name: '',
                          device_type_id: 0,
                          logo_url: '',
                          website_url: '',
                          is_active: true,
                          sort_order: 0
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Brands List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Brands</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map((brand) => (
                      <tr key={brand.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {brand.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getDeviceTypeName(brand.device_type_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.sort_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditBrand(brand)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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
              <h2 className="text-xl font-semibold mb-4">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h2>
              <form onSubmit={handleModelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., iPhone 15 Pro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={modelForm.display_name}
                    onChange={(e) => setModelForm({...modelForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={modelForm.brand_id}
                    onChange={(e) => setModelForm({...modelForm, brand_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value={0}>Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.display_name} ({getDeviceTypeName(brand.device_type_id)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Year</label>
                  <input
                    type="number"
                    value={modelForm.model_year}
                    onChange={(e) => setModelForm({...modelForm, model_year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min="2000"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screen Size</label>
                  <input
                    type="text"
                    value={modelForm.screen_size}
                    onChange={(e) => setModelForm({...modelForm, screen_size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., 6.1 inches"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={modelForm.sort_order}
                    onChange={(e) => setModelForm({...modelForm, sort_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Options (comma-separated)</label>
                  <input
                    type="text"
                    value={modelForm.color_options}
                    onChange={(e) => setModelForm({...modelForm, color_options: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Black, White, Blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Options (comma-separated)</label>
                  <input
                    type="text"
                    value={modelForm.storage_options}
                    onChange={(e) => setModelForm({...modelForm, storage_options: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., 128GB, 256GB, 512GB"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={modelForm.is_active}
                      onChange={(e) => setModelForm({...modelForm, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={modelForm.is_featured}
                      onChange={(e) => setModelForm({...modelForm, is_featured: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Featured</label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingModel ? 'Update' : 'Add'} Model
                  </button>
                  {editingModel && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModel(null);
                        setModelForm({
                          name: '',
                          display_name: '',
                          brand_id: 0,
                          model_year: new Date().getFullYear(),
                          screen_size: '',
                          color_options: '',
                          storage_options: '',
                          is_active: true,
                          is_featured: false,
                          sort_order: 0
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Models List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Models</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {model.display_name || model.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getBrandName(model.brand_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.model_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            model.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {model.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            model.is_featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {model.is_featured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditModel(model)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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