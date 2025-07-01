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
  device_type?: string;
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
    model: 'all',
    service: 'all',
    tier: 'all'
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
      // Load services for all device types
      const deviceTypes = ['mobile', 'laptop', 'tablet'];
      const allServices = [];
      
      for (const deviceType of deviceTypes) {
        const response = await fetch(`/api/pricing/services?deviceType=${deviceType}`);
        const data = await response.json();
        
        if (data.success && data.services) {
          allServices.push(...data.services);
        }
      }
      
      setServices(allServices);
    } catch (err) {
      setError('Error loading services');
      console.error('Error loading services:', err);
    }
  };

  // Load Dynamic Pricing
  const loadDynamicPricing = async () => {
    try {
              const response = await fetch('/api/management/dynamic-pricing');
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
              const response = await fetch('/api/management/models');
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
      // Load services for all device types
      const deviceTypes = ['mobile', 'laptop', 'tablet'];
      const allServices = [];
      
      for (const deviceType of deviceTypes) {
        const response = await fetch(`/api/pricing/services?deviceType=${deviceType}`);
        const data = await response.json();
        
        if (data.success && data.services) {
          allServices.push(...data.services);
        }
      }
      
      setDeviceServices(allServices);
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
        ? `/api/management/pricing-tiers/${editingTier.id}`
        : '/api/management/pricing-tiers';
      
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
              const response = await fetch(`/api/management/pricing-tiers/${id}`, {
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
        ? `/api/management/services/${editingService.id}`
        : '/api/management/services';
      
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
              const response = await fetch(`/api/management/services/${id}`, {
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
              const response = await fetch('/api/management/bulk-price-update', {
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

  // Filter pricing data based on selected filters
  const getFilteredPricing = () => {
    const filtered = dynamicPricing.filter((pricing) => {
      const deviceTypeMatch = pricingFilters.deviceType === 'all' || 
        (pricing.device_type && pricing.device_type.toLowerCase() === pricingFilters.deviceType.toLowerCase());
      
      const brandMatch = pricingFilters.brand === 'all' || 
        (pricing.brand_name && pricing.brand_name.toLowerCase() === pricingFilters.brand.toLowerCase());
      
      const modelMatch = pricingFilters.model === 'all' || 
        (pricing.model_name && pricing.model_name.toLowerCase().includes(pricingFilters.model.toLowerCase())) ||
        (pricing.device_model && pricing.device_model.toLowerCase().includes(pricingFilters.model.toLowerCase()));
      
      const serviceMatch = pricingFilters.service === 'all' || 
        (pricing.service_name && pricing.service_name.toLowerCase().includes(pricingFilters.service.toLowerCase()));
      
      const tierMatch = pricingFilters.tier === 'all' || 
        (pricing.tier_name && pricing.tier_name.toLowerCase().includes(pricingFilters.tier.toLowerCase()));
      
      return deviceTypeMatch && brandMatch && modelMatch && serviceMatch && tierMatch;
    });
    
    return filtered;
  };
  
  // Get paginated results
  const getPaginatedPricing = () => {
    const filtered = getFilteredPricing();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };
  
  // Get total pages
  const getTotalPages = () => {
    const filteredCount = getFilteredPricing().length;
    return Math.ceil(filteredCount / itemsPerPage);
  };
  
  // Reset pagination when filters change
  const handleFilterChange = (newFilters: any) => {
    setPricingFilters(newFilters);
    setCurrentPage(1);
  };

  // Get unique values for filter dropdowns
  const getUniqueFilterValues = () => {
    // Get brands from both dynamic pricing data AND device models
    const brandSet = new Set<string>();
    dynamicPricing.forEach(p => {
      if (p.brand_name) brandSet.add(p.brand_name);
    });
    deviceModels.forEach(m => {
      if (m.brand?.display_name) brandSet.add(m.brand.display_name);
    });
    
    // Get models from both dynamic pricing data AND device models  
    const modelSet = new Set<string>();
    dynamicPricing.forEach(p => {
      const modelName = p.model_name || p.device_model;
      if (modelName) modelSet.add(modelName);
    });
    deviceModels.forEach(m => {
      if (m.display_name) modelSet.add(m.display_name);
    });
    
    // Get services from both dynamic pricing data AND services list
    const serviceSet = new Set<string>();
    dynamicPricing.forEach(p => {
      if (p.service_name) serviceSet.add(p.service_name);
    });
    services.forEach(s => {
      if (s.display_name) serviceSet.add(s.display_name);
    });
    deviceServices.forEach(s => {
      if (s.display_name) serviceSet.add(s.display_name);
    });
    
    // Get tiers from both dynamic pricing data AND pricing tiers list
    const tierSet = new Set<string>();
    dynamicPricing.forEach(p => {
      if (p.tier_name) tierSet.add(p.tier_name);
    });
    pricingTiers.forEach(t => {
      if (t.display_name) tierSet.add(t.display_name);
    });
    
    const brands = Array.from(brandSet).sort();
    const models = Array.from(modelSet).sort();
    const servicesArray = Array.from(serviceSet).sort();
    const tiers = Array.from(tierSet).sort();
    
    return { brands, models, services: servicesArray, tiers };
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
        ? `/api/management/dynamic-pricing?id=${editingDevicePricing.id}`
        : '/api/management/dynamic-pricing';
      
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
              const response = await fetch(`/api/management/dynamic-pricing?id=${id}`, {
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <select
                    value={pricingFilters.deviceType}
                    onChange={(e) => handleFilterChange({...pricingFilters, deviceType: e.target.value})}
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
                    onChange={(e) => handleFilterChange({...pricingFilters, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Brands</option>
                    {getUniqueFilterValues().brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={pricingFilters.model}
                    onChange={(e) => handleFilterChange({...pricingFilters, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Models</option>
                    {getUniqueFilterValues().models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={pricingFilters.service}
                    onChange={(e) => handleFilterChange({...pricingFilters, service: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Services</option>
                    {getUniqueFilterValues().services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={pricingFilters.tier}
                    onChange={(e) => handleFilterChange({...pricingFilters, tier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Tiers</option>
                    {getUniqueFilterValues().tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="mt-4">
                <button
                  onClick={() => handleFilterChange({
                    deviceType: 'all',
                    brand: 'all',
                    model: 'all',
                    service: 'all',
                    tier: 'all'
                  })}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Dynamic Pricing List */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Dynamic Pricing ({getFilteredPricing().length} of {dynamicPricing.length} records)
                </h2>
                {getFilteredPricing().length > itemsPerPage && (
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {getTotalPages()} (showing {Math.min(itemsPerPage, getFilteredPricing().length - (currentPage - 1) * itemsPerPage)} entries)
                  </div>
                )}
              </div>
              
              {getFilteredPricing().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {dynamicPricing.length === 0 ? (
                    <>
                      <p>No pricing records found.</p>
                      <p className="text-sm mt-2">Use the Device-Specific Pricing tab to add pricing entries.</p>
                    </>
                  ) : (
                    <>
                      <p>No pricing records match the current filters.</p>
                      <p className="text-sm mt-2">Try adjusting your filters or click "Clear All Filters".</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedPricing().map((pricing) => (
                        <tr key={pricing.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pricing.service_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pricing.device_type === 'mobile' ? 'bg-blue-100 text-blue-800' :
                              pricing.device_type === 'laptop' ? 'bg-green-100 text-green-800' :
                              pricing.device_type === 'tablet' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pricing.device_type ? pricing.device_type.charAt(0).toUpperCase() + pricing.device_type.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{pricing.brand_name} {pricing.model_name || pricing.device_model}</div>
                              <div className="text-xs text-gray-400">{pricing.brand_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pricing.tier_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
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
              
              {/* Pagination Controls */}
              {getFilteredPricing().length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(7, getTotalPages()) }, (_, i) => {
                      let pageNum;
                      if (getTotalPages() <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= getTotalPages() - 3) {
                        pageNum = getTotalPages() - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            pageNum === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      className={`px-3 py-1 rounded ${
                        currentPage === getTotalPages() 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(getTotalPages())}
                      disabled={currentPage === getTotalPages()}
                      className={`px-3 py-1 rounded ${
                        currentPage === getTotalPages() 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Last
                    </button>
                  </div>
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

            {/* Pricing Filters for Device-Specific Pricing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Filter Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                  <select
                    value={pricingFilters.deviceType}
                    onChange={(e) => handleFilterChange({...pricingFilters, deviceType: e.target.value})}
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
                    onChange={(e) => handleFilterChange({...pricingFilters, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Brands</option>
                    {getUniqueFilterValues().brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={pricingFilters.model}
                    onChange={(e) => handleFilterChange({...pricingFilters, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Models</option>
                    {getUniqueFilterValues().models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={pricingFilters.service}
                    onChange={(e) => handleFilterChange({...pricingFilters, service: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Services</option>
                    {getUniqueFilterValues().services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={pricingFilters.tier}
                    onChange={(e) => handleFilterChange({...pricingFilters, tier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Tiers</option>
                    {getUniqueFilterValues().tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="mt-4">
                <button
                  onClick={() => handleFilterChange({
                    deviceType: 'all',
                    brand: 'all',
                    model: 'all',
                    service: 'all',
                    tier: 'all'
                  })}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Device-Specific Pricing List */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Device-Specific Pricing ({getFilteredPricing().length} of {dynamicPricing.length} entries)
                </h2>
                {getFilteredPricing().length > itemsPerPage && (
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {getTotalPages()} (showing {Math.min(itemsPerPage, getFilteredPricing().length - (currentPage - 1) * itemsPerPage)} entries)
                  </div>
                )}
              </div>
              
              {getFilteredPricing().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {dynamicPricing.length === 0 ? (
                    <>
                      <p>No device-specific pricing set yet.</p>
                      <p className="text-sm mt-2">Use the form above to set specific prices for device models like iPhone 16.</p>
                    </>
                  ) : (
                    <>
                      <p>No pricing records match the current filters.</p>
                      <p className="text-sm mt-2">Try adjusting your filters or click "Clear All Filters".</p>
                    </>
                  )}
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
                      {getPaginatedPricing().map((pricing) => (
                                                 <tr key={pricing.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                             <div>
                               <div className="font-medium">{pricing.brand_name} {pricing.model_name || pricing.device_model}</div>
                               <div className="text-xs text-gray-400">{pricing.brand_name}</div>
                             </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {pricing.service_name}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {pricing.tier_name}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                             ${pricing.base_price}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {pricing.discounted_price ? (
                               <span className="text-orange-600 font-medium">${pricing.discounted_price}</span>
                             ) : '-'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {pricing.cost_price ? (
                               <span className="text-gray-700">${pricing.cost_price}</span>
                             ) : '-'}
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
              
              {/* Pagination Controls */}
              {getFilteredPricing().length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                      disabled={currentPage === getTotalPages()}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, getFilteredPricing().length)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{getFilteredPricing().length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          ←
                        </button>
                        
                        {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === getTotalPages() || 
                            Math.abs(page - currentPage) <= 2
                          )
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];
                            const showGap = prevPage && page - prevPage > 1;
                            
                            return (
                              <React.Fragment key={page}>
                                {showGap && (
                                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    currentPage === page
                                      ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                          disabled={currentPage === getTotalPages()}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          →
                        </button>
                      </nav>
                    </div>
                  </div>
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