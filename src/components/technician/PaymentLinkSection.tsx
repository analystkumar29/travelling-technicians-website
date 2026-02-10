/**
 * PaymentLinkSection — shown on technician job detail page
 * for completed+unpaid bookings. Allows sending payment links
 * via email or WhatsApp.
 */

import { useState } from 'react';
import { techFetch } from '@/utils/technicianAuth';
import { DollarSign, Send, Copy, MessageCircle, Loader2, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentLinkSectionProps {
  bookingId: string;
  bookingRef: string;
  paymentStatus: string;
  existingPaymentUrl?: string;
}

export default function PaymentLinkSection({
  bookingId,
  bookingRef,
  paymentStatus,
  existingPaymentUrl,
}: PaymentLinkSectionProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(existingPaymentUrl || '');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [sent, setSent] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  if (paymentStatus === 'paid') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">Payment Received</span>
        </div>
      </div>
    );
  }

  const sendPaymentLink = async () => {
    setLoading(true);
    try {
      const res = await techFetch('/api/stripe/send-payment-link', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, send_email: true }),
      });
      const data = await res.json();

      if (res.ok) {
        setPaymentUrl(data.url);
        setWhatsappUrl(data.whatsapp_url || '');
        setTotal(data.total || null);
        setSent(true);
        toast.success('Payment link sent!');
      } else {
        toast.error(data.error || 'Failed to send payment link');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-primary-600" />
        <h2 className="font-semibold text-gray-900">Payment</h2>
        {paymentStatus === 'pending' && (
          <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
            Pending
          </span>
        )}
      </div>

      {!sent && !paymentUrl ? (
        <button
          onClick={sendPaymentLink}
          disabled={loading}
          className="w-full py-3 bg-accent-500 text-primary-900 font-bold rounded-xl text-sm hover:bg-accent-400 active:bg-accent-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send Payment Link
        </button>
      ) : (
        <div className="space-y-3">
          {/* Success banner */}
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <Check className="h-4 w-4" />
            Payment link {sent ? 'sent to customer' : 'ready'}
            {total && <span className="ml-auto font-semibold">${total.toFixed(2)}</span>}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Link
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-green-500 text-white font-medium rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            ) : null}
          </div>

          {/* Open payment page link */}
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-primary-600 hover:text-primary-800 underline"
          >
            Open payment page <ExternalLink className="h-3 w-3 inline ml-0.5" />
          </a>
        </div>
      )}
    </div>
  );
}
