import React, { useState, useEffect } from 'react';
import { 
  FaDatabase,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaDownload,
  FaUpload,
  FaFilter,
  FaSyncAlt,
  FaPlay,
  FaPause
} from 'react-icons/fa';

interface ImportBatch {
  id: string;
  batch_name: string;
  source_system: string;
  import_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_records: number;
  processed_records: number;
  approved_records: number;
  rejected_records: number;
  error_records: number;
  average_quality_score?: number;
  contamination_rate?: number;
  started_at: string;
  completed_at?: string;
  progress_percentage: number;
}

interface StagingStats {
  total_batches: number;
  active_batches: number;
  completed_batches: number;
  failed_batches: number;
  total_records_processed: number;
  average_quality_score: number;
  contamination_rate: number;
}

export default function StagingDashboard() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [stats, setStats] = useState<StagingStats>({
    total_batches: 0,
    active_batches: 0,
    completed_batches: 0,
    failed_batches: 0,
    total_records_processed: 0,
    average_quality_score: 0,
    contamination_rate: 0
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    status: string;
    source: string;
    type: string;
  }>({
    status: 'all',
    source: 'all',
    type: 'all'
  });

  useEffect(() => {
    loadStagingData();
    // Set up polling for active batches
    const interval = setInterval(loadStagingData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadStagingData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.source !== 'all' && { source: filter.source }),
        ...(filter.type !== 'all' && { type: filter.type })
      });

      const response = await fetch(`/api/management/staging-dashboard?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.batches || []);
        calculateStats(data.batches || []);
      }
    } catch (error) {
      console.error('Error loading staging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (batchList: ImportBatch[]) => {
    const stats: StagingStats = {
      total_batches: batchList.length,
      active_batches: batchList.filter(b => ['pending', 'processing'].includes(b.status)).length,
      completed_batches: batchList.filter(b => b.status === 'completed').length,
      failed_batches: batchList.filter(b => b.status === 'failed').length,
      total_records_processed: batchList.reduce((sum, b) => sum + b.processed_records, 0),
      average_quality_score: 0,
      contamination_rate: 0
    };

    // Calculate averages for completed batches
    const completedBatches = batchList.filter(b => b.status === 'completed' && b.average_quality_score);
    if (completedBatches.length > 0) {
      stats.average_quality_score = completedBatches.reduce((sum, b) => sum + (b.average_quality_score || 0), 0) / completedBatches.length;
      stats.contamination_rate = completedBatches.reduce((sum, b) => sum + (b.contamination_rate || 0), 0) / completedBatches.length;
    }

    setStats(stats);
  };

  const handleBatchAction = async (batchId: string, action: 'start' | 'pause' | 'cancel') => {
    try {
      const response = await fetch(`/api/management/staging-batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      
      if (data.success) {
        loadStagingData();
      } else {
        alert(`Failed to ${action} batch: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing batch:`, error);
      alert(`Error ${action}ing batch`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'processing': return <FaSyncAlt className="animate-spin" />;
      case 'completed': return <FaCheckCircle />;
      case 'failed': return <FaTimes />;
      case 'cancelled': return <FaTimes />;
      default: return null;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getQualityScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && batches.length === 0) {
    return (
      <div className="p-6 text-center">
        <FaSyncAlt className="animate-spin mx-auto h-8 w-8 text-gray-500 mb-4" />
        <p>Loading staging dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <FaDatabase className="mr-3" />
          Staging Pipeline Dashboard
        </h2>
        <p className="text-gray-600">
          Monitor and manage data import batches through the staging pipeline
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Batches</div>
          <div className="text-2xl font-bold">{stats.total_batches}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-600">Active Batches</div>
          <div className="text-2xl font-bold text-blue-700">{stats.active_batches}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-600">Records Processed</div>
          <div className="text-2xl font-bold text-green-700">{stats.total_records_processed.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-sm text-purple-600">Avg Quality Score</div>
          <div className={`text-2xl font-bold ${getQualityScoreColor(stats.average_quality_score)}`}>
            {stats.average_quality_score > 0 ? `${Math.round(stats.average_quality_score)}/100` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Completed Batches</div>
          <div className="text-xl font-bold text-green-600">{stats.completed_batches}</div>
          <div className="text-xs text-gray-400">
            {stats.total_batches > 0 ? Math.round((stats.completed_batches / stats.total_batches) * 100) : 0}% completion rate
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Failed Batches</div>
          <div className="text-xl font-bold text-red-600">{stats.failed_batches}</div>
          <div className="text-xs text-gray-400">
            {stats.total_batches > 0 ? Math.round((stats.failed_batches / stats.total_batches) * 100) : 0}% failure rate
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Contamination Rate</div>
          <div className="text-xl font-bold text-orange-600">
            {stats.contamination_rate > 0 ? `${Math.round(stats.contamination_rate)}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-400">
            Percentage of contaminated records
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <select
              value={filter.source}
              onChange={(e) => setFilter({...filter, source: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="mobileactive">MobileActive</option>
              <option value="manual_upload">Manual Upload</option>
              <option value="api_import">API Import</option>
            </select>

            <select
              value={filter.type}
              onChange={(e) => setFilter({...filter, type: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="models">Models</option>
              <option value="pricing">Pricing</option>
              <option value="combined">Combined</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStagingData}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              disabled={loading}
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      {batches.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Batch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Records
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{batch.batch_name}</div>
                    <div className="text-sm text-gray-500">
                      {batch.source_system} • {batch.import_type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {getStatusIcon(batch.status)}
                      <span className="ml-1">{batch.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          batch.status === 'completed' ? 'bg-green-600' : 
                          batch.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, batch.progress_percentage)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(batch.progress_percentage)}% ({batch.processed_records}/{batch.total_records})
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {batch.average_quality_score ? (
                      <div>
                        <div className={`text-sm font-medium ${getQualityScoreColor(batch.average_quality_score)}`}>
                          {Math.round(batch.average_quality_score)}/100
                        </div>
                        {batch.contamination_rate && (
                          <div className="text-xs text-red-500">
                            {Math.round(batch.contamination_rate)}% contaminated
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-green-600">✓ {batch.approved_records}</div>
                      <div className="text-red-600">✗ {batch.rejected_records}</div>
                      <div className="text-orange-600">⚠ {batch.error_records}</div>
                      <div className="text-gray-600">Total: {batch.total_records}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDuration(batch.started_at, batch.completed_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {batch.status === 'pending' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'start')}
                          className="text-green-600 hover:text-green-900"
                          title="Start Processing"
                        >
                          <FaPlay />
                        </button>
                      )}
                      
                      {batch.status === 'processing' && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pause Processing"
                        >
                          <FaPause />
                        </button>
                      )}
                      
                      {['pending', 'processing'].includes(batch.status) && (
                        <button
                          onClick={() => handleBatchAction(batch.id, 'cancel')}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Batch"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaDatabase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No import batches found</p>
          <p className="text-gray-500 mt-2">
            {filter.status !== 'all' || filter.source !== 'all' || filter.type !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Import batches will appear here when data processing begins.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
