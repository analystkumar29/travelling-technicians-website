import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaTools, 
  FaSearch, 
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaPlus,
  FaNotesMedical,
  FaStickyNote
} from 'react-icons/fa';

interface Booking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  model_id: string;
  service_id: string;
  scheduled_at: string;
  created_at: string;
  issue_description?: string;
  notes?: string;
  // Optional - may not exist in DB
  status?: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  service_type?: string;
  postal_code?: string;
  city?: string;
  province?: string;
}

interface BookingFilter {
  status: string;
  device_type: string;
  date_range: string;
  search: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<BookingFilter>({
    status: 'all',
    device_type: 'all',
    date_range: 'all',
    search: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  // Helper functions to format date/time from scheduled_at
  const formatDate = (scheduledAt: string) => {
    try {
      return new Date(scheduledAt).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (scheduledAt: string) => {
    try {
      return new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid time';
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    // Device type filter
    if (filters.device_type !== 'all') {
      filtered = filtered.filter(b => b.device_type === filters.device_type);
    }

    // Date range filter
    if (filters.date_range !== 'all') {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      switch (filters.date_range) {
        case 'today':
          filtered = filtered.filter(b => b.scheduled_at?.split('T')[0] === todayString);
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowString = tomorrow.toISOString().split('T')[0];
          filtered = filtered.filter(b => b.scheduled_at?.split('T')[0] === tomorrowString);
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          filtered = filtered.filter(b => {
            const bookingDate = new Date(b.scheduled_at);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
          });
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(b => 
        b.booking_ref.toLowerCase().includes(searchTerm) ||
        b.customer_name.toLowerCase().includes(searchTerm) ||
        b.customer_email.toLowerCase().includes(searchTerm) ||
        b.customer_phone.includes(searchTerm) ||
        (b.device_brand && b.device_brand.toLowerCase().includes(searchTerm)) ||
        (b.device_model && b.device_model.toLowerCase().includes(searchTerm)) ||
        (b.service_type && b.service_type.toLowerCase().includes(searchTerm)) ||
        b.customer_address.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      console.log('Updating booking status:', { id, newStatus });
      
      const response = await fetch('/api/bookings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to update booking status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      console.error('Update booking status error:', err);
      alert(`Failed to update booking status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const addBookingNote = async (id: string, note: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      const existingNotes = booking?.notes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`;
      
      const response = await fetch('/api/bookings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, notes: newNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      await fetchBookings();
      setShowModal(false);
    } catch (err) {
      alert('Failed to add note');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading bookings...</div>
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
            <div className="text-center text-red-600">Error: {error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (scheduledAt: string) => {
    const today = new Date();
    const appointmentDate = new Date(scheduledAt);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'border-l-4 border-red-500 bg-red-50';
    if (diffDays === 1) return 'border-l-4 border-orange-500 bg-orange-50';
    if (diffDays <= 2) return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-green-500 bg-green-50';
  };

  const BookingModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => {
    const [note, setNote] = useState('');
    
    // Format address with fallbacks
    const formatAddress = () => {
      const parts = [
        booking.customer_address || 'Not provided',
        booking.city || '',
        booking.province || '',
        booking.postal_code || ''
      ].filter(part => part && part.trim());
      
      return parts.length > 0 ? parts.join(', ') : 'Address not provided';
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-3 text-primary-600" />
                  Booking Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">Ref: {booking.booking_ref}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Information Section */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.customer_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status || 'pending')}`}>
                      {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FaPhone className="inline mr-1 text-blue-600" />
                      Phone
                    </label>
                    <a href={`tel:${booking.customer_phone}`} className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                      {booking.customer_phone || 'Not provided'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FaEnvelope className="inline mr-1 text-green-600" />
                      Email
                    </label>
                    <a href={`mailto:${booking.customer_email}`} className="mt-1 text-sm font-medium text-green-600 hover:text-green-800">
                      {booking.customer_email || 'Not provided'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Device Information Section */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTools className="mr-2 text-purple-600" />
                  Device Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {booking.device_type ? booking.device_type.charAt(0).toUpperCase() + booking.device_type.slice(1) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.device_brand || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.device_model || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Service Information Section */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTools className="mr-2 text-orange-600" />
                  Service Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{booking.service_type || 'Not provided'}</p>
                </div>
                {booking.issue_description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Issue Description</label>
                    <p className="mt-2 text-sm text-gray-900 p-3 bg-white rounded-md border border-orange-200">
                      {booking.issue_description}
                    </p>
                  </div>
                )}
              </div>

              {/* Appointment Information Section */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaClock className="mr-2 text-green-600" />
                  Appointment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDate(booking.scheduled_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formatTime(booking.scheduled_at)}</p>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-red-600" />
                  Service Location
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Address</label>
                  <p className="mt-1 text-sm font-medium text-gray-900 p-3 bg-white rounded-md border border-red-200">
                    {formatAddress()}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Street</label>
                    <p className="mt-1 text-sm text-gray-800">{booking.customer_address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">City</label>
                    <p className="mt-1 text-sm text-gray-800">{booking.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Province</label>
                    <p className="mt-1 text-sm text-gray-800">{booking.province || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Postal Code</label>
                    <p className="mt-1 text-sm text-gray-800">{booking.postal_code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaStickyNote className="mr-2 text-yellow-600" />
                  Notes & Comments
                </h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Existing Notes</label>
                  <div className="p-3 bg-white rounded-md border border-yellow-200 min-h-[80px]">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {booking.notes || 'No notes yet'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Add a note about this booking..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addBookingNote(booking.id, note)}
                  disabled={!note.trim()}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaStickyNote className="inline mr-2" />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-3" />
                  Booking Management
                </h1>
                <p className="mt-2 text-gray-600">Manage customer bookings and appointments</p>
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
                    <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                      <dd className="text-lg font-medium text-gray-900">{bookings.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaClock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {bookings.filter(b => b.status === 'pending').length}
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
                    <FaCheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {bookings.filter(b => b.status === 'confirmed').length}
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
                    <FaTools className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {bookings.filter(b => b.status === 'completed').length}
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
                      placeholder="Search bookings..."
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                    Date Range
                  </label>
                  <select
                    value={filters.date_range}
                    onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this_week">This Week</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Bookings ({filteredBookings.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No bookings found matching your criteria
                </li>
              ) : (
                filteredBookings.map((booking) => (
                  <li key={booking.id} className={`px-6 py-4 ${getUrgencyColor(booking.scheduled_at)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <FaTools className="mr-2 text-primary-600" />
                              {booking.booking_ref}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {booking.customer_name} - {booking.customer_email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status || 'pending')}`}>
                              {booking.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <strong>Device:</strong> {booking.device_brand || 'Unknown'} {booking.device_model || ''}
                          </div>
                          <div>
                            <strong>Service:</strong> {booking.service_type || `Service ID: ${booking.service_id?.substring(0, 8)}...`}
                          </div>
                          <div>
                            <strong>Date:</strong> {formatDate(booking.scheduled_at)} at {formatTime(booking.scheduled_at)}
                          </div>
                          <div>
                            <strong>Address:</strong> {booking.customer_address}, {booking.postal_code || 'N/A'}
                          </div>
                          <div>
                            <strong>Created:</strong> {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Location:</strong> {booking.city || 'N/A'}, {booking.province || 'N/A'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <a 
                            href={`tel:${booking.customer_phone}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FaPhone className="mr-1" />
                            {booking.customer_phone}
                          </a>
                          <a 
                            href={`mailto:${booking.customer_email}`}
                            className="flex items-center text-green-600 hover:text-green-800"
                          >
                            <FaEnvelope className="mr-1" />
                            {booking.customer_email}
                          </a>
                          <div className="flex items-center text-gray-500">
                            <FaMapMarkerAlt className="mr-1" />
                            {booking.customer_address}
                          </div>
                        </div>
                        
                        {booking.issue_description && (
                          <div className="mb-3">
                            <strong className="text-sm text-gray-600">Issue Description:</strong>
                            <p className="text-sm text-gray-800 mt-1 p-2 bg-gray-50 rounded">
                              {booking.issue_description}
                            </p>
                          </div>
                        )}

                        {booking.notes && (
                          <div className="mb-3">
                            <strong className="text-sm text-gray-600">Notes:</strong>
                            <p className="text-sm text-gray-800 mt-1 p-2 bg-blue-50 rounded whitespace-pre-wrap">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center"
                      >
                        <FaEye className="mr-1" />
                        View Details
                      </button>

                      {(!booking.status || booking.status === 'pending') && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Complete Repair
                        </button>
                      )}

                      {booking.status !== 'completed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Modal */}
          {showModal && selectedBooking && (
            <BookingModal 
              booking={selectedBooking} 
              onClose={() => {
                setShowModal(false);
                setSelectedBooking(null);
              }} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
} 