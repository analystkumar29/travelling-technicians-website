import { authFetch, handleAuthError } from '@/utils/auth';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminModal from '@/components/admin/AdminModal';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { addNotification } from '@/components/admin/AdminNotificationBell';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Calendar,
  Wrench,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Eye,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Plus,
  FileText,
  StickyNote,
  UserCog,
  Shield,
  Download,
} from 'lucide-react';

interface Technician {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

interface Booking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  model_id: string;
  service_id: string;
  technician_id?: string;
  scheduled_at: string;
  created_at: string;
  issue_description?: string;
  notes?: string;
  status?: string;
  quoted_price?: number;
  city?: string;
  province?: string;
  device_models?: {
    name: string;
    brand_id: string;
    type_id: string;
  };
  services?: {
    name: string;
    display_name: string;
  };
  service_locations?: {
    city_name: string;
  };
  technicians?: {
    full_name: string;
    phone: string;
  };
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
  const [technicians, setTechnicians] = useState<Technician[]>([]);
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

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    if (filters.device_type !== 'all') {
      // TODO: Implement device type filtering once we have device_type data
    }

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

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(b =>
        b.booking_ref.toLowerCase().includes(searchTerm) ||
        b.customer_name.toLowerCase().includes(searchTerm) ||
        b.customer_email.toLowerCase().includes(searchTerm) ||
        b.customer_phone.includes(searchTerm) ||
        (b.device_models?.name && b.device_models.name.toLowerCase().includes(searchTerm)) ||
        (b.services?.name && b.services.name.toLowerCase().includes(searchTerm)) ||
        b.customer_address.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  useEffect(() => {
    fetchBookings();
    fetchTechnicians();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const formatDate = (booking: any) => {
    if (booking.booking_date) {
      const [year, month, day] = booking.booking_date.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
      });
    }
    if (booking.scheduled_at) {
      return new Date(booking.scheduled_at).toLocaleDateString();
    }
    return 'Not scheduled';
  };

  const formatTime = (booking: any) => {
    if (booking.booking_time) {
      const [h, m] = booking.booking_time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    }
    if (booking.scheduled_at) {
      return new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'Not scheduled';
  };

  const parseAddress = (address: string) => {
    if (!address) return { street: '', city: '', province: '', postalCode: '' };

    const parts = address.split(',').map(part => part.trim());

    if (parts.length >= 3) {
      return {
        street: parts[0],
        city: parts[1],
        province: parts[2],
        postalCode: parts.length > 3 ? parts[3] : ''
      };
    } else if (parts.length === 2) {
      return { street: parts[0], city: parts[1], province: '', postalCode: '' };
    } else {
      const postalCodeMatch = address.match(/\b[A-Z]\d[A-Z] \d[A-Z]\d\b|\b[A-Z]\d[A-Z]\d[A-Z]\d\b/);
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : '';
      let street = address;
      if (postalCode) {
        street = address.replace(postalCode, '').replace(/,\s*$/, '').trim();
      }
      return { street, city: '', province: '', postalCode };
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/bookings');

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

  const fetchTechnicians = async () => {
    try {
      const response = await authFetch('/api/technicians');
      if (response.ok) {
        const data = await response.json();
        const techs = (data.technicians || data || []).filter((t: Technician) => t.is_active);
        setTechnicians(techs);
      }
    } catch {
      console.error('Failed to fetch technicians');
    }
  };

  // Real-time booking updates
  useRealtimeBookings({
    onNewBooking: (booking) => {
      const ref = (booking.booking_ref as string) || 'New booking';
      const name = (booking.customer_name as string) || 'Unknown';
      addNotification('new_booking', `New booking ${ref} from ${name}`);
      fetchBookings();
    },
  });

  const updateBookingStatus = async (id: string, newStatus: string, extraData?: Record<string, any>) => {
    try {
      const response = await authFetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, ...extraData }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update booking status: ${response.status}`);
      }

      await fetchBookings();
      toast.success('Booking status updated successfully');
    } catch (err) {
      toast.error(`Failed to update booking status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const assignTechnician = async (bookingId: string, technicianId: string) => {
    await updateBookingStatus(bookingId, 'assigned', { technician_id: technicianId });
  };

  const completeRepair = async (bookingId: string, technicianId: string, repairNotes: string, repairDuration: number, partsUsed: string) => {
    try {
      const response = await authFetch('/api/repairs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          technician_id: technicianId,
          repair_notes: repairNotes,
          repair_duration: repairDuration,
          parts_used: partsUsed ? partsUsed.split('\n').filter(Boolean).map(p => ({ name: p.trim() })) : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed: ${response.status}`);
      }

      const result = await response.json();
      await fetchBookings();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const addBookingNote = async (id: string, note: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      const existingNotes = booking?.notes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`;

      const response = await authFetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: newNotes }),
      });

      if (!response.ok) throw new Error('Failed to add note');
      await fetchBookings();
      setShowModal(false);
      toast.success('Note added successfully');
    } catch {
      toast.error('Failed to add note');
    }
  };

  const exportToCSV = () => {
    const headers = ['Ref', 'Customer', 'Email', 'Phone', 'Device', 'Service', 'Date', 'Status', 'Address'];
    const rows = filteredBookings.map(b => [
      b.booking_ref,
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.device_models?.name || 'Unknown',
      b.services?.display_name || b.services?.name || 'Unknown',
      formatDate(b),
      b.status || 'pending',
      b.customer_address
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  if (loading) {
    return (
      <AdminLayout title="Booking Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-600">Loading bookings...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Booking Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

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

  const formatStatus = (status: string) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const BookingModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => {
    const [note, setNote] = useState('');
    const [selectedTechId, setSelectedTechId] = useState(booking.technician_id || '');
    const [showCompletionForm, setShowCompletionForm] = useState(false);
    const [repairNotes, setRepairNotes] = useState('');
    const [repairDuration, setRepairDuration] = useState(60);
    const [partsUsed, setPartsUsed] = useState('');
    const [completionResult, setCompletionResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [warrantyInfo, setWarrantyInfo] = useState<any>(null);

    useEffect(() => {
      if (booking.status === 'completed') {
        authFetch(`/api/warranties?booking_id=${booking.id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.warranties?.length > 0) {
              setWarrantyInfo(data.warranties[0]);
            } else if (data && Array.isArray(data) && data.length > 0) {
              setWarrantyInfo(data[0]);
            }
          })
          .catch(() => {});
      }
    }, [booking.id, booking.status]);

    const formatAddress = () => {
      const parts = [
        booking.customer_address || 'Not provided',
        booking.service_locations?.city_name || ''
      ].filter(part => part && part.trim());
      return parts.length > 0 ? parts.join(', ') : 'Address not provided';
    };

    const handleAssignTechnician = async () => {
      if (!selectedTechId) return;
      setSubmitting(true);
      await assignTechnician(booking.id, selectedTechId);
      setSubmitting(false);
      onClose();
    };

    const handleCompleteRepair = async () => {
      if (!repairNotes.trim()) {
        toast.error('Repair notes are required');
        return;
      }
      const techId = booking.technician_id || selectedTechId;
      if (!techId) {
        toast.error('A technician must be assigned before completing the repair');
        return;
      }
      setSubmitting(true);
      try {
        const result = await completeRepair(booking.id, techId, repairNotes, repairDuration, partsUsed);
        setCompletionResult(result);
        toast.success('Repair completed successfully');
      } catch (err) {
        toast.error(`Failed to complete repair: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <AdminModal
        open={true}
        onClose={onClose}
        title={`Booking Details - ${booking.booking_ref}`}
        size="xl"
      >
        <div className="space-y-6">
          {completionResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-800 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Repair Completed Successfully
              </h4>
              <p className="text-sm text-green-700 mt-1">Booking {completionResult.booking_ref} has been marked as completed.</p>
              {completionResult.warranty && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-900">
                    <Shield className="inline mr-1 h-4 w-4 text-green-600" />
                    Warranty Auto-Created
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Number: <span className="font-mono font-semibold">{completionResult.warranty.warranty_number}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Valid: {completionResult.warranty.start_date} to {completionResult.warranty.end_date}
                  </p>
                </div>
              )}
              <button onClick={onClose} className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Close
              </button>
            </div>
          )}

          {!completionResult && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.customer_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <AdminStatusBadge status={booking.status || 'pending'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <Phone className="inline mr-1 h-4 w-4 text-blue-600" />
                      Phone
                    </label>
                    <a href={`tel:${booking.customer_phone}`} className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                      {booking.customer_phone || 'Not provided'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <Mail className="inline mr-1 h-4 w-4 text-green-600" />
                      Email
                    </label>
                    <a href={`mailto:${booking.customer_email}`} className="mt-1 text-sm font-medium text-green-600 hover:text-green-800">
                      {booking.customer_email || 'Not provided'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-purple-600" />
                  Device Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.device_models?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{booking.services?.display_name || booking.services?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {booking.service_locations?.city_name || 'Address only'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCog className="mr-2 h-5 w-5 text-indigo-600" />
                  Technician Assignment
                </h4>
                {booking.technicians ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Technician</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{booking.technicians.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <a href={`tel:${booking.technicians.phone}`} className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        {booking.technicians.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">No technician assigned yet.</p>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select a technician...</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.full_name} - {t.phone}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignTechnician}
                          disabled={!selectedTechId || submitting}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-orange-600" />
                  Service Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Details</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {booking.services?.display_name || booking.services?.name || 'Service ID: ' + (booking.service_id?.substring(0, 8) || 'N/A')}
                  </p>
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

              {booking.quoted_price && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-emerald-600" />
                    Pricing Information
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quoted Price</label>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      ${booking.quoted_price.toFixed(2)} CAD
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-600" />
                  Appointment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(booking)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formatTime(booking)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
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
                    <p className="mt-1 text-sm text-gray-800">{parseAddress(booking.customer_address).street || booking.customer_address || 'N/A'}</p>
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
                    <p className="mt-1 text-sm text-gray-800">{parseAddress(booking.customer_address).postalCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {booking.status === 'completed' && warrantyInfo && (
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-teal-600" />
                    Warranty
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Warranty Number</label>
                      <p className="mt-1 text-sm font-mono font-semibold text-gray-900">{warrantyInfo.warranty_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{warrantyInfo.end_date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <AdminStatusBadge status={warrantyInfo.status} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link href="/management/warranties" className="text-sm text-teal-600 hover:text-teal-800 underline">
                      View in Warranty Management
                    </Link>
                  </div>
                </div>
              )}

              {showCompletionForm && booking.status === 'in-progress' && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    Complete Repair
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repair Notes *</label>
                      <textarea
                        value={repairNotes}
                        onChange={(e) => setRepairNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        rows={3}
                        placeholder="Describe the repair work performed..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repair Duration (minutes)</label>
                        <input
                          type="number"
                          value={repairDuration}
                          onChange={(e) => setRepairDuration(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          min={1}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used (one per line)</label>
                      <textarea
                        value={partsUsed}
                        onChange={(e) => setPartsUsed(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        rows={2}
                        placeholder="e.g. iPhone 15 Screen Assembly&#10;Adhesive Kit"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowCompletionForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCompleteRepair}
                        disabled={!repairNotes.trim() || submitting}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Completing...' : 'Complete Repair & Generate Warranty'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <StickyNote className="mr-2 h-5 w-5 text-yellow-600" />
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

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition">
                  Close
                </button>
                {note.trim() && (
                  <button
                    onClick={() => addBookingNote(booking.id, note)}
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition"
                  >
                    <StickyNote className="inline mr-2 h-4 w-4" />
                    Add Note
                  </button>
                )}
                {booking.status === 'in-progress' && !showCompletionForm && (
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
                  >
                    <CheckCircle className="inline mr-2 h-4 w-4" />
                    Complete Repair
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </AdminModal>
    );
  };

  return (
    <AdminLayout title="Booking Management">
      <AdminPageHeader
        title="Booking Management"
        description="Manage customer bookings and appointments"
        actions={
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <AdminStatsCard
          label="Total"
          value={bookings.length}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <AdminStatsCard
          label="Pending"
          value={bookings.filter(b => b.status === 'pending').length}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <AdminStatsCard
          label="Confirmed"
          value={bookings.filter(b => b.status === 'confirmed').length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="blue"
        />
        <AdminStatsCard
          label="Assigned"
          value={bookings.filter(b => b.status === 'assigned').length}
          icon={<UserCog className="h-5 w-5" />}
          color="purple"
        />
        <AdminStatsCard
          label="In Progress"
          value={bookings.filter(b => b.status === 'in-progress').length}
          icon={<Wrench className="h-5 w-5" />}
          color="indigo"
        />
        <AdminStatsCard
          label="Completed"
          value={bookings.filter(b => b.status === 'completed').length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
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
                          <Wrench className="mr-2 h-5 w-5 text-primary-600" />
                          {booking.booking_ref}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.customer_name} - {booking.customer_email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AdminStatusBadge status={booking.status || 'pending'} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <strong>Device:</strong> {booking.device_models?.name || 'Unknown device'}
                      </div>
                      <div>
                        <strong>Service:</strong> {booking.services?.display_name || booking.services?.name || `Service ID: ${booking.service_id?.substring(0, 8)}...`}
                      </div>
                      <div>
                        <strong>Date:</strong> {formatDate(booking)} at {formatTime(booking)}
                      </div>
                      <div>
                        <strong>Address:</strong> {booking.customer_address}
                      </div>
                      <div>
                        <strong>Technician:</strong> {booking.technicians?.full_name || <span className="text-gray-400">Unassigned</span>}
                      </div>
                      <div>
                        <strong>Location:</strong> {booking.service_locations?.city_name || 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <a href={`tel:${booking.customer_phone}`} className="flex items-center text-blue-600 hover:text-blue-800">
                        <Phone className="mr-1 h-4 w-4" />
                        {booking.customer_phone}
                      </a>
                      <a href={`mailto:${booking.customer_email}`} className="flex items-center text-green-600 hover:text-green-800">
                        <Mail className="mr-1 h-4 w-4" />
                        {booking.customer_email}
                      </a>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="mr-1 h-4 w-4" />
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
                    <Eye className="mr-1 h-4 w-4" />
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
                    <TechnicianAssignDropdown
                      bookingId={booking.id}
                      technicians={technicians}
                      onAssign={assignTechnician}
                    />
                  )}

                  {booking.status === 'assigned' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Start Repair
                    </button>
                  )}

                  {booking.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <CheckCircle className="inline mr-1 h-4 w-4" />
                      Complete Repair
                    </button>
                  )}

                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
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

      {showModal && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => {
            setShowModal(false);
            setSelectedBooking(null);
            fetchBookings();
          }}
        />
      )}
    </AdminLayout>
  );
}

function TechnicianAssignDropdown({
  bookingId,
  technicians,
  onAssign,
}: {
  bookingId: string;
  technicians: Technician[];
  onAssign: (bookingId: string, techId: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedId) return;
    setAssigning(true);
    await onAssign(bookingId, selectedId);
    setAssigning(false);
  };

  return (
    <div className="flex items-center gap-1">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="">Assign tech...</option>
        {technicians.map(t => (
          <option key={t.id} value={t.id}>{t.full_name}</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={!selectedId || assigning}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {assigning ? '...' : 'Assign'}
      </button>
    </div>
  );
}
