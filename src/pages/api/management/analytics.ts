import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/analytics');

interface RevenueByMonth {
  month: string;
  revenue: number;
}

interface BookingsByStatus {
  status: string;
  count: number;
}

interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
}

interface TopService {
  name: string;
  count: number;
  revenue: number;
}

interface TopCity {
  city: string;
  count: number;
}

interface TechnicianStat {
  name: string;
  completedBookings: number;
  rating: number;
}

interface AnalyticsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueByMonth: RevenueByMonth[];
  totalBookings: number;
  bookingsByStatus: BookingsByStatus[];
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  topServices: TopService[];
  topCities: TopCity[];
  technicianStats: TechnicianStat[];
}

interface ApiResponse {
  success: boolean;
  analytics?: AnalyticsData;
  error?: string;
}

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  const supabase = getServiceSupabase();

  try {
    apiLogger.info('Fetching analytics data');

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    // Run all queries in parallel for performance
    const [
      paymentsResult,
      bookingsResult,
      techniciansResult,
    ] = await Promise.all([
      // All payments
      supabase
        .from('payments')
        .select('id, amount, payment_method, status, processed_at, created_at, booking_id')
        .order('created_at', { ascending: false }),

      // All bookings with service and location info
      supabase
        .from('bookings')
        .select(
          'id, status, final_price, quoted_price, created_at, service_id, city, technician_id, services:service_id(name, display_name)'
        )
        .order('created_at', { ascending: false }),

      // Technicians with stats
      supabase
        .from('technicians')
        .select('id, full_name, total_bookings_completed, is_active')
        .eq('is_active', true),
    ]);

    if (paymentsResult.error) {
      apiLogger.error('Error fetching payments for analytics', { error: paymentsResult.error });
    }
    if (bookingsResult.error) {
      apiLogger.error('Error fetching bookings for analytics', { error: bookingsResult.error });
    }
    if (techniciansResult.error) {
      apiLogger.error('Error fetching technicians for analytics', { error: techniciansResult.error });
    }

    const payments = (paymentsResult.data || []) as Array<{
      id: string;
      amount: number;
      payment_method: string;
      status: string;
      processed_at: string | null;
      created_at: string;
      booking_id: string;
    }>;

    const bookings = (bookingsResult.data || []) as unknown as Array<{
      id: string;
      status: string;
      final_price: number | null;
      quoted_price: number | null;
      created_at: string;
      service_id: string;
      city: string | null;
      technician_id: string | null;
      services: { name: string; display_name: string } | null;
    }>;

    const technicians = (techniciansResult.data || []) as Array<{
      id: string;
      full_name: string;
      total_bookings_completed: number | null;
      is_active: boolean;
    }>;

    // --- Revenue calculations (from completed bookings, not payments) ---
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const completedPayments = payments.filter((p) => p.status === 'completed');

    const getBookingRevenue = (b: { final_price: number | null; quoted_price: number | null }) =>
      parseFloat(String(b.final_price ?? b.quoted_price ?? 0)) || 0;

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + getBookingRevenue(b),
      0
    );

    const thisMonthRevenue = completedBookings
      .filter((b) => b.created_at >= thisMonthStart)
      .reduce((sum, b) => sum + getBookingRevenue(b), 0);

    const lastMonthRevenue = completedBookings
      .filter((b) => b.created_at >= lastMonthStart && b.created_at <= lastMonthEnd)
      .reduce((sum, b) => sum + getBookingRevenue(b), 0);

    // Revenue by month (last 6 months)
    const revenueByMonth: RevenueByMonth[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = monthDate.toISOString();
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const monthLabel = monthDate.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
      });

      const monthRevenue = completedBookings
        .filter((b) => b.created_at >= monthStart && b.created_at <= monthEnd)
        .reduce((sum, b) => sum + getBookingRevenue(b), 0);

      revenueByMonth.push({ month: monthLabel, revenue: Math.round(monthRevenue * 100) / 100 });
    }

    // --- Booking calculations ---
    const totalBookings = bookings.length;

    const statusCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      const s = b.status || 'unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const bookingsByStatus: BookingsByStatus[] = Object.entries(statusCounts).map(
      ([status, count]) => ({ status, count })
    );

    const bookingsThisMonth = bookings.filter(
      (b) => b.created_at >= thisMonthStart
    ).length;

    const bookingsLastMonth = bookings.filter(
      (b) => b.created_at >= lastMonthStart && b.created_at <= lastMonthEnd
    ).length;

    // --- Payment method breakdown ---
    const methodStats: Record<string, { count: number; total: number }> = {};
    completedPayments.forEach((p) => {
      const m = p.payment_method || 'unknown';
      if (!methodStats[m]) {
        methodStats[m] = { count: 0, total: 0 };
      }
      methodStats[m].count += 1;
      methodStats[m].total += parseFloat(String(p.amount)) || 0;
    });

    const paymentMethodBreakdown: PaymentMethodBreakdown[] = Object.entries(methodStats)
      .map(([method, data]) => ({
        method,
        count: data.count,
        total: Math.round(data.total * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total);

    // --- Top services ---
    // Build a map of booking_id → payment amount for revenue lookup
    const paymentByBooking: Record<string, number> = {};
    completedPayments.forEach((p) => {
      paymentByBooking[p.booking_id] = parseFloat(String(p.amount)) || 0;
    });

    const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const serviceName =
        (b.services as any)?.display_name || (b.services as any)?.name || 'Unknown';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { name: serviceName, count: 0, revenue: 0 };
      }
      serviceStats[serviceName].count += 1;

      // Use payment amount if available, fallback to booking price
      const revenue =
        paymentByBooking[b.id] ??
        (b.final_price != null ? parseFloat(String(b.final_price)) : null) ??
        (b.quoted_price != null ? parseFloat(String(b.quoted_price)) : null) ??
        0;
      serviceStats[serviceName].revenue += revenue;
    });

    const topServices: TopService[] = Object.values(serviceStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((s) => ({ ...s, revenue: Math.round(s.revenue * 100) / 100 }));

    // --- Top cities ---
    const cityStats: Record<string, number> = {};
    bookings.forEach((b) => {
      const city = b.city || 'Unknown';
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    const topCities: TopCity[] = Object.entries(cityStats)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- Technician stats ---
    const technicianStats: TechnicianStat[] = technicians.map((t) => ({
      name: t.full_name,
      completedBookings: t.total_bookings_completed || 0,
      rating: 5.0,
    }));

    const analytics: AnalyticsData = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
      lastMonthRevenue: Math.round(lastMonthRevenue * 100) / 100,
      revenueByMonth,
      totalBookings,
      bookingsByStatus,
      bookingsThisMonth,
      bookingsLastMonth,
      paymentMethodBreakdown,
      topServices,
      topCities,
      technicianStats,
    };

    apiLogger.info('Analytics data compiled successfully');

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    apiLogger.error('Error compiling analytics', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to compile analytics data',
    });
  }
});
