import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { authFetch } from '@/utils/auth';
import Link from 'next/link';
import {
  Calendar,
  Wrench,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { addNotification } from '@/components/admin/AdminNotificationBell';

interface ManagementStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalWarranties: number;
  activeWarranties: number;
  todayBookings: number;
  thisWeekRevenue: number;
}

interface RecentBooking {
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
  // Optional - may not exist in DB
  status?: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  service_type?: string;
  final_price?: number;
  quoted_price?: number;
}

interface UpcomingAppointment {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  model_id: string;
  service_id: string;
  scheduled_at: string;
  // Optional - may not exist in DB
  status?: string;
  device_brand?: string;
  device_model?: string;
  service_type?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<ManagementStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalWarranties: 0,
    activeWarranties: 0,
    todayBookings: 0,
    thisWeekRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManagementData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchUpcomingAppointments()
      ]);
    } catch (err) {
      setError('Failed to load management data');
      console.error('Management fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch data if authenticated (after AdminLayout HOC check completes)
    const checkAndFetch = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetchManagementData();
      }
    };

    checkAndFetch();
  }, [fetchManagementData]);

  // Real-time booking updates
  useRealtimeBookings({
    onNewBooking: (booking) => {
      const ref = (booking.booking_ref as string) || 'New booking';
      const name = (booking.customer_name as string) || 'Unknown';
      addNotification('new_booking', `New booking ${ref} from ${name}`);
      fetchManagementData();
    },
  });

  const fetchStats = async () => {
    const response = await authFetch('/api/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    const bookingsData = await response.json();
    const bookings: RecentBooking[] = bookingsData.bookings || [];

    const warrantiesResponse = await authFetch('/api/warranties');
    let warranties: any[] = [];
    if (warrantiesResponse.ok) {
      const warrantiesData = await warrantiesResponse.json();
      warranties = warrantiesData.warranties || [];
    }

    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totalBookings = bookings.length || 0;
    const pendingBookings = bookings.filter((b: RecentBooking) => b.status === 'pending').length || 0;
    const confirmedBookings = bookings.filter((b: RecentBooking) => b.status === 'confirmed').length || 0;
    const completedBookings = bookings.filter((b: RecentBooking) => b.status === 'completed').length || 0;
    const todayBookings = bookings.filter((b: RecentBooking) =>
      b.scheduled_at?.split('T')[0] === today
    ).length || 0;

    const totalWarranties = warranties.length || 0;
    const activeWarranties = warranties.filter((w: any) => w.status === 'active').length || 0;

    const thisWeekCompletedBookings = bookings.filter((b: RecentBooking) =>
      b.created_at >= oneWeekAgo && b.status === 'completed'
    );
    const thisWeekRevenue = thisWeekCompletedBookings.reduce((sum: number, b: any) => {
      const price = b.final_price ?? b.quoted_price ?? 0;
      return sum + (typeof price === 'number' ? price : parseFloat(price) || 0);
    }, 0);

    setStats({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalWarranties,
      activeWarranties,
      todayBookings,
      thisWeekRevenue
    });
  };

  const fetchRecentBookings = async () => {
    const response = await authFetch('/api/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch recent bookings');
    }
    const data = await response.json();
    const bookings: RecentBooking[] = data.bookings || [];

    // Get the 5 most recent bookings
    const recentBookings = bookings
      .sort((a: RecentBooking, b: RecentBooking) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setRecentBookings(recentBookings);
  };

  const fetchUpcomingAppointments = async () => {
    const response = await authFetch('/api/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming appointments');
    }
    const data = await response.json();
    const bookings: UpcomingAppointment[] = data.bookings || [];

    const today = new Date().toISOString().split('T')[0];

    // Filter for upcoming appointments
    const upcomingAppointments = bookings
      .filter((booking: UpcomingAppointment) => {
        const bookingDate = booking.scheduled_at?.split('T')[0];
        const status = booking.status || 'pending';
        return bookingDate >= today && ['confirmed', 'pending'].includes(status);
      })
      .sort((a: UpcomingAppointment, b: UpcomingAppointment) => {
        const dateA = new Date(a.scheduled_at);
        const dateB = new Date(b.scheduled_at);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);

    setUpcomingAppointments(upcomingAppointments);
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      console.log('Updating booking status:', { id, newStatus });

      const response = await authFetch('/api/bookings/update', {
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

      toast.success('Booking status updated successfully');
      await fetchManagementData();
    } catch (err) {
      console.error('Update booking status error:', err);
      toast.error(`Failed to update booking status: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading management...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchManagementData}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        <AdminPageHeader
          title="Admin Dashboard"
          description="Welcome back! Here's what's happening with your business today."
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            label="Total Bookings"
            value={stats.totalBookings.toString()}
            icon={Calendar}
            color="blue"
            trend={`${stats.pendingBookings} pending • ${stats.confirmedBookings} confirmed`}
          />

          <AdminStatsCard
            label="Today's Appointments"
            value={stats.todayBookings.toString()}
            icon={Clock}
            color="amber"
            trend={
              <Link href="/management/bookings" className="text-amber-600 hover:text-amber-900 font-medium">
                View all appointments →
              </Link>
            }
          />

          <AdminStatsCard
            label="Active Warranties"
            value={stats.activeWarranties.toString()}
            icon={Shield}
            color="green"
            trend={
              <Link href="/management/warranties" className="text-green-600 hover:text-green-900 font-medium">
                Manage warranties →
              </Link>
            }
          />

          <AdminStatsCard
            label="This Week Revenue"
            value={`$${stats.thisWeekRevenue}`}
            icon={DollarSign}
            color="purple"
            trend={`${stats.completedBookings} completed repairs`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Upcoming Appointments
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No upcoming appointments
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className={`px-6 py-4 ${getUrgencyColor(appointment.scheduled_at)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {appointment.booking_ref}
                          </h4>
                          <AdminStatusBadge
                            status={appointment.status as any || 'pending'}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>{appointment.customer_name}</strong>
                          {appointment.device_brand && ` - ${appointment.device_brand}`}
                          {appointment.device_model && ` ${appointment.device_model}`}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          {appointment.service_type || `Service ID: ${appointment.service_id?.substring(0, 8)}...`}
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(appointment.scheduled_at)} at {formatTime(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {appointment.customer_address}
                          </div>
                          <div className="flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {appointment.customer_phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      {(!appointment.status || appointment.status === 'pending') && (
                        <button
                          onClick={() => updateBookingStatus(appointment.id, 'confirmed')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(appointment.id, 'completed')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Complete Repair
                        </button>
                      )}
                      <Link
                        href={`/management/bookings`}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Recent Bookings
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent bookings
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {booking.booking_ref}
                      </h4>
                      <AdminStatusBadge
                        status={booking.status as any || 'pending'}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>{booking.customer_name}</strong>
                      {booking.device_brand && ` - ${booking.device_brand}`}
                      {booking.device_model && ` ${booking.device_model}`}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {booking.service_type || `Service ID: ${booking.service_id?.substring(0, 8)}...`}
                    </p>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Call customer"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <a
                          href={`mailto:${booking.customer_email}`}
                          className="text-green-600 hover:text-green-800"
                          title="Email customer"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <Link
                href="/management/bookings"
                className="text-sm text-primary-600 hover:text-primary-900 font-medium"
              >
                View all bookings →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <Link
                href="/management/bookings"
                className="flex items-center justify-center px-4 py-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <Calendar className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-900">Manage Bookings</p>
                </div>
              </Link>

              <Link
                href="/management/warranties"
                className="flex items-center justify-center px-4 py-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-center">
                  <Shield className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-900">View Warranties</p>
                </div>
              </Link>

              <Link
                href="/management/pricing"
                className="flex items-center justify-center px-4 py-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-center">
                  <DollarSign className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-orange-900">Pricing Management</p>
                </div>
              </Link>

              <Link
                href="/management/customer-feedback"
                className="flex items-center justify-center px-4 py-6 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <div className="text-center">
                  <Users className="mx-auto h-8 w-8 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-teal-900">Customer Feedback</p>
                </div>
              </Link>

              <Link
                href="/management/devices"
                className="flex items-center justify-center px-4 py-6 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="text-center">
                  <Phone className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-indigo-900">Device Management</p>
                </div>
              </Link>

              <Link
                href="/management/technicians"
                className="flex items-center justify-center px-4 py-6 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <div className="text-center">
                  <Wrench className="mx-auto h-8 w-8 text-teal-600 mb-2" />
                  <p className="text-sm font-medium text-teal-900">Technicians</p>
                </div>
              </Link>

              <Link
                href="/book-online"
                className="flex items-center justify-center px-4 py-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-purple-900">New Booking</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
