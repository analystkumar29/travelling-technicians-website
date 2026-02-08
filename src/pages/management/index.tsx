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
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
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

interface AnalyticsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  totalBookings: number;
  bookingsByStatus: { status: string; count: number }[];
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  paymentMethodBreakdown: { method: string; count: number; total: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  topCities: { city: string; count: number }[];
  technicianStats: { name: string; completedBookings: number; rating: number }[];
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await authFetch('/api/management/analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.error('Analytics fetch error (non-blocking):', err);
    }
  };

  const fetchManagementData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchUpcomingAppointments(),
        fetchAnalytics()
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

        {/* Revenue Analytics */}
        {analytics && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Revenue Analytics
                </h3>
                <Link
                  href="/management/payments"
                  className="text-sm text-primary-600 hover:text-primary-900 font-medium flex items-center"
                >
                  View Payments <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue This Month vs Last Month */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Monthly Revenue</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${analytics.thisMonthRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {analytics.lastMonthRevenue > 0 && (
                        <div className="flex items-center text-xs">
                          {analytics.thisMonthRevenue >= analytics.lastMonthRevenue ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-green-600 font-medium">
                                {Math.round(((analytics.thisMonthRevenue - analytics.lastMonthRevenue) / analytics.lastMonthRevenue) * 100)}% vs last month
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                              <span className="text-red-600 font-medium">
                                {Math.round(((analytics.lastMonthRevenue - analytics.thisMonthRevenue) / analytics.lastMonthRevenue) * 100)}% vs last month
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="text-sm font-medium text-gray-700">
                        ${analytics.lastMonthRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">All Time</span>
                      <span className="text-sm font-medium text-gray-700">
                        ${analytics.totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue Bar Chart (last 6 months using CSS divs) */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Last 6 Months</h4>
                  {analytics.revenueByMonth.length > 0 && (
                    <div className="flex items-end gap-2 h-32">
                      {(() => {
                        const maxRevenue = Math.max(...analytics.revenueByMonth.map((m) => m.revenue), 1);
                        return analytics.revenueByMonth.map((month, i) => (
                          <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-500 font-medium">
                              ${month.revenue > 999 ? `${(month.revenue / 1000).toFixed(1)}k` : Math.round(month.revenue)}
                            </span>
                            <div
                              className={`w-full rounded-t transition-all ${
                                i === analytics.revenueByMonth.length - 1
                                  ? 'bg-primary-600'
                                  : 'bg-primary-200'
                              }`}
                              style={{
                                height: `${Math.max((month.revenue / maxRevenue) * 100, 4)}%`,
                                minHeight: '4px',
                              }}
                            />
                            <span className="text-[10px] text-gray-400 truncate w-full text-center">
                              {month.month.split(' ')[0]}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Top 5 Services by booking count */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Top Services</h4>
                  {analytics.topServices.length > 0 ? (
                    <div className="space-y-2.5">
                      {analytics.topServices.map((service, i) => (
                        <div key={service.name}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate mr-2">{service.name}</span>
                            <span className="text-gray-500 text-xs whitespace-nowrap">{service.count} bookings</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                i === 0 ? 'bg-primary-600' : i === 1 ? 'bg-primary-400' : 'bg-primary-200'
                              }`}
                              style={{
                                width: `${Math.max(
                                  (service.count / (analytics.topServices[0]?.count || 1)) * 100,
                                  8
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No service data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Pipeline */}
        {analytics && analytics.bookingsByStatus.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ArrowRight className="mr-2 h-5 w-5" />
                Booking Pipeline
              </h3>
            </div>
            <div className="p-6">
              {(() => {
                const pipelineStatuses = ['pending', 'confirmed', 'assigned', 'in-progress', 'completed'];
                const statusLabels: Record<string, string> = {
                  pending: 'Pending',
                  confirmed: 'Confirmed',
                  assigned: 'Assigned',
                  'in-progress': 'In Progress',
                  completed: 'Completed',
                };
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-400',
                  confirmed: 'bg-blue-400',
                  assigned: 'bg-purple-400',
                  'in-progress': 'bg-indigo-400',
                  completed: 'bg-green-400',
                };
                const statusBgLight: Record<string, string> = {
                  pending: 'bg-yellow-50 border-yellow-200',
                  confirmed: 'bg-blue-50 border-blue-200',
                  assigned: 'bg-purple-50 border-purple-200',
                  'in-progress': 'bg-indigo-50 border-indigo-200',
                  completed: 'bg-green-50 border-green-200',
                };
                const statusTextColor: Record<string, string> = {
                  pending: 'text-yellow-800',
                  confirmed: 'text-blue-800',
                  assigned: 'text-purple-800',
                  'in-progress': 'text-indigo-800',
                  completed: 'text-green-800',
                };

                const statusMap: Record<string, number> = {};
                analytics.bookingsByStatus.forEach((s) => {
                  statusMap[s.status] = s.count;
                });

                const maxCount = Math.max(...pipelineStatuses.map((s) => statusMap[s] || 0), 1);

                return (
                  <div className="flex items-end gap-3">
                    {pipelineStatuses.map((status, i) => {
                      const count = statusMap[status] || 0;
                      const barHeight = Math.max((count / maxCount) * 100, 8);
                      return (
                        <div key={status} className="flex-1 flex flex-col items-center">
                          <div
                            className={`border rounded-lg p-3 w-full text-center mb-2 ${statusBgLight[status]}`}
                          >
                            <div className={`text-2xl font-bold ${statusTextColor[status]}`}>
                              {count}
                            </div>
                            <div className={`text-xs font-medium ${statusTextColor[status]} mt-0.5`}>
                              {statusLabels[status]}
                            </div>
                          </div>
                          <div className="w-full h-20 flex items-end">
                            <div
                              className={`w-full rounded-t ${statusColors[status]} transition-all`}
                              style={{ height: `${barHeight}%`, minHeight: '4px' }}
                            />
                          </div>
                          {i < pipelineStatuses.length - 1 && (
                            <div className="hidden" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Bookings this month: {analytics.bookingsThisMonth}</span>
                <span>Last month: {analytics.bookingsLastMonth}</span>
              </div>
            </div>
          </div>
        )}

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
