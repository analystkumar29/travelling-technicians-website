import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminModal from '@/components/admin/AdminModal';
import { authFetch } from '@/utils/auth';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import {
  MessageSquare,
  Star,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

interface Testimonial {
  id: string;
  customer_name: string;
  city: string | null;
  device_model: string | null;
  service: string | null;
  rating: number | null;
  review: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
  location_id: string | null;
  service_id: string | null;
  neighborhood_id: number | null;
  verified: boolean;
  source: string;
  status: string;
  device_type: string | null;
  technician_rating: number | null;
  service_rating: number | null;
  booking_id: string | null;
  customer_email: string | null;
  service_locations?: { id: string; city_name: string; slug: string } | null;
  services?: { id: string; name: string; display_name: string } | null;
}

interface ServiceLocation {
  id: string;
  city_name: string;
  slug: string;
}

interface ServiceOption {
  id: string;
  name: string;
  display_name: string;
}

interface TestimonialFormData {
  customer_name: string;
  city: string;
  device_model: string;
  device_type: string;
  service: string;
  rating: number | null;
  review: string;
  source: string;
  status: string;
  is_featured: boolean;
  featured_order: number;
  verified: boolean;
  location_id: string;
  service_id: string;
}

const EMPTY_FORM: TestimonialFormData = {
  customer_name: '',
  city: '',
  device_model: '',
  device_type: '',
  service: '',
  rating: null,
  review: '',
  source: 'manual',
  status: 'approved',
  is_featured: false,
  featured_order: 0,
  verified: false,
  location_id: '',
  service_id: '',
};

// ── Helpers ────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, string> = {
  google: 'bg-blue-100 text-blue-800',
  yelp: 'bg-red-100 text-red-800',
  manual: 'bg-green-100 text-green-800',
  synthetic: 'bg-gray-100 text-gray-700',
  website: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) {
    return <span className="text-gray-400 text-sm">N/A</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Page Component ─────────────────────────────────────────────

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filtered, setFiltered] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Approve/Reject loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Reference data
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);

  // ── Data Fetching ──────────────────────────────────────────

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/management/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      setTestimonials(data.testimonials || []);
      setError(null);
    } catch (err) {
      setError('Failed to load testimonials');
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [locRes, svcRes] = await Promise.all([
        supabase
          .from('service_locations')
          .select('id, city_name, slug')
          .eq('is_active', true)
          .order('city_name'),
        supabase
          .from('services')
          .select('id, name, display_name')
          .eq('is_active', true)
          .order('name'),
      ]);
      if (locRes.data) setServiceLocations(locRes.data);
      if (svcRes.data) setServiceOptions(svcRes.data);
    } catch {
      // Non-critical — dropdowns will be empty
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
    fetchReferenceData();
  }, [fetchTestimonials, fetchReferenceData]);

  // ── Filtering ──────────────────────────────────────────────

  useEffect(() => {
    let result = [...testimonials];

    if (sourceFilter !== 'all') {
      result = result.filter((t) => t.source === sourceFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (featuredFilter === 'featured') {
      result = result.filter((t) => t.is_featured);
    } else if (featuredFilter === 'not_featured') {
      result = result.filter((t) => !t.is_featured);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.customer_name.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [testimonials, sourceFilter, statusFilter, featuredFilter, searchQuery]);

  // ── Stats ──────────────────────────────────────────────────

  const totalCount = testimonials.length;
  const featuredCount = testimonials.filter((t) => t.is_featured).length;
  const pendingCount = testimonials.filter((t) => t.status === 'pending').length;
  const verifiedCount = testimonials.filter((t) => t.verified).length;
  const avgRating = (() => {
    const rated = testimonials.filter((t) => t.rating !== null && t.rating !== undefined);
    if (rated.length === 0) return '0.0';
    const sum = rated.reduce((acc, t) => acc + (t.rating ?? 0), 0);
    return (sum / rated.length).toFixed(1);
  })();

  // ── Approve / Reject ─────────────────────────────────────

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoadingId(id);
    try {
      const payload: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'approved') {
        payload.verified = true;
      }

      const response = await authFetch(
        `/api/management/testimonials?id=${id}`,
        { method: 'PUT', body: JSON.stringify(payload) }
      );

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(
        newStatus === 'approved' ? 'Review approved' : 'Review rejected'
      );
      fetchTestimonials();
    } catch {
      toast.error('Failed to update review status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Modal Handlers ─────────────────────────────────────────

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customer_name: testimonial.customer_name || '',
      city: testimonial.city || '',
      device_model: testimonial.device_model || '',
      device_type: testimonial.device_type || '',
      service: testimonial.service || '',
      rating: testimonial.rating,
      review: testimonial.review || '',
      source: testimonial.source || 'manual',
      status: testimonial.status || 'approved',
      is_featured: testimonial.is_featured,
      featured_order: testimonial.featured_order || 0,
      verified: testimonial.verified,
      location_id: testimonial.location_id || '',
      service_id: testimonial.service_id || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!formData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        customer_name: formData.customer_name.trim(),
        city: formData.city || null,
        device_model: formData.device_model || null,
        device_type: formData.device_type || null,
        service: formData.service || null,
        rating: formData.rating,
        review: formData.review || null,
        source: formData.source,
        status: formData.status,
        is_featured: formData.is_featured,
        featured_order: formData.featured_order,
        verified: formData.verified,
        location_id: formData.location_id || null,
        service_id: formData.service_id || null,
      };

      let response: Response;

      if (editingTestimonial) {
        response = await authFetch(
          `/api/management/testimonials?id=${editingTestimonial.id}`,
          { method: 'PUT', body: JSON.stringify(payload) }
        );
      } else {
        response = await authFetch('/api/management/testimonials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save testimonial');
      }

      toast.success(
        editingTestimonial
          ? 'Testimonial updated successfully'
          : 'Testimonial created successfully'
      );
      closeModal();
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Featured (inline) ───────────────────────────────

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const response = await authFetch(
        `/api/management/testimonials?id=${testimonial.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ is_featured: !testimonial.is_featured }),
        }
      );

      if (!response.ok) throw new Error('Failed to update');

      toast.success(
        testimonial.is_featured ? 'Removed from featured' : 'Added to featured'
      );
      fetchTestimonials();
    } catch {
      toast.error('Failed to toggle featured status');
    }
  };

  // ── Delete ─────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await authFetch(
        `/api/management/testimonials?id=${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete testimonial');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading / Error States ─────────────────────────────────

  if (loading) {
    return (
      <AdminLayout title="Testimonials">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Testimonials">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-600">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p>{error}</p>
            <button
              onClick={fetchTestimonials}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <AdminLayout title="Testimonials">
      <AdminPageHeader
        title="Testimonials"
        description="Manage customer testimonials and reviews"
        actions={
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <AdminStatsCard
          label="Total Testimonials"
          value={totalCount}
          icon={MessageSquare}
          color="blue"
        />
        <AdminStatsCard
          label="Pending Reviews"
          value={pendingCount}
          icon={Clock}
          color="amber"
        />
        <AdminStatsCard
          label="Featured"
          value={featuredCount}
          icon={Award}
          color="purple"
        />
        <AdminStatsCard
          label="Average Rating"
          value={avgRating}
          icon={Star}
          color="indigo"
        />
        <AdminStatsCard
          label="Verified"
          value={verifiedCount}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="google">Google</option>
            <option value="yelp">Yelp</option>
            <option value="manual">Manual</option>
            <option value="website">Website (Customer)</option>
            <option value="synthetic">Synthetic</option>
          </select>

          {/* Featured filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All (Featured & Not)</option>
            <option value="featured">Featured Only</option>
            <option value="not_featured">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            Showing {filtered.length} of {totalCount} testimonials
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No testimonials found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer */}
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {t.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(t.created_at)}
                      </div>
                      {t.review && (
                        <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={t.review}>
                          {t.review}
                        </div>
                      )}
                    </td>

                    {/* City */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {t.city || <span className="text-gray-400">--</span>}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <StarRating rating={t.rating} />
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          SOURCE_COLORS[t.source] || SOURCE_COLORS.manual
                        }`}
                      >
                        {t.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          STATUS_COLORS[t.status] || STATUS_COLORS.approved
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(t)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                          t.is_featured ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                        title={t.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            t.is_featured ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve/Reject for pending */}
                        {t.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(t.id, 'approved')}
                              disabled={actionLoadingId === t.id}
                              className="p-1.5 rounded-lg text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoadingId === t.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusChange(t.id, 'rejected')}
                              disabled={actionLoadingId === t.id}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        open={showModal}
        onClose={closeModal}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.customer_name.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTestimonial ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Row 1: Customer name + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="John D."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="manual">Manual</option>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="website">Website (Customer)</option>
                <option value="synthetic">Synthetic</option>
              </select>
            </div>
          </div>

          {/* Row 2: Status + Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                value={formData.rating ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Row 3: City + Device Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Vancouver"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Model
              </label>
              <input
                type="text"
                value={formData.device_model}
                onChange={(e) =>
                  setFormData({ ...formData, device_model: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="iPhone 15 Pro"
              />
            </div>
          </div>

          {/* Row 4: Device Type + Service (text) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Type
              </label>
              <input
                type="text"
                value={formData.device_type}
                onChange={(e) =>
                  setFormData({ ...formData, device_type: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="smartphone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Screen Replacement"
              />
            </div>
          </div>

          {/* Row 5: Featured Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Order
              </label>
              <input
                type="number"
                value={formData.featured_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    featured_order: Number(e.target.value) || 0,
                  })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                min={0}
              />
            </div>
          </div>

          {/* Row 6: Location + Service (FK) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Location
              </label>
              <select
                value={formData.location_id}
                onChange={(e) =>
                  setFormData({ ...formData, location_id: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">None</option>
                {serviceLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service (linked)
              </label>
              <select
                value={formData.service_id}
                onChange={(e) =>
                  setFormData({ ...formData, service_id: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">None</option>
                {serviceOptions.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.display_name || svc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Review textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review
            </label>
            <textarea
              value={formData.review}
              onChange={(e) =>
                setFormData({ ...formData, review: e.target.value })
              }
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Customer review text..."
            />
          </div>

          {/* Technician & Service Ratings (read-only for website reviews) */}
          {editingTestimonial && (editingTestimonial.technician_rating || editingTestimonial.service_rating) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">
                  Technician Rating
                </span>
                <StarRating rating={editingTestimonial.technician_rating} />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">
                  Service Rating
                </span>
                <StarRating rating={editingTestimonial.service_rating} />
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) =>
                  setFormData({ ...formData, verified: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Verified
            </label>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
