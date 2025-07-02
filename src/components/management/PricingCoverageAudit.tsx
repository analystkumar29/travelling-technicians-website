import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertTriangle, CheckCircle, Plus, Filter, X, Edit, Save, CheckSquare, Square, Check } from 'lucide-react';

interface PricingCoverage {
  id?: number;
  device_type: string;
  brand_name: string;
  model_name: string;
  service_name: string;
  tier_name: string;
  is_missing: boolean;
  existing_price?: number;
  fallback_price?: number;
}

interface CoverageSummary {
  total_combinations: number;
  existing_entries: number;
  missing_entries: number;
  coverage_percentage: number;
}

interface ApiResponse {
  success: boolean;
  coverage?: PricingCoverage[];
  summary?: CoverageSummary;
  error?: string;
}

export default function PricingCoverageAudit() {
  const [coverage, setCoverage] = useState<PricingCoverage[]>([]);
  const [summary, setSummary] = useState<CoverageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showOnlyMissing, setShowOnlyMissing] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [addLoadingIndex, setAddLoadingIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCoverageData();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear recently updated highlighting after 5 seconds
  useEffect(() => {
    if (recentlyUpdated.size > 0) {
      const timer = setTimeout(() => setRecentlyUpdated(new Set()), 5000);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdated]);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/management/pricing-coverage');
      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch coverage data');
      }
      
      setCoverage(data.coverage || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCoverage = () => {
    return coverage.filter(item => {
      const matchesSearch = !searchTerm || 
        item.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDeviceType = deviceTypeFilter === 'all' || item.device_type === deviceTypeFilter;
      const matchesBrand = brandFilter === 'all' || item.brand_name === brandFilter;
      const matchesService = serviceFilter === 'all' || item.service_name === serviceFilter;
      const matchesTier = tierFilter === 'all' || item.tier_name === tierFilter;
      const matchesMissingFilter = !showOnlyMissing || item.is_missing;
      
      return matchesSearch && matchesDeviceType && matchesBrand && matchesService && matchesTier && matchesMissingFilter;
    });
  };

  const getUniqueValues = (field: keyof PricingCoverage) => {
    return Array.from(new Set(coverage.map(item => item[field]))).sort();
  };

  const getCoverageStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const handleAddMissingPricing = async (item: PricingCoverage, idx: number) => {
    setAddLoadingIndex(idx);
    try {
      const res = await fetch('/api/management/dynamic-pricing-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [{
          device_type: item.device_type,
          brand_name: item.brand_name,
          model_name: item.model_name,
          service_name: item.service_name,
          tier_name: item.tier_name,
          base_price: item.fallback_price || 99
        }] })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to add pricing');
      
      setSuccessMessage(`✅ Added pricing for ${item.brand_name} ${item.model_name} - ${item.service_name}`);
      setRecentlyUpdated(new Set([idx]));
      await fetchCoverageData();
    } catch (err) {
      setError('Error adding price: ' + (err instanceof Error ? err.message : err));
    } finally {
      setAddLoadingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Analyzing pricing coverage...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading coverage data: {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={fetchCoverageData}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const filteredCoverage = getFilteredCoverage();
  const uniqueDeviceTypes = getUniqueValues('device_type');
  const uniqueBrands = getUniqueValues('brand_name');
  const uniqueServices = getUniqueValues('service_name');
  const uniqueTiers = getUniqueValues('tier_name');

  // Bulk selection helpers
  const allSelected = selectedRows.length > 0 && selectedRows.length === filteredCoverage.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedRows([]);
    else setSelectedRows(filteredCoverage.map((_, i) => i));
  };
  const toggleSelectRow = (idx: number) => {
    setSelectedRows((prev) => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };
  // Inline edit helpers
  const startEdit = (idx: number, price: number) => {
    setEditingIndex(idx);
    setEditingPrice(price.toString());
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingPrice('');
  };
  const saveEdit = async (item: PricingCoverage, idx: number) => {
    setEditLoading(true);
    try {
      if (!item.id) {
        throw new Error('Cannot edit missing pricing entry - use Add instead');
      }
      
      const newPrice = parseFloat(editingPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }
      
      const res = await fetch('/api/management/dynamic-pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, base_price: newPrice })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update');
      
      setSuccessMessage(`✅ Updated ${item.brand_name} ${item.model_name} - ${item.service_name} to $${newPrice}`);
      setRecentlyUpdated(new Set([idx]));
      await fetchCoverageData();
      setEditingIndex(null);
      setEditingPrice('');
    } catch (err) {
      setError('Error updating price: ' + (err instanceof Error ? err.message : err));
    } finally {
      setEditLoading(false);
    }
  };
  // Bulk update handler
  const handleBulkUpdate = async () => {
    setBulkLoading(true);
    try {
      const bulkPriceNum = parseFloat(bulkPrice);
      if (isNaN(bulkPriceNum) || bulkPriceNum <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }

      const entries = selectedRows.map(idx => {
        const item = filteredCoverage[idx];
        return {
          device_type: item.device_type,
          brand_name: item.brand_name,
          model_name: item.model_name,
          service_name: item.service_name,
          tier_name: item.tier_name,
          base_price: bulkPriceNum
        };
      });
      
      const res = await fetch('/api/management/dynamic-pricing-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Bulk update failed');
      
      setSuccessMessage(`✅ Successfully updated ${selectedRows.length} pricing entries to $${bulkPriceNum}`);
      setRecentlyUpdated(new Set(selectedRows));
      await fetchCoverageData();
      setSelectedRows([]);
      setBulkPrice('');
    } catch (err) {
      setError('Bulk update error: ' + (err instanceof Error ? err.message : err));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Coverage Audit</h2>
          <p className="text-gray-600">Identify and manage missing pricing combinations</p>
        </div>
        <Button onClick={fetchCoverageData} variant="outline">
          <Loader2 className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Combinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_combinations.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Existing Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.existing_entries.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Missing Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.missing_entries.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {getCoverageStatusIcon(summary.coverage_percentage)}
                <span className={`text-2xl font-bold ml-2 ${getCoverageStatusColor(summary.coverage_percentage)}`}>
                  {summary.coverage_percentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
          <span className="mr-4 font-medium">Bulk Update ({selectedRows.length} selected):</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={bulkPrice}
            onChange={e => setBulkPrice(e.target.value)}
            placeholder="Enter new price"
            className="w-32 mr-2"
          />
          <Button size="sm" onClick={handleBulkUpdate} disabled={bulkLoading || !bulkPrice}>
            {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Apply
          </Button>
          <Button size="sm" variant="outline" className="ml-2" onClick={() => setSelectedRows([])}>
            <X className="w-4 h-4 mr-1" />Cancel
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={deviceTypeFilter} onChange={(e) => setDeviceTypeFilter(e.target.value)}>
              <option value="all">All Device Types</option>
              {uniqueDeviceTypes.map(type => (
                <option key={String(type)} value={String(type)}>{String(type)}</option>
              ))}
            </Select>
            
            <Select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={String(brand)} value={String(brand)}>{String(brand)}</option>
              ))}
            </Select>
            
            <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="all">All Services</option>
              {uniqueServices.map(service => (
                <option key={String(service)} value={String(service)}>{String(service)}</option>
              ))}
            </Select>
            
            <Select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
              <option value="all">All Tiers</option>
              {uniqueTiers.map(tier => (
                <option key={String(tier)} value={String(tier)}>{String(tier)}</option>
              ))}
            </Select>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showOnlyMissing"
                checked={showOnlyMissing}
                onChange={(e) => setShowOnlyMissing(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showOnlyMissing" className="text-sm">Show only missing</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Results ({filteredCoverage.length.toLocaleString()} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCoverage.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No entries found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="rounded"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left p-2">Device Type</th>
                    <th className="text-left p-2">Brand</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-left p-2">Service</th>
                    <th className="text-left p-2">Tier</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoverage.slice(0, 100).map((item, idx) => (
                    <tr 
                      key={idx} 
                      className={`border-b hover:bg-gray-50 ${
                        recentlyUpdated.has(idx) ? 'bg-green-50 border-green-200' : ''
                      }`}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(idx)}
                          onChange={() => toggleSelectRow(idx)}
                          className="rounded"
                          aria-label={`Select row ${idx + 1}`}
                        />
                      </td>
                      <td className="p-2">{item.device_type}</td>
                      <td className="p-2">{item.brand_name}</td>
                      <td className="p-2">{item.model_name}</td>
                      <td className="p-2">{item.service_name}</td>
                      <td className="p-2">{item.tier_name}</td>
                      <td className="p-2">
                        {item.is_missing ? (
                          <Badge variant="destructive">Missing</Badge>
                        ) : (
                          <Badge variant="default" className={recentlyUpdated.has(idx) ? 'bg-green-600' : ''}>
                            {recentlyUpdated.has(idx) ? 'Updated!' : 'Exists'}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {editingIndex === idx ? (
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingPrice}
                              onChange={e => setEditingPrice(e.target.value)}
                              className="w-24 mr-2"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEdit(item, idx);
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                            />
                            <Button size="sm" onClick={() => saveEdit(item, idx)} disabled={editLoading || !editingPrice}>
                              {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" variant="outline" className="ml-1" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : item.is_missing ? (
                          <span className="text-gray-500">
                            Fallback: ${item.fallback_price}
                          </span>
                        ) : (
                          <span className={`font-medium ${recentlyUpdated.has(idx) ? 'text-green-600' : 'text-blue-600'}`}>
                            ${item.existing_price}
                            {recentlyUpdated.has(idx) && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {item.is_missing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddMissingPricing(item, idx)}
                            disabled={addLoadingIndex === idx}
                          >
                            {addLoadingIndex === idx ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-1" />
                            )}
                            Add
                          </Button>
                        ) : editingIndex === idx ? null : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(idx, item.existing_price!)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCoverage.length > 100 && (
                <div className="text-center py-4 text-gray-500">
                  Showing first 100 results. Use filters to narrow down the list.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 