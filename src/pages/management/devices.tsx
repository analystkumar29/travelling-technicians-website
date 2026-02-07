import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { authFetch, handleAuthError } from '@/utils/auth';
import { toast } from 'sonner';

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

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_name?: string;
  device_type_id: string;
  category_id?: string;
  is_active: boolean;
  is_doorstep_eligible: boolean;
  requires_diagnostics: boolean;
  estimated_duration_minutes: number;
  created_at?: string;
  device_type?: {
    id: string;
    name: string;
    slug: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

type TabType = 'device-types' | 'brands' | 'models' | 'services';

export default function DevicesAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('device-types');
  const [loading, setLoading] = useState(false);

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

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    slug: '',
    display_name: '',
    description: '',
    device_type_id: '',
    category_id: '',
    is_active: true,
    is_doorstep_eligible: true,
    requires_diagnostics: false,
    estimated_duration_minutes: 45
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Load data on mount and when tab changes
  useEffect(() => {
    loadDeviceTypes();
    loadBrands();
    loadModels();
    if (activeTab === 'services') {
      loadServices();
      loadServiceCategories();
    }
  }, [activeTab]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Load Device Types
  const loadDeviceTypes = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/management/device-types');
      const result = await response.json();

      if (result.success) {
        setDeviceTypes(result.data || result.deviceTypes || []);
      } else {
        toast.error('Failed to load device types');
      }
    } catch (err) {
      toast.error('Error loading device types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Brands
  const loadBrands = async () => {
    try {
      const response = await authFetch('/api/management/brands');
      const result = await response.json();

      if (result.success) {
        setBrands(result.data || result.brands || []);
      } else {
        toast.error('Failed to load brands');
      }
    } catch (err) {
      toast.error('Error loading brands');
      console.error(err);
    }
  };

  // Load Models
  const loadModels = async () => {
    try {
      const response = await authFetch('/api/management/models');
      const result = await response.json();

      if (result.success) {
        setModels(result.data || result.models || []);
      } else {
        toast.error('Failed to load models');
      }
    } catch (err) {
      toast.error('Error loading models');
      console.error(err);
    }
  };

  // Load Services
  const loadServices = async () => {
    try {
      const response = await authFetch('/api/management/services');
      const result = await response.json();

      if (result.success) {
        setServices(result.services || []);
      } else {
        toast.error('Failed to load services');
      }
    } catch (err) {
      toast.error('Error loading services');
      console.error(err);
    }
  };

  // Load Service Categories
  const loadServiceCategories = async () => {
    try {
      // Use the enhanced services API that now supports categories parameter
      const response = await authFetch('/api/management/services?categories=true');
      const result = await response.json();

      if (result.success && result.categories) {
        setServiceCategories(result.categories);
      } else {
        // Fallback to empty array
        setServiceCategories([]);
      }
    } catch (err) {
      console.error('Error loading service categories:', err);
      setServiceCategories([]);
    }
  };

  // Device Type Handlers
  const handleDeviceTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!deviceTypeForm.name || !deviceTypeForm.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      const response = await authFetch('/api/management/device-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceTypeForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Device type added successfully!');
        loadDeviceTypes();
        setDeviceTypeForm({ name: '', slug: '', icon_name: '', is_active: true });
      } else {
        toast.error(data.message || 'Failed to save device type');
      }
    } catch (err) {
      toast.error('Error saving device type');
      console.error(err);
    }
  };

  // Brand Handlers
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!brandForm.name || !brandForm.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      const response = await authFetch('/api/management/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Brand added successfully!');
        loadBrands();
        setBrandForm({ name: '', slug: '', logo_url: '', is_active: true });
      } else {
        toast.error(data.message || 'Failed to save brand');
      }
    } catch (err) {
      toast.error('Error saving brand');
      console.error(err);
    }
  };

  // Model Handlers
  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!modelForm.name || !modelForm.slug || !modelForm.brand_id || !modelForm.type_id) {
      toast.error('Name, slug, brand, and device type are required');
      return;
    }

    try {
      const response = await authFetch('/api/management/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Model added successfully!');
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
        toast.error(data.message || 'Failed to save model');
      }
    } catch (err) {
      toast.error('Error saving model');
      console.error(err);
    }
  };

  // Service Handlers
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!serviceForm.name || !serviceForm.slug || !serviceForm.device_type_id) {
      toast.error('Name, slug, and device type are required');
      return;
    }

    try {
      const method = editingServiceId ? 'PUT' : 'POST';
      const url = editingServiceId
        ? `/api/management/services?id=${editingServiceId}`
        : '/api/management/services';

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingServiceId ? 'Service updated successfully!' : 'Service added successfully!');
        loadServices();
        resetServiceForm();
      } else {
        toast.error(data.message || `Failed to ${editingServiceId ? 'update' : 'save'} service`);
      }
    } catch (err) {
      toast.error(`Error ${editingServiceId ? 'updating' : 'saving'} service`);
      console.error(err);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      slug: service.slug,
      display_name: service.display_name || '',
      description: service.description || '',
      device_type_id: service.device_type_id,
      category_id: service.category_id || '',
      is_active: service.is_active,
      is_doorstep_eligible: service.is_doorstep_eligible,
      requires_diagnostics: service.requires_diagnostics,
      estimated_duration_minutes: service.estimated_duration_minutes
    });
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    resetServiceForm();
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      slug: '',
      display_name: '',
      description: '',
      device_type_id: '',
      category_id: '',
      is_active: true,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      estimated_duration_minutes: 45
    });
    setEditingServiceId(null);
  };

  const handleToggleServiceActive = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await authFetch(`/api/management/services?id=${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Service ${isActive ? 'activated' : 'deactivated'} successfully!`);
        loadServices();
      } else {
        toast.error(data.message || `Failed to ${isActive ? 'activate' : 'deactivate'} service`);
      }
    } catch (err) {
      toast.error(`Error ${isActive ? 'activating' : 'deactivating'} service`);
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Device Management">
      <AdminPageHeader
        title="Device Management"
        description="Manage device types, brands, models, and services for your repair catalog"
      />

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          {[
            { key: 'device-types', label: 'Device Types', count: deviceTypes.length },
            { key: 'brands', label: 'Brands', count: brands.length },
            { key: 'models', label: 'Models', count: models.length },
            { key: 'services', label: 'Services', count: services.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Device Type</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., smartphone"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={deviceTypeForm.is_active}
                  onChange={(e) => setDeviceTypeForm({...deviceTypeForm, is_active: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="devicetype-active"
                />
                <label htmlFor="devicetype-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors">
                  Add Device Type
                </button>
              </div>
            </form>
          </div>

          {/* Device Types List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Device Types ({deviceTypes.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Brand</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={brandForm.is_active}
                  onChange={(e) => setBrandForm({...brandForm, is_active: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="brand-active"
                />
                <label htmlFor="brand-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors">
                  Add Brand
                </button>
              </div>
            </form>
          </div>

          {/* Brands List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Brands ({brands.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Model</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., iphone-15-pro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                <select
                  value={modelForm.type_id}
                  onChange={(e) => setModelForm({...modelForm, type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={modelForm.is_active}
                  onChange={(e) => setModelForm({...modelForm, is_active: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="model-active"
                />
                <label htmlFor="model-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors">
                  Add Model
                </button>
              </div>
            </form>
          </div>

          {/* Models List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Models ({models.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingServiceId ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setServiceForm({
                      ...serviceForm,
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Screen Replacement"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug * (auto-generated)</label>
                <input
                  type="text"
                  value={serviceForm.slug}
                  onChange={(e) => setServiceForm({...serviceForm, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., screen-replacement"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={serviceForm.display_name}
                  onChange={(e) => setServiceForm({...serviceForm, display_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Screen Repair Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                <select
                  value={serviceForm.device_type_id}
                  onChange={(e) => setServiceForm({...serviceForm, device_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Device Type</option>
                  {deviceTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>{dt.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={serviceForm.category_id}
                  onChange={(e) => setServiceForm({...serviceForm, category_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Category (Optional)</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={serviceForm.estimated_duration_minutes}
                  onChange={(e) => setServiceForm({...serviceForm, estimated_duration_minutes: parseInt(e.target.value) || 45})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="15"
                  max="240"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the service..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm({...serviceForm, is_active: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="service-active"
                />
                <label htmlFor="service-active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={serviceForm.is_doorstep_eligible}
                  onChange={(e) => setServiceForm({...serviceForm, is_doorstep_eligible: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="doorstep-eligible"
                />
                <label htmlFor="doorstep-eligible" className="text-sm font-medium text-gray-700">Doorstep Eligible</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={serviceForm.requires_diagnostics}
                  onChange={(e) => setServiceForm({...serviceForm, requires_diagnostics: e.target.checked})}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="requires-diagnostics"
                />
                <label htmlFor="requires-diagnostics" className="text-sm font-medium text-gray-700">Requires Diagnostics</label>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors">
                  {editingServiceId ? 'Update Service' : 'Add Service'}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Services List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Services ({services.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doorstep</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.display_name || service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.device_type?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.is_doorstep_eligible ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleServiceActive(service.id, !service.is_active)}
                          className={`${
                            service.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {service.is_active ? 'Deactivate' : 'Activate'}
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
    </AdminLayout>
  );
}
