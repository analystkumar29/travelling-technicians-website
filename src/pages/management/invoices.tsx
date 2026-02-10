/**
 * Admin Invoice Management Page
 * Lists all invoices with filters, PDF download links, and Stripe Dashboard links.
 */

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { authFetch, handleAuthError } from '@/utils/auth';
import { toast } from 'sonner';
import {
  FileText, Download, ExternalLink, Search, Filter, RefreshCw, Loader2
} from 'lucide-react';

interface Invoice {
  id: string;
  booking_id: string;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  stripe_invoice_pdf: string | null;
  invoice_number: string | null;
  subtotal: number;
  gst_amount: number;
  pst_amount: number;
  total: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  issued_at: string | null;
  paid_at: string | null;
  created_at: string;
  bookings?: {
    booking_ref: string;
    status: string;
  };
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/management/invoices');
      if (!res.ok) {
        handleAuthError(res);
        return;
      }
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (inv.invoice_number?.toLowerCase().includes(q)) ||
        (inv.customer_name?.toLowerCase().includes(q)) ||
        (inv.customer_email?.toLowerCase().includes(q)) ||
        (inv.bookings?.booking_ref?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      void: 'bg-red-100 text-red-800',
      uncollectible: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout title="Invoices">
      <AdminPageHeader
        title="Invoices"
        description={`${invoices.length} total invoices`}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer, or booking ref..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="void">Void</option>
          </select>
          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PST</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {inv.invoice_number || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary-600 font-medium">
                      {inv.bookings?.booking_ref || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{inv.customer_name || '—'}</div>
                      <div className="text-xs text-gray-500">{inv.customer_email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      ${Number(inv.subtotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      ${Number(inv.gst_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      ${Number(inv.pst_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      ${Number(inv.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {statusBadge(inv.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {inv.stripe_invoice_pdf && (
                          <a
                            href={inv.stripe_invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        {inv.stripe_invoice_url && (
                          <a
                            href={inv.stripe_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-700"
                            title="View Invoice"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
