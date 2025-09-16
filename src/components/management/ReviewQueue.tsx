import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimes, 
  FaEye,
  FaUser,
  FaSyncAlt,
  FaFilter,
  FaSort
} from 'react-icons/fa';

interface ReviewItem {
  id: number;
  table_name: string;
  record_id: number;
  record_name: string;
  review_type: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated';
  assigned_to?: string;
  created_at: string;
  deadline?: string;
  quality_score?: number;
  review_data?: any;
}

interface ReviewQueueStats {
  total: number;
  pending: number;
  in_review: number;
  overdue: number;
  critical: number;
}

export default function ReviewQueue() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewQueueStats>({
    total: 0,
    pending: 0,
    in_review: 0,
    overdue: 0,
    critical: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<{
    status: string;
    priority: string;
    type: string;
    assigned: string;
  }>({
    status: 'all',
    priority: 'all',
    type: 'all',
    assigned: 'all'
  });
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'deadline'>('priority');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadReviewQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/management/review-queue');
      const data = await response.json();
      
      if (data.success) {
        setReviewItems(data.items || []);
        calculateStats(data.items || []);
      }
    } catch (error) {
      console.error('Error loading review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items: ReviewItem[]) => {
    const now = new Date();
    const stats = {
      total: items.length,
      pending: items.filter(item => item.status === 'pending').length,
      in_review: items.filter(item => item.status === 'in_review').length,
      overdue: items.filter(item => {
        if (!item.deadline) return false;
        return new Date(item.deadline) < now;
      }).length,
      critical: items.filter(item => item.priority === 'critical').length
    };
    setStats(stats);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) {
      alert('Please select items to perform this action');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/management/review-queue/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          item_ids: Array.from(selectedItems)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedItems(new Set());
        loadReviewQueue();
        alert(`Successfully ${action} ${data.updated_count} items`);
      } else {
        alert(`Failed to ${action} items: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error performing ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleItemAction = async (itemId: number, action: string, notes?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/management/review-queue/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        loadReviewQueue();
      } else {
        alert(`Failed to ${action} item: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error performing ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getFilteredItems = () => {
    return reviewItems.filter(item => {
      if (filter.status !== 'all' && item.status !== filter.status) return false;
      if (filter.priority !== 'all' && item.priority !== filter.priority) return false;
      if (filter.type !== 'all' && item.review_type !== filter.type) return false;
      if (filter.assigned !== 'all') {
        if (filter.assigned === 'unassigned' && item.assigned_to) return false;
        if (filter.assigned === 'assigned' && !item.assigned_to) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const filteredItems = getFilteredItems();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <FaSyncAlt className="animate-spin mx-auto h-8 w-8 text-gray-500 mb-4" />
        <p>Loading review queue...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Queue</h2>
        <p className="text-gray-600">
          Manage items requiring manual review and approval
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="text-sm text-yellow-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-600">In Review</div>
          <div className="text-2xl font-bold text-blue-700">{stats.in_review}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="text-sm text-red-600">Overdue</div>
          <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-sm text-purple-600">Critical</div>
          <div className="text-2xl font-bold text-purple-700">{stats.critical}</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
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
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={filter.priority}
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filter.type}
              onChange={(e) => setFilter({...filter, type: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="quality_check">Quality Check</option>
              <option value="pricing_review">Pricing Review</option>
              <option value="content_validation">Content Validation</option>
            </select>

            <div className="flex items-center gap-2">
              <FaSort className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="priority">Sort by Priority</option>
                <option value="created_at">Sort by Date</option>
                <option value="deadline">Sort by Deadline</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadReviewQueue}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              disabled={loading}
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedItems.size} items selected
            </span>
            
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              disabled={actionLoading}
            >
              <FaCheckCircle />
              Approve Selected
            </button>
            
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              disabled={actionLoading}
            >
              <FaTimes />
              Reject Selected
            </button>
            
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Review Items Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${isOverdue(item.deadline) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{item.record_name}</div>
                    <div className="text-sm text-gray-500">{item.table_name} #{item.record_id}</div>
                    {item.quality_score && (
                      <div className="text-xs text-gray-400">Quality: {item.quality_score}/100</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                    {item.review_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'critical' && <FaExclamationTriangle className="mr-1" />}
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'pending' && <FaClock className="mr-1" />}
                      {item.status === 'in_review' && <FaEye className="mr-1" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.assigned_to ? (
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        {item.assigned_to}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                    {isOverdue(item.deadline) && (
                      <div className="text-xs text-red-600 font-medium">Overdue</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleItemAction(item.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => handleItemAction(item.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {/* Open details modal */}}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-medium text-gray-900">All caught up!</p>
          <p className="text-gray-500 mt-2">No items in the review queue.</p>
        </div>
      )}
    </div>
  );
}
