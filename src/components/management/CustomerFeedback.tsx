import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Clock,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '@/utils/auth';
import AdminModal from '@/components/admin/AdminModal';

interface CustomerFeedback {
  id: number;
  source_type: string;
  source_reference?: string;
  customer_email?: string;
  feedback_type: string;
  subject_table?: string;
  subject_record_id?: number;
  reported_issue: string;
  suggested_correction?: string;
  severity_reported: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'confirmed' | 'rejected' | 'resolved';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  confirmed: number;
  resolved: number;
  by_type: { [key: string]: number };
  by_severity: { [key: string]: number };
}

export default function CustomerFeedback() {
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    resolved: 0,
    by_type: {},
    by_severity: {}
  });
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [filter, setFilter] = useState<{
    status: string;
    type: string;
    severity: string;
    source: string;
  }>({
    status: 'all',
    type: 'all',
    severity: 'all',
    source: 'all'
  });
  const [sortBy, setSortBy] = useState<'created_at' | 'severity' | 'status'>('created_at');
  const [reviewAction, setReviewAction] = useState<{
    id: number;
    action: string;
    notes: string;
  } | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.type !== 'all' && { type: filter.type }),
        ...(filter.severity !== 'all' && { severity: filter.severity }),
        ...(filter.source !== 'all' && { source: filter.source }),
        sort_by: sortBy
      });

      const response = await authFetch(`/api/management/customer-feedback?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.feedback || []);
        calculateStats(data.feedback || []);
      }
    } catch (error) {
      console.error('Error loading customer feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => {
    loadFeedback();
  }, [filter, sortBy, loadFeedback]);

  const calculateStats = (feedbackList: CustomerFeedback[]) => {
    const stats: FeedbackStats = {
      total: feedbackList.length,
      pending: feedbackList.filter(f => f.status === 'pending').length,
      confirmed: feedbackList.filter(f => f.status === 'confirmed').length,
      resolved: feedbackList.filter(f => f.status === 'resolved').length,
      by_type: {},
      by_severity: {}
    };

    // Count by type and severity
    for (const item of feedbackList) {
      stats.by_type[item.feedback_type] = (stats.by_type[item.feedback_type] || 0) + 1;
      stats.by_severity[item.severity_reported] = (stats.by_severity[item.severity_reported] || 0) + 1;
    }

    setStats(stats);
  };

  const handleReviewFeedback = async (id: number, action: 'confirm' | 'reject' | 'resolve', notes: string) => {
    try {
      const response = await authFetch(`/api/management/customer-feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          review_notes: notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        loadFeedback();
        setReviewAction(null);
        setSelectedFeedback(null);
      } else {
        toast.error(`Failed to ${action} feedback: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing feedback:`, error);
      toast.error(`Error ${action}ing feedback`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'reviewing': return <Eye className="h-3 w-3" />;
      case 'confirmed': return <AlertTriangle className="h-3 w-3" />;
      case 'rejected': return <X className="h-3 w-3" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading && feedback.length === 0) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin mx-auto h-8 w-8 text-gray-500 mb-4" />
        <p>Loading customer feedback...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Feedback</h2>
        <p className="text-gray-600">
          Customer-reported issues and suggestions for quality improvement
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-500">Total Feedback</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="text-sm text-yellow-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <div className="text-sm text-orange-600">Confirmed</div>
          <div className="text-2xl font-bold text-orange-700">{stats.confirmed}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-600">Resolved</div>
          <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="model_incorrect">Model Incorrect</option>
            <option value="pricing_issue">Pricing Issue</option>
            <option value="service_unavailable">Service Unavailable</option>
          </select>

          <select
            value={filter.severity}
            onChange={(e) => setFilter({...filter, severity: e.target.value})}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="created_at">Sort by Date</option>
              <option value="severity">Sort by Severity</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          <button
            onClick={loadFeedback}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {feedback.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Issue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.customer_email || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.source_type} {item.source_reference && `(${item.source_reference})`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                    {item.feedback_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(item.severity_reported)}`}>
                      {item.severity_reported}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={item.reported_issue}>
                      {item.reported_issue}
                    </div>
                    {item.suggested_correction && (
                      <div className="text-xs text-gray-500 max-w-xs truncate" title={item.suggested_correction}>
                        Suggestion: {item.suggested_correction}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setReviewAction({ id: item.id, action: 'confirm', notes: '' })}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm Issue"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setReviewAction({ id: item.id, action: 'reject', notes: '' })}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Issue"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </>
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
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-medium text-gray-900">No feedback found</p>
          <p className="text-gray-500 mt-2">No customer feedback matches your current filters.</p>
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal
        open={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Feedback Details"
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Customer:</strong> {selectedFeedback.customer_email || 'Anonymous'}
              </div>
              <div>
                <strong>Source:</strong> {selectedFeedback.source_type}
              </div>
              <div>
                <strong>Type:</strong> {selectedFeedback.feedback_type}
              </div>
              <div>
                <strong>Severity:</strong> {selectedFeedback.severity_reported}
              </div>
              <div>
                <strong>Status:</strong> {selectedFeedback.status}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}
              </div>
            </div>

            <div>
              <strong>Reported Issue:</strong>
              <p className="mt-1 p-3 bg-gray-100 rounded">{selectedFeedback.reported_issue}</p>
            </div>

            {selectedFeedback.suggested_correction && (
              <div>
                <strong>Suggested Correction:</strong>
                <p className="mt-1 p-3 bg-blue-50 rounded">{selectedFeedback.suggested_correction}</p>
              </div>
            )}

            {selectedFeedback.review_notes && (
              <div>
                <strong>Review Notes:</strong>
                <p className="mt-1 p-3 bg-gray-100 rounded">{selectedFeedback.review_notes}</p>
              </div>
            )}

            {selectedFeedback.action_taken && (
              <div>
                <strong>Action Taken:</strong>
                <p className="mt-1 p-3 bg-green-50 rounded">{selectedFeedback.action_taken}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Review Action Modal */}
      <AdminModal
        open={!!reviewAction}
        onClose={() => setReviewAction(null)}
        title={reviewAction ? `${reviewAction.action.charAt(0).toUpperCase() + reviewAction.action.slice(1)} Feedback` : ''}
        size="sm"
        footer={
          reviewAction ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewAction(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewFeedback(reviewAction.id, reviewAction.action as any, reviewAction.notes)}
                className={`px-4 py-2 text-white rounded hover:opacity-90 ${
                  reviewAction.action === 'confirm' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {reviewAction.action.charAt(0).toUpperCase() + reviewAction.action.slice(1)}
              </button>
            </div>
          ) : undefined
        }
      >
        {reviewAction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes:
            </label>
            <textarea
              value={reviewAction.notes}
              onChange={(e) => setReviewAction({...reviewAction, notes: e.target.value})}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Enter your review notes..."
            />
          </div>
        )}
      </AdminModal>
    </div>
  );
}
