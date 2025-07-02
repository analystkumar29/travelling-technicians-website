import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertTriangle, CheckCircle, Plus, Filter, X, Edit, Save, CheckSquare, Square, Check } from 'lucide-react';

interface PricingCoverage {
  device_type: string;
  brand_name: string;
  model_name: string;
  service_name: string;
  tier_name: string;
  is_missing: boolean;
  existing_price?: number;
  fallback_price?: number;
  // Database IDs for proper updates
  service_id: number;
  model_id: number;
  pricing_tier_id: number;
  existing_id?: number;
}

interface Summary {
  total_combinations: number;
  existing_entries: number;
  missing_entries: number;
  coverage_percentage: number;
}

interface EditingState {
  [key: string]: {
    isEditing: boolean;
    newPrice: number;
  };
}

interface RecentlyUpdated {
  [key: string]: boolean;
}

export default function PricingCoverageAudit() {
  const [coverage, setCoverage] = useState<PricingCoverage[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtering and pagination
  const [filters, setFilters] = useState({
    deviceType: '',
    brand: '',
    service: '',
    tier: '',
    status: '', // 'missing' | 'existing' | ''
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Inline editing
  const [editingStates, setEditingStates] = useState<EditingState>({});
  const [recentlyUpdated, setRecentlyUpdated] = useState<RecentlyUpdated>({});

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-remove recently updated highlighting
  useEffect(() => {
    Object.keys(recentlyUpdated).forEach(key => {
      if (recentlyUpdated[key]) {
        setTimeout(() => {
          setRecentlyUpdated(prev => ({ ...prev, [key]: false }));
        }, 5000);
      }
    });
  }, [recentlyUpdated]);

  const fetchCoverage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/management/pricing-coverage');
      const data = await response.json();
      
      if (data.success) {
        setCoverage(data.coverage);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to fetch coverage data');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverage();
  }, []);

  // Filter the coverage data
  const filteredCoverage = coverage.filter(item => {
    const matchesDeviceType = !filters.deviceType || item.device_type.toLowerCase().includes(filters.deviceType.toLowerCase());
    const matchesBrand = !filters.brand || item.brand_name.toLowerCase().includes(filters.brand.toLowerCase());
    const matchesService = !filters.service || item.service_name.toLowerCase().includes(filters.service.toLowerCase());
    const matchesTier = !filters.tier || item.tier_name.toLowerCase().includes(filters.tier.toLowerCase());
    const matchesStatus = !filters.status || 
      (filters.status === 'missing' && item.is_missing) ||
      (filters.status === 'existing' && !item.is_missing);
    const matchesSearch = !filters.search || 
      item.device_type.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.brand_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.model_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.service_name.toLowerCase().includes(filters.search.toLowerCase());

    return matchesDeviceType && matchesBrand && matchesService && matchesTier && matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCoverage.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCoverage = filteredCoverage.slice(startIndex, startIndex + itemsPerPage);

  // Generate unique key for each row
  const getRowKey = (item: PricingCoverage) => 
    `${item.device_type}-${item.brand_name}-${item.model_name}-${item.service_name}-${item.tier_name}`;

  // Handle adding missing price
  const handleAddPrice = async (item: PricingCoverage) => {
    const requestId = `add-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[${requestId}] Starting price addition`, {
      item,
      itemKeys: Object.keys(item),
      hasServiceId: !!item.service_id,
      hasModelId: !!item.model_id,
      hasPricingTierId: !!item.pricing_tier_id,
      serviceIdValue: item.service_id,
      modelIdValue: item.model_id,
      pricingTierIdValue: item.pricing_tier_id,
      serviceIdType: typeof item.service_id,
      modelIdType: typeof item.model_id,
      pricingTierIdType: typeof item.pricing_tier_id,
      fallbackPrice: item.fallback_price
    });

    try {
      setLoading(true);
      
      const pricingData = {
        service_id: item.service_id,
        model_id: item.model_id,
        pricing_tier_id: item.pricing_tier_id,
        base_price: item.fallback_price || 99,
        discounted_price: null,
        cost_price: null
      };

      console.log(`[${requestId}] Prepared pricing data`, {
        pricingData,
        pricingDataKeys: Object.keys(pricingData),
        requestPayload: { entries: [pricingData] }
      });

      const response = await fetch('/api/management/dynamic-pricing-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [pricingData] })
      });

      console.log(`[${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const result = await response.json();
      console.log(`[${requestId}] Response data`, result);
      
      if (result.success) {
        const rowKey = getRowKey(item);
        console.log(`[${requestId}] Price added successfully`, {
          rowKey,
          resultSummary: result.results,
          successMessage: `Added pricing for ${item.brand_name} ${item.model_name} - ${item.service_name} (${item.tier_name})`
        });
        setSuccess(`✅ Added pricing for ${item.brand_name} ${item.model_name} - ${item.service_name} (${item.tier_name})`);
        setRecentlyUpdated(prev => ({ ...prev, [rowKey]: true }));
        await fetchCoverage(); // Refresh the data
      } else {
        console.error(`[${requestId}] Failed to add price`, {
          result,
          errorMessage: result.error,
          resultErrors: result.results?.errors
        });
        setError(result.error || 'Failed to add pricing');
      }
    } catch (err) {
      console.error(`[${requestId}] Network error occurred`, {
        error: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle inline editing
  const startEditing = (item: PricingCoverage) => {
    const rowKey = getRowKey(item);
    setEditingStates(prev => ({
      ...prev,
      [rowKey]: {
        isEditing: true,
        newPrice: item.existing_price || 0
      }
    }));
  };

  const cancelEditing = (item: PricingCoverage) => {
    const rowKey = getRowKey(item);
    setEditingStates(prev => {
      const newState = { ...prev };
      delete newState[rowKey];
      return newState;
    });
  };

  const savePrice = async (item: PricingCoverage) => {
    const rowKey = getRowKey(item);
    const editState = editingStates[rowKey];
    
    if (!editState || editState.newPrice <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }

    try {
      setLoading(true);
      
      const pricingData = {
        service_id: item.service_id,
        model_id: item.model_id,
        pricing_tier_id: item.pricing_tier_id,
        base_price: editState.newPrice,
        existing_id: item.existing_id
      };

      const response = await fetch('/api/management/dynamic-pricing-bulk', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [pricingData] })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`✅ Updated pricing for ${item.brand_name} ${item.model_name} - ${item.service_name} (${item.tier_name})`);
        setRecentlyUpdated(prev => ({ ...prev, [rowKey]: true }));
        
        // Clear editing state
        setEditingStates(prev => {
          const newState = { ...prev };
          delete newState[rowKey];
          return newState;
        });
        
        await fetchCoverage(); // Refresh the data
      } else {
        setError(result.error || 'Failed to update pricing');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0 || bulkPrice <= 0) {
      setError('Please select items and enter a valid price');
      return;
    }

    try {
      setBulkLoading(true);
      
      const entries = Array.from(selectedItems).map(rowKey => {
        const item = coverage.find(c => getRowKey(c) === rowKey);
        if (!item) return null;
        
        return {
          service_id: item.service_id,
          model_id: item.model_id,
          pricing_tier_id: item.pricing_tier_id,
          base_price: bulkPrice,
          existing_id: item.existing_id
        };
      }).filter(Boolean);

      const response = await fetch('/api/management/dynamic-pricing-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`✅ Bulk update complete: ${result.results?.succeeded || 0} items updated`);
        
        // Mark all updated items as recently updated
        const updatedItems: RecentlyUpdated = {};
        selectedItems.forEach(key => {
          updatedItems[key] = true;
        });
        setRecentlyUpdated(prev => ({ ...prev, ...updatedItems }));
        
        setSelectedItems(new Set());
        setBulkPrice(0);
        await fetchCoverage(); // Refresh the data
      } else {
        setError(result.error || 'Bulk update failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle row selection
  const toggleRowSelection = (item: PricingCoverage) => {
    const rowKey = getRowKey(item);
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(rowKey)) {
        newSelection.delete(rowKey);
      } else {
        newSelection.add(rowKey);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === paginatedCoverage.length) {
      setSelectedItems(new Set());
    } else {
      const allKeys = paginatedCoverage.map(getRowKey);
      setSelectedItems(new Set(allKeys));
    }
  };

  // Handle keyboard shortcuts for inline editing
  const handleKeyPress = (e: React.KeyboardEvent, item: PricingCoverage) => {
    if (e.key === 'Enter') {
      savePrice(item);
    } else if (e.key === 'Escape') {
      cancelEditing(item);
    }
  };

  if (loading && coverage.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading pricing coverage data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}

      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pricing Coverage Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.total_combinations.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Combinations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.existing_entries.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Existing Prices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.missing_entries.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Missing Prices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.coverage_percentage}%</div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
            <select
              value={filters.deviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, deviceType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Device Types</option>
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
            </select>
            <Input
              placeholder="Brand..."
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
            />
            <Input
              placeholder="Service..."
              value={filters.service}
              onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
            />
            <select
              value={filters.tier}
              onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tiers</option>
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="express">Express</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="existing">Has Price</option>
              <option value="missing">Missing Price</option>
            </select>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedCoverage.length} of {filteredCoverage.length} entries
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">{selectedItems.size} items selected</span>
                <Input
                  type="number"
                  placeholder="Bulk price..."
                  value={bulkPrice || ''}
                  onChange={(e) => setBulkPrice(Number(e.target.value))}
                  className="w-32"
                  min="0"
                  step="0.01"
                />
                <Button 
                  onClick={handleBulkUpdate}
                  disabled={bulkLoading || bulkPrice <= 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Selected
                </Button>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedItems(new Set())}
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pricing Coverage Details</span>
            <Button
              variant="outline"
              onClick={fetchCoverage}
              disabled={loading}
              size="sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2"
                    >
                      {selectedItems.size === paginatedCoverage.length && paginatedCoverage.length > 0 ? 
                        <CheckSquare className="h-4 w-4" /> : 
                        <Square className="h-4 w-4" />
                      }
                      Select
                    </button>
                  </th>
                  <th className="text-left p-3">Device</th>
                  <th className="text-left p-3">Brand</th>
                  <th className="text-left p-3">Model</th>
                  <th className="text-left p-3">Service</th>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCoverage.map((item) => {
                  const rowKey = getRowKey(item);
                  const isSelected = selectedItems.has(rowKey);
                  const isEditing = editingStates[rowKey]?.isEditing;
                  const isRecentlyUpdated = recentlyUpdated[rowKey];
                  
                  return (
                    <tr 
                      key={rowKey} 
                      className={`border-b hover:bg-gray-50 ${isRecentlyUpdated ? 'bg-green-100 border-green-300' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-3">
                        <button
                          onClick={() => toggleRowSelection(item)}
                          className="flex items-center"
                        >
                          {isSelected ? 
                            <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                            <Square className="h-4 w-4" />
                          }
                        </button>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {item.device_type}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{item.brand_name}</td>
                      <td className="p-3">{item.model_name}</td>
                      <td className="p-3">{item.service_name}</td>
                      <td className="p-3">
                        <Badge 
                          variant="secondary"
                          className={`capitalize ${
                            item.tier_name === 'premium' ? 'bg-purple-100 text-purple-800' :
                            item.tier_name === 'standard' ? 'bg-blue-100 text-blue-800' :
                            item.tier_name === 'economy' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.tier_name}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {item.is_missing ? (
                          <Badge variant="destructive">Missing</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600">Has Price</Badge>
                            {isRecentlyUpdated && <Badge variant="secondary" className="bg-green-100 text-green-800">Updated!</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingStates[rowKey]?.newPrice || 0}
                            onChange={(e) => setEditingStates(prev => ({
                              ...prev,
                              [rowKey]: {
                                ...prev[rowKey],
                                newPrice: Number(e.target.value)
                              }
                            }))}
                            onKeyDown={(e) => handleKeyPress(e, item)}
                            className="w-24"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono">
                            ${item.existing_price ? item.existing_price.toFixed(2) : 
                              (item.fallback_price ? `${item.fallback_price.toFixed(2)} (est)` : 'N/A')}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {item.is_missing ? (
                            <Button
                              size="sm"
                              onClick={() => handleAddPrice(item)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          ) : (
                            <>
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => savePrice(item)}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => cancelEditing(item)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(item)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 