import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminModal from '@/components/admin/AdminModal';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import { authFetch } from '@/utils/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Eye,
  Phone,
  Mail,
  Calendar,
  Wrench,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  StickyNote
} from 'lucide-react';

interface Warranty {
  id: string;
  warranty_code: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  parts_covered: string[];
  notes: string;
  created_at: string;
  booking: {
    reference_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    service_type: string;
    address: string;
  };
  technician: {
    full_name: string;
    email: string;
    phone: string;
  };
  days_remaining: number;
}

interface WarrantyFilter {
  status: string;
  expiring_soon: boolean;
  device_type: string;
  search: string;
}

export default function AdminWarranties() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [voidingWarrantyId, setVoidingWarrantyId] = useState<string | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);
  const [filters, setFilters] = useState<WarrantyFilter>({
    status: 'all',
    expiring_soon: false,
    device_type: 'all',
    search: ''
  });

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/warranties');

      if (!response.ok) {
        throw new Error('Failed to fetch warranties');
      }

      const data = await response.json();
      setWarranties(data.warranties || []);
    } catch (err) {
      setError('Failed to fetch warranties');
      toast.error('Failed to fetch warranties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...warranties];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    // Expiring soon filter (within 30 days)
    if (filters.expiring_soon) {
      filtered = filtered.filter(w => w.days_remaining <= 30 && w.days_remaining > 0);
    }

    // Device type filter
    if (filters.device_type !== 'all') {
      filtered = filtered.filter(w => w.booking?.device_type === filters.device_type);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.warranty_code.toLowerCase().includes(searchTerm) ||
        w.booking?.customer_name.toLowerCase().includes(searchTerm) ||
        w.booking?.customer_email.toLowerCase().includes(searchTerm) ||
        w.booking?.reference_number.toLowerCase().includes(searchTerm) ||
        w.booking?.device_brand.toLowerCase().includes(searchTerm) ||
        w.booking?.device_model.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredWarranties(filtered);
  }, [warranties, filters]);

  useEffect(() => {
    fetchWarranties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warranties, filters, applyFilters]);

  const updateWarrantyStatus = async (id: string, newStatus: string) => {
    try {
      const response = await authFetch('/api/warranties/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update warranty status');
      }

      toast.success(`Warranty status updated to ${newStatus}`);
      fetchWarranties();
    } catch (err) {
      toast.error('Failed to update warranty status');
    }
  };

  const handleVoidWarranty = (id: string) => {
    setVoidingWarrantyId(id);
    setShowVoidConfirm(true);
  };

  const confirmVoidWarranty = async () => {
    if (!voidingWarrantyId) return;

    setIsVoiding(true);
    try {
      await updateWarrantyStatus(voidingWarrantyId, 'void');
      setShowVoidConfirm(false);
      setVoidingWarrantyId(null);
    } finally {
      setIsVoiding(false);
    }
  };

  const addWarrantyNote = async (id: string, note: string) => {
    try {
      const warranty = warranties.find(w => w.id === id);
      const existingNotes = warranty?.notes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`;

      const response = await authFetch('/api/warranties/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, notes: newNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      toast.success('Note added successfully');
      await fetchWarranties();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const getExpiryWarning = (daysRemaining: number) => {
    if (daysRemaining === 0) return 'border-l-4 border-red-500 bg-red-50';
    if (daysRemaining <= 7) return 'border-l-4 border-orange-500 bg-orange-50';
    if (daysRemaining <= 30) return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-green-500 bg-green-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const WarrantyModal = ({ warranty, onClose }: { warranty: Warranty; onClose: () => void }) => {
    const [note, setNote] = useState('');

    return (
      <AdminModal
        open={true}
        onClose={onClose}
        title={`Warranty Details - ${warranty.warranty_code}`}
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => addWarrantyNote(warranty.id, note)}
              disabled={!note.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="mt-1 text-sm text-gray-900">{warranty.booking?.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <AdminStatusBadge status={warranty.status} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Device</label>
              <p className="mt-1 text-sm text-gray-900">{warranty.booking?.device_brand} {warranty.booking?.device_model}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Days Remaining</label>
              <p className="mt-1 text-sm text-gray-900">{warranty.days_remaining} days</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Service Performed</label>
            <p className="mt-1 text-sm text-gray-900">{warranty.booking?.service_type}</p>
          </div>

          {warranty.parts_covered && warranty.parts_covered.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Parts Covered</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {warranty.parts_covered.map((part, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Existing Notes</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {warranty.notes || 'No notes yet'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Add Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Add a note about this warranty..."
            />
          </div>
        </div>
      </AdminModal>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Warranty Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading warranties...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Warranty Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-600">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Warranty Management">
      <AdminPageHeader
        title="Warranty Management"
        description="Manage customer warranties and claims"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AdminStatsCard
          label="Total Warranties"
          value={warranties.length}
          icon={Shield}
          color="green"
        />
        <AdminStatsCard
          label="Active"
          value={warranties.filter(w => w.status === 'active').length}
          icon={CheckCircle}
          color="blue"
        />
        <AdminStatsCard
          label="Expiring Soon"
          value={warranties.filter(w => w.days_remaining <= 30 && w.days_remaining > 0).length}
          icon={AlertTriangle}
          color="amber"
        />
        <AdminStatsCard
          label="Expired"
          value={warranties.filter(w => w.status === 'expired' || w.days_remaining === 0).length}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search warranties..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="claimed">Claimed</option>
                <option value="void">Void</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <select
                value={filters.device_type}
                onChange={(e) => setFilters({ ...filters, device_type: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Devices</option>
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="expiring_soon"
                  checked={filters.expiring_soon}
                  onChange={(e) => setFilters({ ...filters, expiring_soon: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="expiring_soon" className="ml-2 block text-sm text-gray-900">
                  Expiring Soon (30 days)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warranties List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Warranties ({filteredWarranties.length})
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredWarranties.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No warranties found matching your criteria
            </li>
          ) : (
            filteredWarranties.map((warranty) => (
              <li key={warranty.id} className={`px-6 py-4 ${getExpiryWarning(warranty.days_remaining)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                          <Shield className="mr-2 text-green-600 h-5 w-5" />
                          {warranty.warranty_code}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Booking: {warranty.booking?.reference_number}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <AdminStatusBadge status={warranty.status} />
                        {warranty.days_remaining <= 30 && warranty.days_remaining > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            {warranty.days_remaining} days left
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <strong>Customer:</strong> {warranty.booking?.customer_name}
                      </div>
                      <div>
                        <strong>Device:</strong> {warranty.booking?.device_brand} {warranty.booking?.device_model}
                      </div>
                      <div>
                        <strong>Service:</strong> {warranty.booking?.service_type}
                      </div>
                      <div>
                        <strong>Issue Date:</strong> {formatDate(warranty.issue_date)}
                      </div>
                      <div>
                        <strong>Expiry Date:</strong> {formatDate(warranty.expiry_date)}
                      </div>
                      <div>
                        <strong>Technician:</strong> {warranty.technician?.full_name || 'Not assigned'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <a
                        href={`tel:${warranty.booking?.customer_phone}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="mr-1 h-4 w-4" />
                        {warranty.booking?.customer_phone}
                      </a>
                      <a
                        href={`mailto:${warranty.booking?.customer_email}`}
                        className="flex items-center text-green-600 hover:text-green-800"
                      >
                        <Mail className="mr-1 h-4 w-4" />
                        {warranty.booking?.customer_email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedWarranty(warranty);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Details
                  </button>

                  {warranty.status === 'active' && (
                    <>
                      <button
                        onClick={() => updateWarrantyStatus(warranty.id, 'claimed')}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Mark as Claimed
                      </button>
                      <button
                        onClick={() => handleVoidWarranty(warranty.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Void Warranty
                      </button>
                    </>
                  )}

                  {warranty.status === 'claimed' && (
                    <button
                      onClick={() => updateWarrantyStatus(warranty.id, 'active')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Restore to Active
                    </button>
                  )}

                  <Link
                    href={`/management/bookings`}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 inline-flex items-center"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View Booking
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Modal */}
      {showModal && selectedWarranty && (
        <WarrantyModal
          warranty={selectedWarranty}
          onClose={() => {
            setShowModal(false);
            setSelectedWarranty(null);
          }}
        />
      )}

      {/* Void Confirmation Dialog */}
      <AdminConfirmDialog
        open={showVoidConfirm}
        onClose={() => {
          setShowVoidConfirm(false);
          setVoidingWarrantyId(null);
        }}
        onConfirm={confirmVoidWarranty}
        title="Void Warranty"
        message="Are you sure you want to void this warranty? This action cannot be undone."
        confirmLabel="Void Warranty"
        variant="danger"
        loading={isVoiding}
      />
    </AdminLayout>
  );
}
