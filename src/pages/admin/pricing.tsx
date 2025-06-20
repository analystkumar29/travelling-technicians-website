import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

interface PricingTier {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  price_multiplier: number;
  estimated_delivery_hours?: number;
  includes_features: string[];
  is_active: boolean;
  sort_order: number;
}

interface Service {
  id: number;
  name: string;
  display_name: string;
  device_type: string;
  category?: string;
  estimated_duration_minutes?: number;
  warranty_period_days: number;
  is_doorstep_eligible: boolean;
  is_active: boolean;
}

interface DynamicPricing {
  id: number;
  service_id?: number;
  model_id?: number;
  pricing_tier_id?: number;
  service_name?: string;
  device_model?: string;
  model_name?: string;
  brand_name?: string;
  tier_name?: string;
  base_price: number;
  discounted_price?: number;
  cost_price?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

type TabType = 'tiers' | 'services' | 'pricing' | 'device-pricing';

export default function PricingAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('tiers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pricing Tiers State
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [tierForm, setTierForm] = useState({
    name: '',
    display_name: '',
    description: '',
    price_multiplier: 1.0,
    estimated_delivery_hours: 24,
    includes_features: '',
    is_active: true,
    sort_order: 0
  });
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  
  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    display_name: '',
    device_type: 'mobile',
    estimated_duration_minutes: 60,
    warranty_period_days: 365,
    is_doorstep_eligible: true,
    is_active: true
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Dynamic Pricing State
  const [dynamicPricing, setDynamicPricing] = useState<DynamicPricing[]>([]);
  const [pricingFilters, setPricingFilters] = useState({
    deviceType: 'all',
    brand: 'all',
    service: 'all',
    tier: 'all'
  });

  // Device-Specific Pricing State
  const [devicePricingForm, setDevicePricingForm] = useState({
    service_id: '',
    model_id: '',
    pricing_tier_id: '',
    base_price: '',
    discounted_price: '',
    cost_price: '',
    is_active: true
  });
  const [editingDevicePricing, setEditingDevicePricing] = useState<DynamicPricing | null>(null);
  const [deviceModels, setDeviceModels] = useState<any[]>([]);
  const [deviceServices, setDeviceServices] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadPricingTiers();
    loadServices();
    loadDynamicPricing();
    loadDeviceModels();
    loadDeviceServices();
  }, []);

  // Load Pricing Tiers
  const loadPricingTiers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/tiers');
      const data = await response.json();
      
      if (data.success) {
        setPricingTiers(data.tiers || []);
      } else {
        setError('Failed to load pricing tiers');
      }
    } catch (err) {
      setError('Error loading pricing tiers');
      console.error('Error loading pricing tiers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Services
  const loadServices = async () => {
    try {
      const response = await fetch('/api/pricing/services');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services || []);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      setError('Error loading services');
      console.error('Error loading services:', err);
    }
  };

  // Load Dynamic Pricing
  const loadDynamicPricing = async () => {
    try {
      const response = await fetch('/api/admin/dynamic-pricing');
      const data = await response.json();
      
      if (data.success) {
        setDynamicPricing(data.pricing || []);
      } else {
        setError('Failed to load dynamic pricing');
      }
    } catch (err) {
      setError('Error loading dynamic pricing');
      console.error('Error loading dynamic pricing:', err);
    }
  };

  // Load Device Models
  const loadDeviceModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      const data = await response.json();
      
      if (data.success) {
        setDeviceModels(data.models || []);
      }
    } catch (err) {
      console.error('Error loading device models:', err);
    }
  };

  // Load Device Services  
  const loadDeviceServices = async () => {
    try {
      const response = await fetch('/api/pricing/services?deviceType=all');
      const data = await response.json();
      
      if (data.success) {
        setDeviceServices(data.services || []);
      }
    } catch (err) {
      console.error('Error loading device services:', err);
    }
  };

  // Pricing Tier Functions
  const handleTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tierData = {
        ...tierForm,
        includes_features: tierForm.includes_features ? tierForm.includes_features.split(',').map(f => f.trim()) : []
      };

      const url = editingTier 
        ? `/api/admin/pricing-tiers/${editingTier.id}`
        : '/api/admin/pricing-tiers';
      
      const response = await fetch(url, {
        method: editingTier ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tierData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadPricingTiers();
        setTierForm({
          name: '',
          display_name: '',
          description: '',
          price_multiplier: 1.0,
          estimated_delivery_hours: 24,
          includes_features: '',
          is_active: true,
          sort_order: 0
        });
        setEditingTier(null);
      } else {
        setError(data.message || 'Failed to save pricing tier');
      }
    } catch (err) {
      setError('Error saving pricing tier');
      console.error('Error saving pricing tier:', err);
    }
  };

  const handleEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      display_name: tier.display_name,
      description: tier.description || '',
      price_multiplier: tier.price_multiplier,
      estimated_delivery_hours: tier.estimated_delivery_hours || 24,
      includes_features: tier.includes_features.join(', '),
      is_active: tier.is_active,
      sort_order: tier.sort_order
    });
  };

  const handleDeleteTier = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    
    try {
      const response = await fetch(`/api/admin/pricing-tiers/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadPricingTiers();
      } else {
        setError(data.message || 'Failed to delete pricing tier');
      }
    } catch (err) {
      setError('Error deleting pricing tier');
      console.error('Error deleting pricing tier:', err);
    }
  };

  // Service Functions
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';
      
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadServices();
        setServiceForm({
          name: '',
          display_name: '',
          device_type: 'mobile',
          estimated_duration_minutes: 60,
          warranty_period_days: 365,
          is_doorstep_eligible: true,
          is_active: true
        });
        setEditingService(null);
      } else {
        setError(data.message || 'Failed to save service');
      }
    } catch (err) {
      setError('Error saving service');
      console.error('Error saving service:', err);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      display_name: service.display_name,
      device_type: service.device_type,
      estimated_duration_minutes: service.estimated_duration_minutes || 60,
      warranty_period_days: service.warranty_period_days,
      is_doorstep_eligible: service.is_doorstep_eligible,
      is_active: service.is_active
    });
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadServices();
      } else {
        setError(data.message || 'Failed to delete service');
      }
    } catch (err) {
      setError('Error deleting service');
      console.error('Error deleting service:', err);
    }
  };

  // Bulk update pricing
  const handleBulkPriceUpdate = async (percentage: number) => {
    if (!confirm(`Are you sure you want to ${percentage > 0 ? 'increase' : 'decrease'} all prices by ${Math.abs(percentage)}%?`)) return;
    
    try {
      const response = await fetch('/api/admin/bulk-price-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage })
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadDynamicPricing();
        alert(`Successfully updated ${data.updated} pricing records`);
      } else {
        setError(data.message || 'Failed to update prices');
      }
    } catch (err) {
      setError('Error updating prices');
      console.error('Error updating prices:', err);
    }
  };

  // Device-Specific Pricing Functions
  const handleDevicePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pricingData = {
        service_id: parseInt(devicePricingForm.service_id),
        model_id: parseInt(devicePricingForm.model_id),
        pricing_tier_id: parseInt(devicePricingForm.pricing_tier_id),
        base_price: parseFloat(devicePricingForm.base_price),
        discounted_price: devicePricingForm.discounted_price ? parseFloat(devicePricingForm.discounted_price) : null,
        cost_price: devicePricingForm.cost_price ? parseFloat(devicePricingForm.cost_price) : null,
        is_active: devicePricingForm.is_active
      };

      const url = editingDevicePricing 
        ? `/api/admin/dynamic-pricing?id=${editingDevicePricing.id}`
        : '/api/admin/dynamic-pricing';
      
      const response = await fetch(url, {
        method: editingDevicePricing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadDynamicPricing();
        setDevicePricingForm({
          service_id: '',
          model_id: '',
          pricing_tier_id: '',
          base_price: '',
          discounted_price: '',
          cost_price: '',
          is_active: true
        });
        setEditingDevicePricing(null);
      } else {
        setError(data.message || 'Failed to save device pricing');
      }
    } catch (err) {
      setError('Error saving device pricing');
      console.error('Error saving device pricing:', err);
    }
  };

  const handleEditDevicePricing = (pricing: DynamicPricing) => {
    setEditingDevicePricing(pricing);
    setDevicePricingForm({
      service_id: pricing.service_id?.toString() || '',
      model_id: pricing.model_id?.toString() || '',
      pricing_tier_id: pricing.pricing_tier_id?.toString() || '',
      base_price: pricing.base_price?.toString() || '',
      discounted_price: pricing.discounted_price?.toString() || '',
      cost_price: pricing.cost_price?.toString() || '',
      is_active: pricing.is_active
    });
  };

  const handleDeleteDevicePricing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pricing entry?')) return;

    try {
      const response = await fetch(`/api/admin/dynamic-pricing?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadDynamicPricing();
      } else {
        setError(data.message || 'Failed to delete pricing entry');
      }
    } catch (err) {
      setError('Error deleting pricing entry');
      console.error('Error deleting pricing entry:', err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <button
            onClick={() => router.push('/admin')}
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
              { key: 'tiers', label: 'Pricing Tiers', count: pricingTiers.length },
              { key: 'services', label: 'Services', count: services.length },
              { key: 'pricing', label: 'Dynamic Pricing', count: dynamicPricing.length },
              { key: 'device-pricing', label: 'Device-Specific Pricing', count: dynamicPricing.length }
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

        {/* Pricing Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingTier ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}
              </h2>
              <form onSubmit={handleTierSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({...tierForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., premium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={tierForm.display_name}
                    onChange={(e) => setTierForm({...tierForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Premium Service"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={tierForm.description}
                    onChange={(e) => setTierForm({...tierForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="Describe this pricing tier..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Multiplier</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tierForm.price_multiplier}
                    onChange={(e) => setTierForm({...tierForm, price_multiplier: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="1.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery (hours)</label>
                  <input
                    type="number"
                    value={tierForm.estimated_delivery_hours}
                    onChange={(e) => setTierForm({...tierForm, estimated_delivery_hours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={tierForm.sort_order}
                    onChange={(e) => setTierForm({...tierForm, sort_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Included Features (comma-separated)</label>
                  <textarea
                    value={tierForm.includes_features}
                    onChange={(e) => setTierForm({...tierForm, includes_features: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="e.g., 1-Year Warranty, Premium Parts, Priority Service"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tierForm.is_active}
                    onChange={(e) => setTierForm({...tierForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingTier ? 'Update' : 'Add'} Pricing Tier
                  </button>
                  {editingTier && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTier(null);
                        setTierForm({
                          name: '',
                          display_name: '',
                          description: '',
                          price_multiplier: 1.0,
                          estimated_delivery_hours: 24,
                          includes_features: '',
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

            {/* Pricing Tiers List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing Tiers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pricingTiers.map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tier.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tier.price_multiplier}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tier.estimated_delivery_hours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditTier(tier)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTier(tier.id)}
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

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., screen_replacement"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={serviceForm.display_name}
                    onChange={(e) => setServiceForm({...serviceForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g., Screen Replacement"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <select
                    value={serviceForm.device_type}
                    onChange={(e) => setServiceForm({...serviceForm, device_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="mobile">Mobile</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={serviceForm.estimated_duration_minutes}
                    onChange={(e) => setServiceForm({...serviceForm, estimated_duration_minutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty (days)</label>
                  <input
                    type="number"
                    value={serviceForm.warranty_period_days}
                    onChange={(e) => setServiceForm({...serviceForm, warranty_period_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceForm.is_doorstep_eligible}
                      onChange={(e) => setServiceForm({...serviceForm, is_doorstep_eligible: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Doorstep Eligible</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceForm.is_active}
                      onChange={(e) => setServiceForm({...serviceForm, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingService ? 'Update' : 'Add'} Service
                  </button>
                  {editingService && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null);
                        setServiceForm({
                          name: '',
                          display_name: '',
                          device_type: 'mobile',
                          estimated_duration_minutes: 60,
                          warranty_period_days: 365,
                          is_doorstep_eligible: true,
                          is_active: true
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

            {/* Services List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doorstep</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.device_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.estimated_duration_minutes}min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.is_doorstep_eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.is_doorstep_eligible ? 'Yes' : 'No'}
                          </span>
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
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
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

        {/* Dynamic Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Bulk Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Bulk Price Actions</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkPriceUpdate(5)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Increase All Prices 5%
                </button>
                <button
                  onClick={() => handleBulkPriceUpdate(10)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Increase All Prices 10%
                </button>
                <button
                  onClick={() => handleBulkPriceUpdate(-5)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Decrease All Prices 5%
                </button>
                <button
                  onClick={() => handleBulkPriceUpdate(-10)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Decrease All Prices 10%
                </button>
              </div>
            </div>

            {/* Pricing Filters */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Filter Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <select
                    value={pricingFilters.deviceType}
                    onChange={(e) => setPricingFilters({...pricingFilters, deviceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Device Types</option>
                    <option value="mobile">Mobile</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={pricingFilters.brand}
                    onChange={(e) => setPricingFilters({...pricingFilters, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Brands</option>
                    <option value="apple">Apple</option>
                    <option value="samsung">Samsung</option>
                    <option value="google">Google</option>
                    <option value="dell">Dell</option>
                    <option value="hp">HP</option>
                    <option value="lenovo">Lenovo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={pricingFilters.service}
                    onChange={(e) => setPricingFilters({...pricingFilters, service: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Services</option>
                    <option value="screen_replacement">Screen Replacement</option>
                    <option value="battery_replacement">Battery Replacement</option>
                    <option value="charging_port_repair">Charging Port Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={pricingFilters.tier}
                    onChange={(e) => setPricingFilters({...pricingFilters, tier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Tiers</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="same_day">Same Day</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Pricing List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Dynamic Pricing ({dynamicPricing.length} records)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dynamicPricing.slice(0, 50).map((pricing) => (
                      <tr key={pricing.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pricing.service_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pricing.brand_name} {pricing.device_model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pricing.tier_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${pricing.base_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pricing.discounted_price ? `$${pricing.discounted_price}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pricing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pricing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {/* Handle edit pricing */}}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dynamicPricing.length > 50 && (
                <div className="mt-4 text-center text-gray-500">
                  Showing first 50 of {dynamicPricing.length} pricing records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device-Specific Pricing Tab */}
        {activeTab === 'device-pricing' && (
          <div className="space-y-6">
            {/* Add Device-Specific Pricing Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingDevicePricing ? 'Edit Device Pricing' : 'Set Device-Specific Pricing'}
              </h2>
              <p className="text-gray-600 mb-4">
                Set specific prices for individual device models and services. For example: iPhone 16 screen repair = $225, battery replacement = $100.
              </p>
              
              <form onSubmit={handleDevicePricingSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Model</label>
                  <select
                    value={devicePricingForm.model_id}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, model_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Device Model</option>
                    {deviceModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.brand?.name} {model.name} ({model.brand?.device_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={devicePricingForm.service_id}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, service_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Service</option>
                    {deviceServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.display_name} ({service.device_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Tier</label>
                  <select
                    value={devicePricingForm.pricing_tier_id}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, pricing_tier_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Pricing Tier</option>
                    {pricingTiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.display_name} ({tier.price_multiplier}x)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (CAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={devicePricingForm.base_price}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, base_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="225.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={devicePricingForm.discounted_price}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, discounted_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="200.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={devicePricingForm.cost_price}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, cost_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="150.00"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={devicePricingForm.is_active}
                    onChange={(e) => setDevicePricingForm({...devicePricingForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div className="lg:col-span-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 mr-2"
                  >
                    {editingDevicePricing ? 'Update' : 'Set'} Device Pricing
                  </button>
                  {editingDevicePricing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDevicePricing(null);
                        setDevicePricingForm({
                          service_id: '',
                          model_id: '',
                          pricing_tier_id: '',
                          base_price: '',
                          discounted_price: '',
                          cost_price: '',
                          is_active: true
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

            {/* Device-Specific Pricing List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Device-Specific Pricing ({dynamicPricing.length} entries)</h2>
              
              {dynamicPricing.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No device-specific pricing set yet.</p>
                  <p className="text-sm mt-2">Use the form above to set specific prices for device models like iPhone 16.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dynamicPricing.map((pricing) => (
                        <tr key={pricing.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>
                              <div className="font-medium">{pricing.brand_name} {pricing.device_model}</div>
                              <div className="text-xs text-gray-500">{pricing.brand_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pricing.service_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pricing.tier_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${pricing.base_price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pricing.discounted_price ? `$${pricing.discounted_price}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pricing.cost_price ? `$${pricing.cost_price}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pricing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {pricing.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditDevicePricing(pricing)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDevicePricing(pricing.id)}
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
              )}
            </div>

            {/* Quick Examples */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-1">iPhone 16 Screen Repair:</p>
                  <p>Model: iPhone 16, Service: Screen Replacement, Tier: Standard, Price: $225</p>
                </div>
                <div>
                  <p className="font-medium mb-1">iPhone 16 Battery Replacement:</p>
                  <p>Model: iPhone 16, Service: Battery Replacement, Tier: Standard, Price: $100</p>
                </div>
                <div>
                  <p className="font-medium mb-1">MacBook Pro M3 Screen Repair:</p>
                  <p>Model: MacBook Pro M3, Service: Screen Replacement, Tier: Premium, Price: $450</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Samsung Galaxy S24 Screen:</p>
                  <p>Model: Galaxy S24, Service: Screen Replacement, Tier: Standard, Price: $200</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 