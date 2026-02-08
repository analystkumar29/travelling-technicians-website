import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, EyeOff, RefreshCw } from 'lucide-react';
import { authFetch } from '@/utils/auth';
import { toast } from 'sonner';

interface ContaminatedModel {
  id: number;
  name: string;
  brand_name: string;
  device_type: string;
  quality_score: number;
  data_source: string;
  contamination_reasons: string[];
}

interface QualityStats {
  total_models: number;
  contaminated_count: number;
  clean_count: number;
  contamination_rate: string;
}

export default function ModelQualityControl() {
  const [loading, setLoading] = useState(false);
  const [contaminatedModels, setContaminatedModels] = useState<ContaminatedModel[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'critical' | 'moderate'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    performQualityAudit();
  }, []);

  const performQualityAudit = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/api/management/models/quality-audit');
      const data = await response.json();
      
      if (data.success) {
        setContaminatedModels(data.contaminated_models || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error performing quality audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedModels.size === 0) {
      toast.error('Please select models to perform this operation');
      return;
    }

    setActionLoading(true);
    try {
      const response = await authFetch('/api/management/models/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          model_ids: Array.from(selectedModels)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully ${operation}d ${data.updated_count} models`);
        setSelectedModels(new Set());
        performQualityAudit(); // Refresh the list
      } else {
        toast.error(`Failed to ${operation} models: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error performing ${operation}:`, error);
      toast.error(`Error performing ${operation}`);
    } finally {
      setActionLoading(false);
    }
  };

  const autoFixContamination = async () => {
    if (!window.confirm('This will automatically flag all contaminated models for review and lower their quality scores. Continue?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await authFetch('/api/management/models/quality-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_update: true,
          threshold: 50
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Quality scores updated successfully');
        performQualityAudit();
      }
    } catch (error) {
      console.error('Error auto-fixing contamination:', error);
      toast.error('Error updating quality scores');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedModels.size === filteredModels.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(filteredModels.map(m => m.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedModels(newSelected);
  };

  const getFilteredModels = () => {
    switch (filter) {
      case 'critical':
        return contaminatedModels.filter(m => m.contamination_reasons.length >= 3);
      case 'moderate':
        return contaminatedModels.filter(m => m.contamination_reasons.length < 3);
      default:
        return contaminatedModels;
    }
  };

  const filteredModels = getFilteredModels();

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin mx-auto h-8 w-8 text-gray-500 mb-4" />
        <p>Performing quality audit...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Quality Control</h2>
        <p className="text-gray-600">
          Identify and manage contaminated model names from the scraping pipeline
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-sm text-gray-500">Total Models</div>
            <div className="text-2xl font-bold">{stats.total_models}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-600">Contaminated</div>
            <div className="text-2xl font-bold text-red-700">{stats.contaminated_count}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-600">Clean</div>
            <div className="text-2xl font-bold text-green-700">{stats.clean_count}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-sm text-yellow-600">Contamination Rate</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.contamination_rate}</div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All ({contaminatedModels.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded ${filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              Critical ({contaminatedModels.filter(m => m.contamination_reasons.length >= 3).length})
            </button>
            <button
              onClick={() => setFilter('moderate')}
              className={`px-4 py-2 rounded ${filter === 'moderate' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Moderate ({contaminatedModels.filter(m => m.contamination_reasons.length < 3).length})
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={performQualityAudit}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={autoFixContamination}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              disabled={actionLoading}
            >
              Auto-Fix All
            </button>
          </div>
        </div>

        {selectedModels.size > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedModels.size} models selected
            </span>
            
            <button
              onClick={() => handleBulkOperation('deactivate')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              disabled={actionLoading}
            >
              <EyeOff className="h-4 w-4" />
              Deactivate Selected
            </button>
            
            <button
              onClick={() => handleBulkOperation('mark-for-review')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2"
              disabled={actionLoading}
            >
              <AlertTriangle className="h-4 w-4" />
              Mark for Review
            </button>
            
            <button
              onClick={() => setSelectedModels(new Set())}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Contaminated Models Table */}
      {filteredModels.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedModels.size === filteredModels.length && filteredModels.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedModels.has(model.id)}
                      onChange={() => toggleSelect(model.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{model.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {model.brand_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {model.device_type}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {model.contamination_reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{model.quality_score}</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            model.quality_score >= 70 ? 'bg-green-500' :
                            model.quality_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${model.quality_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      model.data_source === 'scraped' ? 'bg-orange-100 text-orange-800' :
                      model.data_source === 'manual' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.data_source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-medium text-gray-900">No contaminated models found!</p>
          <p className="text-gray-500 mt-2">All models appear to have clean names.</p>
        </div>
      )}
    </div>
  );
}
