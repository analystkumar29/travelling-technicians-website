import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { 
  FaShieldAlt, 
  FaSearch, 
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaTools,
  FaClock,
  FaExternalLinkAlt,
  FaEdit,
  FaPlus,
  FaStickyNote
} from 'react-icons/fa';

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
  const [filters, setFilters] = useState<WarrantyFilter>({
    status: 'all',
    expiring_soon: false,
    device_type: 'all',
    search: ''
  });

  useEffect(() => {
    fetchWarranties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warranties, filters]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warranties');
      
      if (!response.ok) {
        throw new Error('Failed to fetch warranties');
      }
      
      const data = await response.json();
      setWarranties(data.warranties || []);
    } catch (err) {
      setError('Failed to fetch warranties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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
  };

  const updateWarrantyStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/warranties/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update warranty status');
      }

      // Refresh warranties
      fetchWarranties();
    } catch (err) {
      alert('Failed to update warranty status');
    }
  };

  const addWarrantyNote = async (id: string, note: string) => {
    try {
      const warranty = warranties.find(w => w.id === id);
      const existingNotes = warranty?.notes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`;
      
      const response = await fetch('/api/warranties/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, notes: newNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      await fetchWarranties();
      setShowModal(false);
    } catch (err) {
      alert('Failed to add note');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'void': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaShieldAlt className="mr-2 text-green-600" />
                Warranty Details - {warranty.warranty_code}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{warranty.booking?.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(warranty.status)}`}>
                    {warranty.status}
                  </span>
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
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading warranties...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              <FaExclamationTriangle className="mx-auto h-12 w-12 mb-4" />
              <p>Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaShieldAlt className="mr-3" />
                  Warranty Management
                </h1>
                <p className="mt-2 text-gray-600">Manage customer warranties and claims</p>
              </div>
              <Link
                href="/management"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Back to Management
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Warranties</dt>
                      <dd className="text-lg font-medium text-gray-900">{warranties.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {warranties.filter(w => w.status === 'active').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {warranties.filter(w => w.days_remaining <= 30 && w.days_remaining > 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaClock className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Expired</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {warranties.filter(w => w.status === 'expired' || w.days_remaining === 0).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaFilter className="mr-2" />
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
                      <FaSearch className="h-5 w-5 text-gray-400" />
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
                              <FaShieldAlt className="mr-2 text-green-600" />
                              {warranty.warranty_code}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Booking: {warranty.booking?.reference_number}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(warranty.status)}`}>
                              {warranty.status}
                            </span>
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
                            <FaPhone className="mr-1" />
                            {warranty.booking?.customer_phone}
                          </a>
                          <a 
                            href={`mailto:${warranty.booking?.customer_email}`}
                            className="flex items-center text-green-600 hover:text-green-800"
                          >
                            <FaEnvelope className="mr-1" />
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
                        <FaEye className="mr-1" />
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
                            onClick={() => updateWarrantyStatus(warranty.id, 'void')}
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
                        <FaExternalLinkAlt className="mr-1" />
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
        </div>
      </div>
    </Layout>
  );
} 