import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaTools, 
  FaShieldAlt, 
  FaDollarSign,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

interface DashboardStats {
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
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  status: string;
  created_at: string;
  issue_description?: string;
}

interface UpcomingAppointment {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchUpcomingAppointments()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status, created_at, booking_date');

    if (bookingsError) throw bookingsError;

    const { data: warranties, error: warrantiesError } = await supabase
      .from('warranties')
      .select('status');

    if (warrantiesError) throw warrantiesError;

    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totalBookings = bookings?.length || 0;
    const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
    const todayBookings = bookings?.filter(b => b.booking_date === today).length || 0;
    
    const totalWarranties = warranties?.length || 0;
    const activeWarranties = warranties?.filter(w => w.status === 'active').length || 0;

    // Estimate revenue (you can make this more accurate with actual pricing data)
    const thisWeekBookings = bookings?.filter(b => 
      b.created_at >= oneWeekAgo && b.status === 'completed'
    ).length || 0;
    const thisWeekRevenue = thisWeekBookings * 120; // Average repair cost estimate

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
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    setRecentBookings(data || []);
  };

  const fetchUpcomingAppointments = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('booking_date', today)
      .in('status', ['confirmed', 'pending'])
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })
      .limit(5);

    if (error) throw error;
    setUpcomingAppointments(data || []);
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert('Error updating status: ' + error.message);
      } else {
        // Refresh data
        await fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (bookingDate: string) => {
    const today = new Date();
    const appointmentDate = new Date(bookingDate);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'border-l-4 border-red-500 bg-red-50';
    if (diffDays === 1) return 'border-l-4 border-orange-500 bg-orange-50';
    if (diffDays <= 2) return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-green-500 bg-green-50';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your business today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-yellow-600 font-medium">{stats.pendingBookings} pending</span>
                  <span className="text-gray-500"> • </span>
                  <span className="text-blue-600 font-medium">{stats.confirmedBookings} confirmed</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaClock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.todayBookings}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/admin/bookings" className="text-orange-600 hover:text-orange-900 font-medium">
                    View all appointments →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Warranties</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeWarranties}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/admin/warranties" className="text-green-600 hover:text-green-900 font-medium">
                    Manage warranties →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaDollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Week Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.thisWeekRevenue}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-gray-500">{stats.completedBookings} completed repairs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaClock className="mr-2" />
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
                    <div key={appointment.id} className={`px-6 py-4 ${getUrgencyColor(appointment.booking_date)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {appointment.reference_number}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>{appointment.customer_name}</strong> - {appointment.device_brand} {appointment.device_model}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            {appointment.service_type}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {appointment.booking_date} at {appointment.booking_time}
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-1" />
                              {appointment.address}
                            </div>
                            <div className="flex items-center">
                              <FaPhone className="mr-1" />
                              {appointment.customer_phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(appointment.id, 'confirmed')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(appointment.id, 'in_progress')}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Start Repair
                          </button>
                        )}
                        <Link
                          href={`/admin/bookings`}
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
                  <FaTools className="mr-2" />
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
                          {booking.reference_number}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>{booking.customer_name}</strong> - {booking.device_brand} {booking.device_model}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {booking.service_type}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`tel:${booking.customer_phone}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Call customer"
                          >
                            <FaPhone />
                          </a>
                          <a 
                            href={`mailto:${booking.customer_email}`}
                            className="text-green-600 hover:text-green-800"
                            title="Email customer"
                          >
                            <FaEnvelope />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-6 py-3 bg-gray-50">
                <Link 
                  href="/admin/bookings"
                  className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                >
                  View all bookings →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/admin/bookings"
                  className="flex items-center justify-center px-4 py-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="text-center">
                    <FaCalendarAlt className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-blue-900">Manage Bookings</p>
                  </div>
                </Link>
                
                <Link
                  href="/admin/warranties"
                  className="flex items-center justify-center px-4 py-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="text-center">
                    <FaShieldAlt className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-900">View Warranties</p>
                  </div>
                </Link>

                <Link
                  href="/book-online"
                  className="flex items-center justify-center px-4 py-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="text-center">
                    <FaTools className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-purple-900">New Booking</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 