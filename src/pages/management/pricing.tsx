import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import { authFetch } from '@/utils/auth';
import { isValidUUID } from '@/types/admin';
import { toast } from 'sonner';

interface DynamicPricing {
  id: string;
  service_id: string;
  model_id: string;
  base_price: number;
  compare_at_price?: number;
  pricing_tier: 'standard' | 'premium';
  part_quality?: string;
  part_warranty_months: number;
  includes_installation: boolean;
  is_active: boolean;
  created_at?: string;
  service_name?: string;
  model_name?: string;
  brand_name?: string;
  device_type?: string;
  wholesale_cost?: number | null;
  wholesale_part_name?: string | null;
}

export default function PricingAdmin() {
  const [loading, setLoading] = useState(false);

  // Data State
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [deviceModels, setDeviceModels] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [dynamicPricing, setDynamicPricing] = useState<DynamicPricing[]>([]);

  // Filter State
  const [filters, setFilters] = useState({
    deviceType: 'all',
    brand: 'all',
    model: 'all',
    service: 'all',
    tier: 'all',
    status: 'all' // New: filter by active status
  });
  const [deviceSearch, setDeviceSearch] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Form State
  const [formData, setFormData] = useState({
    device_type_id: '',
    brand_id: '',
    model_id: '',
    service_id: '',
    pricing_tier: 'standard' as 'standard' | 'premium',
    base_price: '',
    compare_at_price: '',
    part_quality: '',
    part_warranty_months: '3',
    includes_installation: true,
    is_active: true
  });

  // Bulk edit state
  const [editingRows, setEditingRows] = useState<{[key: string]: {base_price: string}}>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk selection state (NEW)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{ action: () => void; title: string; message: string; variant?: 'danger' | 'warning' } | null>(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDeviceTypes(),
        loadBrands(),
        loadDeviceModels(),
        loadServices(),
        loadDynamicPricing()
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const loadDeviceTypes = async () => {
    try {
      const response = await authFetch('/api/management/device-types');
      const data = await response.json();
      if (data.success && data.device_types) {
        setDeviceTypes(data.device_types);
      } else {
        // Fallback to default device types
        setDeviceTypes([
          { id: 'mobile', name: 'Mobile' },
          { id: 'laptop', name: 'Laptop' },
          { id: 'tablet', name: 'Tablet' }
        ]);
      }
    } catch (err) {
      console.error('Error loading device types:', err);
      // Fallback to default device types on error
      setDeviceTypes([
        { id: 'mobile', name: 'Mobile' },
        { id: 'laptop', name: 'Laptop' },
        { id: 'tablet', name: 'Tablet' }
      ]);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await authFetch('/api/management/brands');
      const data = await response.json();
      if (data.success && data.brands) {
        setBrands(data.brands);
      }
    } catch (err) {
      console.error('Error loading brands:', err);
    }
  };

  const loadDeviceModels = async () => {
    try {
      const response = await authFetch('/api/management/models');
      const data = await response.json();
      if (data.success && data.models) {
        setDeviceModels(data.models);
      }
    } catch (err) {
      console.error('Error loading device models:', err);
    }
  };

  const loadServices = async () => {
    try {
      const response = await authFetch('/api/management/services');
      const data = await response.json();
      if (data.success && data.services) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const loadDynamicPricing = async () => {
    try {
      const response = await authFetch('/api/management/dynamic-pricing');
      const data = await response.json();
      if (data.success) {
        setDynamicPricing(data.pricing || []);
      }
    } catch (err) {
      console.error('Error loading dynamic pricing:', err);
    }
  };

  // Cascading dropdown logic
  const filteredBrands = useMemo(() => {
    if (!formData.device_type_id) return [];
    return brands.filter(b => {
      const deviceType = deviceTypes.find(dt => dt.id === formData.device_type_id);
      return b.device_type_id === formData.device_type_id;
    });
  }, [formData.device_type_id, brands, deviceTypes]);

  const filteredModels = useMemo(() => {
    if (!formData.brand_id) return [];
    return deviceModels.filter(m => m.brand_id === formData.brand_id);
  }, [formData.brand_id, deviceModels]);

  const filteredServices = useMemo(() => {
    if (!formData.device_type_id) return [];
    return services.filter(s => {
      const deviceType = deviceTypes.find(dt => dt.id === formData.device_type_id);
      return s.device_type?.toLowerCase() === deviceType?.name?.toLowerCase();
    });
  }, [formData.device_type_id, services, deviceTypes]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        service_id: formData.service_id,
        model_id: formData.model_id,
        pricing_tier: formData.pricing_tier,
        base_price: parseFloat(formData.base_price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        part_quality: formData.part_quality || null,
        part_warranty_months: parseInt(formData.part_warranty_months),
        includes_installation: formData.includes_installation,
        is_active: formData.is_active
      };

      const url = editingId
        ? `/api/management/dynamic-pricing?id=${editingId}`
        : '/api/management/dynamic-pricing';

      const response = await authFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Pricing updated successfully' : 'Pricing created successfully');
        loadDynamicPricing();
        resetForm();
      } else {
        toast.error(data.message || 'Failed to save pricing');
      }
    } catch (err) {
      toast.error('Error saving pricing');
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      device_type_id: '',
      brand_id: '',
      model_id: '',
      service_id: '',
      pricing_tier: 'standard',
      base_price: '',
      compare_at_price: '',
      part_quality: '',
      part_warranty_months: '3',
      includes_installation: true,
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (pricing: DynamicPricing) => {
    setEditingId(pricing.id);
    // Find the model and set device type and brand
    const model = deviceModels.find(m => m.id === pricing.model_id);
    if (model) {
      setFormData({
        device_type_id: model.type_id || '',
        brand_id: model.brand_id || '',
        model_id: pricing.model_id,
        service_id: pricing.service_id,
        pricing_tier: pricing.pricing_tier,
        base_price: pricing.base_price?.toString() || '',
        compare_at_price: pricing.compare_at_price?.toString() || '',
        part_quality: pricing.part_quality || '',
        part_warranty_months: pricing.part_warranty_months?.toString() || '3',
        includes_installation: pricing.includes_installation,
        is_active: pricing.is_active
      });
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmAction({
      action: async () => {
        try {
          const response = await authFetch(`/api/management/dynamic-pricing?id=${id}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (data.success) {
            toast.success('Pricing deleted successfully');
            loadDynamicPricing();
            setEditingRows(prev => {
              const updated = {...prev};
              delete updated[id];
              return updated;
            });
          } else {
            toast.error(data.message || 'Failed to delete pricing');
          }
        } catch (err) {
          toast.error('Error deleting pricing');
          console.error('Error:', err);
        }
        setConfirmAction(null);
      },
      title: 'Delete Pricing',
      message: 'Are you sure you want to delete this pricing entry? This action cannot be undone.',
      variant: 'danger'
    });
  };

  const handleRowEditStart = (id: string, currentPrice: number) => {
    setEditingRows(prev => ({
      ...prev,
      [id]: { base_price: currentPrice.toString() }
    }));
  };

  const handleRowEditCancel = (id: string) => {
    setEditingRows(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
  };

  const handleRowEditSave = async (id: string) => {
    const editData = editingRows[id];
    if (!editData) return;

    try {
      const response = await authFetch(`/api/management/dynamic-pricing?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_price: parseFloat(editData.base_price)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Price updated successfully');
        loadDynamicPricing();
        setEditingRows(prev => {
          const updated = {...prev};
          delete updated[id];
          return updated;
        });
      } else {
        toast.error(data.message || 'Failed to update price');
      }
    } catch (err) {
      toast.error('Error updating price');
      console.error('Error:', err);
    }
  };

  const handleBulkUpdate = async (percentage: number) => {
    setConfirmAction({
      action: async () => {
        try {
          const response = await authFetch('/api/management/bulk-pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ percentage })
          });

          const data = await response.json();

          if (data.success) {
            toast.success(`Updated ${data.updated} pricing records`);
            loadDynamicPricing();
          } else {
            toast.error(data.message || 'Failed to update prices');
          }
        } catch (err) {
          toast.error('Error updating prices');
          console.error('Error:', err);
        }
        setConfirmAction(null);
      },
      title: 'Bulk Price Update',
      message: `Are you sure you want to ${percentage > 0 ? 'increase' : 'decrease'} all prices by ${Math.abs(percentage)}%?`,
      variant: 'warning'
    });
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string, newStatus: boolean) => {
    setConfirmAction({
      action: async () => {
        try {
          const response = await authFetch(`/api/management/dynamic-pricing`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: newStatus })
          });

          const data = await response.json();
          if (data.success) {
            toast.success(`Pricing ${newStatus ? 'activated' : 'deactivated'} successfully`);
            loadDynamicPricing();
          } else {
            toast.error(data.message || 'Failed to update status');
          }
        } catch (err) {
          toast.error('Error updating status');
          console.error('Error:', err);
        }
        setConfirmAction(null);
      },
      title: `${newStatus ? 'Activate' : 'Deactivate'} Pricing`,
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this pricing?`,
      variant: 'warning'
    });
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (ids: string[], newStatus: boolean) => {
    setConfirmAction({
      action: async () => {
        setBulkUpdating(true);
        try {
          const response = await authFetch('/api/management/bulk-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, is_active: newStatus })
          });

          const data = await response.json();
          if (data.success) {
            toast.success(`${data.updated} pricing record(s) ${newStatus ? 'activated' : 'deactivated'} successfully`);
            loadDynamicPricing();
            setSelectedIds([]);
          } else {
            toast.error(data.message || 'Failed to update status');
          }
        } catch (err) {
          toast.error('Error updating status');
          console.error('Error:', err);
        } finally {
          setBulkUpdating(false);
        }
        setConfirmAction(null);
      },
      title: `${newStatus ? 'Activate' : 'Deactivate'} Multiple Pricing Records`,
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${ids.length} pricing record(s)?`,
      variant: 'warning'
    });
  };

  // Filter pricing data
  const getFilteredPricing = () => {
    return dynamicPricing.filter((pricing) => {
      const dtMatch = filters.deviceType === 'all' || pricing.device_type?.toLowerCase() === filters.deviceType.toLowerCase();
      const bMatch = filters.brand === 'all' || pricing.brand_name?.toLowerCase() === filters.brand.toLowerCase();
      const mMatch = filters.model === 'all' || pricing.model_name?.toLowerCase().includes(filters.model.toLowerCase());
      const sMatch = filters.service === 'all' || pricing.service_name?.toLowerCase().includes(filters.service.toLowerCase());
      const tMatch = filters.tier === 'all' || pricing.pricing_tier === filters.tier;

      // Status filter
      const statusMatch = filters.status === 'all' ||
                         (filters.status === 'active' && pricing.is_active) ||
                         (filters.status === 'inactive' && !pricing.is_active);

      // Device search: matches both brand and model name
      const searchLower = deviceSearch.toLowerCase();
      const dSearch = deviceSearch === '' ||
        (pricing.brand_name?.toLowerCase().includes(searchLower) ||
         pricing.model_name?.toLowerCase().includes(searchLower));

      return dtMatch && bMatch && mMatch && sMatch && tMatch && statusMatch && dSearch;
    });
  };

  const filteredPricing = getFilteredPricing();
  const paginatedPricing = filteredPricing.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredPricing.length / itemsPerPage);

  return (
    <AdminLayout title="Pricing Management">
      <AdminPageHeader
        title="Pricing Management"
        description="Manage pricing for device repairs across all service tiers"
      />

      {/* Set Pricing Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          {editingId ? 'Edit Pricing' : 'Set New Pricing'}
        </h2>
        <p className="text-gray-600 mb-6">
          Select device type, brand, model, service, and tier to set pricing. Example: iPhone 16 Screen Replacement (Standard) = $225
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Device Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Device Type *</label>
            <select
              value={formData.device_type_id}
              onChange={(e) => {
                setFormData({...formData, device_type_id: e.target.value, brand_id: '', model_id: '', service_id: ''});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Device Type</option>
              {deviceTypes.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
            <select
              value={formData.brand_id}
              onChange={(e) => {
                setFormData({...formData, brand_id: e.target.value, model_id: ''});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Brand</option>
              {/* In edit mode, show all brands. When creating, show filtered brands */}
              {editingId ? brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              )) : filteredBrands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
            <select
              value={formData.model_id}
              onChange={(e) => setFormData({...formData, model_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Model</option>
              {/* In edit mode, show all models. When creating, show filtered models */}
              {editingId ? deviceModels.map(m => (
                <option key={m.id} value={m.id}>{m.brand_id ? brands.find(b => b.id === m.brand_id)?.name + ' ' : ''}{m.name}</option>
              )) : filteredModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({...formData, service_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Service</option>
              {/* In edit mode, show all services. When creating, show filtered services */}
              {editingId ? services.map(s => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              )) : filteredServices.map(s => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>
          </div>

          {/* Pricing Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier *</label>
            <select
              value={formData.pricing_tier}
              onChange={(e) => setFormData({...formData, pricing_tier: e.target.value as 'standard' | 'premium'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (CAD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="225.00"
              required
            />
          </div>

          {/* Compare-at Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare-at Price (Optional)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.compare_at_price}
              onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="250.00"
            />
          </div>

          {/* Part Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Part Quality (Optional)</label>
            <input
              type="text"
              value={formData.part_quality}
              onChange={(e) => setFormData({...formData, part_quality: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., OEM, Aftermarket"
            />
          </div>

          {/* Warranty Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warranty (Months)</label>
            <input
              type="number"
              min="1"
              value={formData.part_warranty_months}
              onChange={(e) => setFormData({...formData, part_warranty_months: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Includes Installation */}
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              checked={formData.includes_installation}
              onChange={(e) => setFormData({...formData, includes_installation: e.target.checked})}
              className="h-4 w-4 text-primary-600"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Includes Installation</label>
          </div>

          {/* Active */}
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="h-4 w-4 text-primary-600"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Active</label>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-3 flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium"
            >
              {editingId ? 'Update' : 'Create'} Pricing
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Bulk Price Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleBulkUpdate(5)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Increase 5%</button>
          <button onClick={() => handleBulkUpdate(10)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Increase 10%</button>
          <button onClick={() => handleBulkUpdate(-5)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Decrease 5%</button>
          <button onClick={() => handleBulkUpdate(-10)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Decrease 10%</button>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">All Pricing ({filteredPricing.length} of {dynamicPricing.length})</h3>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Row */}
          <input
            type="text"
            placeholder="Search devices (e.g., 'iPhone 16', 'MacBook Pro')..."
            value={deviceSearch}
            onChange={(e) => {setDeviceSearch(e.target.value); setCurrentPage(1);}}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select value={filters.deviceType} onChange={(e) => {setFilters({...filters, deviceType: e.target.value}); setCurrentPage(1);}} className="px-3 py-2 border border-gray-300 rounded">
              <option value="all">All Device Types</option>
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
            </select>
            <select value={filters.brand} onChange={(e) => {setFilters({...filters, brand: e.target.value}); setCurrentPage(1);}} className="px-3 py-2 border border-gray-300 rounded">
              <option value="all">All Brands</option>
              {Array.from(new Set(dynamicPricing.map(p => p.brand_name).filter(b => b))).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select value={filters.tier} onChange={(e) => {setFilters({...filters, tier: e.target.value}); setCurrentPage(1);}} className="px-3 py-2 border border-gray-300 rounded">
              <option value="all">All Tiers</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select value={filters.status} onChange={(e) => {setFilters({...filters, status: e.target.value}); setCurrentPage(1);}} className="px-3 py-2 border border-gray-300 rounded">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <button
              onClick={() => {
                setFilters({deviceType: 'all', brand: 'all', model: 'all', service: 'all', tier: 'all', status: 'all'});
                setDeviceSearch('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {filteredPricing.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No pricing records found</p>
        ) : (
          <>
            {/* Bulk Actions Section */}
            {selectedIds.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded flex items-center gap-3">
                <span className="font-medium text-blue-900">{selectedIds.length} pricing record(s) selected</span>
                <button
                  onClick={() => handleBulkStatusUpdate(selectedIds, true)}
                  disabled={bulkUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(selectedIds, false)}
                  disabled={bulkUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  disabled={bulkUpdating}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredPricing.length && filteredPricing.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredPricing.map(p => p.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="h-4 w-4 text-primary-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Device</th>
                    <th className="px-4 py-3 text-left font-medium">Service</th>
                    <th className="px-4 py-3 text-left font-medium">Tier</th>
                    <th className="px-4 py-3 text-right font-medium">Wholesale</th>
                    <th className="px-4 py-3 text-right font-medium">Base Price</th>
                    <th className="px-4 py-3 text-right font-medium">Margin</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPricing.map((pricing) => {
                    const isEditing = !!editingRows[pricing.id];
                    return (
                      <tr key={pricing.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(pricing.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, pricing.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== pricing.id));
                              }
                            }}
                            className="h-4 w-4 text-primary-600"
                          />
                        </td>
                        <td className="px-4 py-3">{pricing.brand_name} {pricing.model_name}</td>
                        <td className="px-4 py-3">{pricing.service_name}</td>
                        <td className="px-4 py-3 capitalize">{pricing.pricing_tier}</td>
                        <td className="px-4 py-3 text-right">
                          {pricing.wholesale_cost != null ? (
                            <span
                              className="text-gray-600 cursor-help"
                              title={pricing.wholesale_part_name || ''}
                            >
                              ${pricing.wholesale_cost.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingRows[pricing.id].base_price}
                              onChange={(e) => setEditingRows(prev => ({
                                ...prev,
                                [pricing.id]: { base_price: e.target.value }
                              }))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          ) : (
                            `$${pricing.base_price.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pricing.wholesale_cost != null ? (() => {
                            const margin = pricing.base_price - pricing.wholesale_cost;
                            const marginPct = pricing.wholesale_cost > 0
                              ? ((margin / pricing.wholesale_cost) * 100).toFixed(0)
                              : '—';
                            return (
                              <span className={`font-medium ${margin < 0 ? 'text-red-600' : margin < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                                ${margin.toFixed(0)} ({marginPct}%)
                              </span>
                            );
                          })() : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${pricing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {pricing.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap space-x-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleRowEditSave(pricing.id)} className="text-green-600 hover:underline mr-2 font-medium text-xs">Save</button>
                              <button onClick={() => handleRowEditCancel(pricing.id)} className="text-gray-600 hover:underline mr-2 text-xs">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleRowEditStart(pricing.id, pricing.base_price)} className="text-blue-600 hover:underline mr-1 text-xs">Edit</button>
                              <button
                                onClick={() => handleToggleActive(pricing.id, !pricing.is_active)}
                                className={`px-2 py-1 rounded text-xs font-medium ${pricing.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                              >
                                {pricing.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => handleDelete(pricing.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <AdminConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction?.action()}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        variant={confirmAction?.variant || 'danger'}
      />
    </AdminLayout>
  );
}
