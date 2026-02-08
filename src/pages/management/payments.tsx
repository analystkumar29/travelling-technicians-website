import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import { authFetch } from '@/utils/auth';
import { toast } from 'sonner';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit2,
  ExternalLink,
  Banknote,
  Smartphone,
  Send,
} from 'lucide-react';
import Link from 'next/link';

interface PaymentBooking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_email: string;
  status: string;
  final_price: number | null;
  quoted_price: number | null;
  device_models: { name: string } | null;
  services: { name: string; display_name: string } | null;
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  currency: string;
  bookings?: PaymentBooking;
}

interface BookingLookup {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_email: string;
  status: string;
  final_price: number | null;
  quoted_price: number | null;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'etransfer', label: 'E-Transfer' },
  { value: 'paypal', label: 'PayPal' },
] as const;

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const;

const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-green-100 text-green-800',
  debit: 'bg-blue-100 text-blue-800',
  credit: 'bg-purple-100 text-purple-800',
  etransfer: 'bg-amber-100 text-amber-800',
  paypal: 'bg-indigo-100 text-indigo-800',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  cash: Banknote,
  debit: CreditCard,
  credit: CreditCard,
  etransfer: Send,
  paypal: Smartphone,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Record Payment form state
  const [searchRef, setSearchRef] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundBooking, setFoundBooking] = useState<BookingLookup | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('cash');
  const [formTransactionId, setFormTransactionId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Edit state
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/management/payments';
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterMethod !== 'all') params.set('payment_method', filterMethod);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await authFetch(url);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMethod]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchPayments();
    }
  }, [fetchPayments]);

  // Computed stats
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonthRevenue = completedPayments
    .filter((p) => p.created_at >= thisMonthStart)
    .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  const lookupBooking = async () => {
    if (!searchRef.trim()) return;
    setSearching(true);
    setBookingError('');
    setFoundBooking(null);

    try {
      const response = await authFetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      const bookings: BookingLookup[] = data.bookings || [];

      const match = bookings.find(
        (b) => b.booking_ref?.toLowerCase() === searchRef.trim().toLowerCase()
      );

      if (!match) {
        setBookingError('No booking found with that reference');
        return;
      }

      setFoundBooking(match);
      // Pre-fill amount from booking price
      const price = match.final_price ?? match.quoted_price;
      if (price != null) {
        setFormAmount(String(price));
      }
    } catch (err) {
      setBookingError('Failed to look up booking');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundBooking) {
      toast.error('Please look up a booking first');
      return;
    }
    if (!formAmount || parseFloat(formAmount) < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authFetch('/api/management/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: foundBooking.id,
          amount: parseFloat(formAmount),
          payment_method: formMethod,
          transaction_id: formTransactionId || undefined,
          notes: formNotes || undefined,
          status: 'completed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to record payment');
        return;
      }

      toast.success('Payment recorded successfully');
      resetForm();
      fetchPayments();
    } catch (err) {
      console.error('Error recording payment:', err);
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchRef('');
    setFoundBooking(null);
    setBookingError('');
    setFormAmount('');
    setFormMethod('cash');
    setFormTransactionId('');
    setFormNotes('');
    setFormOpen(false);
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await authFetch(`/api/management/payments?id=${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to update payment');
        return;
      }

      toast.success('Payment status updated');
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      console.error('Error updating payment:', err);
      toast.error('Failed to update payment');
    }
  };

  const formatCurrency = (amount: number, currency = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout title="Payments">
      <div className="space-y-8">
        <AdminPageHeader
          title="Payments"
          description="Record payments and track revenue."
          actions={
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="inline-flex items-center px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            color="green"
            trend={`${completedPayments.length} completed payments`}
          />
          <AdminStatsCard
            label="This Month"
            value={formatCurrency(thisMonthRevenue)}
            icon={TrendingUp}
            color="blue"
          />
          <AdminStatsCard
            label="Payments Recorded"
            value={String(payments.length)}
            icon={CreditCard}
            color="purple"
          />
          <AdminStatsCard
            label="Pending Payments"
            value={String(pendingCount)}
            icon={AlertCircle}
            color={pendingCount > 0 ? 'amber' : 'green'}
            trend={pendingCount > 0 ? 'Requires attention' : 'All clear'}
          />
        </div>

        {/* Record Payment Form (collapsible) */}
        {formOpen && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="flex items-center justify-between w-full px-6 py-4 border-b border-gray-200 text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Record Payment
              </h3>
              {formOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
              {/* Booking Reference Lookup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Reference
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    placeholder="e.g. TEC-123"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        lookupBooking();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={lookupBooking}
                    disabled={searching || !searchRef.trim()}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Look up</span>
                  </button>
                </div>
                {bookingError && (
                  <p className="mt-1 text-sm text-red-600">{bookingError}</p>
                )}

                {foundBooking && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="font-medium text-blue-900">
                      {foundBooking.booking_ref} -- {foundBooking.customer_name}
                    </div>
                    <div className="text-blue-700 mt-1">
                      {foundBooking.customer_email} | Status: {foundBooking.status}
                    </div>
                    {(foundBooking.final_price || foundBooking.quoted_price) && (
                      <div className="text-blue-700 mt-1">
                        Price:{' '}
                        {formatCurrency(
                          foundBooking.final_price ?? foundBooking.quoted_price ?? 0
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID (optional)
                </label>
                <input
                  type="text"
                  value={formTransactionId}
                  onChange={(e) => setFormTransactionId(e.target.value)}
                  placeholder="e.g. TXN-12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes about this payment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !foundBooking}
                  className="inline-flex items-center px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No payments found</p>
              <p className="text-sm mt-1">Record a payment to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Booking</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const MethodIcon = METHOD_ICONS[payment.payment_method] || CreditCard;
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className="font-mono text-primary-700">
                            {payment.bookings?.booking_ref || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {payment.bookings?.customer_name || '--'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              METHOD_COLORS[payment.payment_method] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <MethodIcon className="h-3 w-3" />
                            {PAYMENT_METHODS.find((m) => m.value === payment.payment_method)?.label ||
                              payment.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingPayment === payment.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleUpdateStatus(payment.id, editStatus)}
                                className="px-2 py-1 bg-primary-800 text-white rounded text-xs hover:bg-primary-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPayment(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {editingPayment !== payment.id && (
                              <button
                                onClick={() => {
                                  setEditingPayment(payment.id);
                                  setEditStatus(payment.status);
                                }}
                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                                title="Edit status"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {payment.bookings?.booking_ref && (
                              <Link
                                href="/management/bookings"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                                title="View booking"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
