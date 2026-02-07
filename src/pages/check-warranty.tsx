import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { Shield, ShieldCheck, Calendar, Wrench, Phone, Search, AlertCircle } from 'lucide-react';

type LookupMode = 'warranty' | 'booking';

interface WarrantyResult {
  warranty: {
    warranty_number: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    status: 'active' | 'expired' | 'void' | 'claimed';
    days_remaining: number;
  };
  booking: {
    booking_ref: string;
    device_name: string;
    service_name: string;
    completed_at: string | null;
  };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' },
  void: { bg: 'bg-red-100', text: 'text-red-800', label: 'Void' },
  claimed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Claimed' },
};

export default function CheckWarranty() {
  const [mode, setMode] = useState<LookupMode>('warranty');
  const [email, setEmail] = useState('');
  const [warrantyNumber, setWarrantyNumber] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'warranty' && !warrantyNumber) {
      setError('Please enter your warranty number.');
      return;
    }

    if (mode === 'booking' && !bookingRef) {
      setError('Please enter your booking reference.');
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, string> = { email };
      if (mode === 'warranty') {
        body.warranty_number = warrantyNumber;
      } else {
        body.booking_ref = bookingRef;
      }

      const res = await fetch('/api/warranties/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError('Too many requests. Please wait a minute and try again.');
      } else if (!res.ok || !data.success) {
        setError(data.message || 'No warranty found. Please check your details and try again.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <Layout
      title="Check Warranty Status | The Travelling Technicians"
      metaDescription="Look up your repair warranty status. Enter your warranty number or booking reference to check coverage details."
    >
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Shield className="w-8 h-8 text-primary-700" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary-900 mb-3">
            Check Your Warranty Status
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter your warranty number or booking reference along with your email to view your warranty coverage.
          </p>
        </div>

        {/* Lookup Form */}
        {!result && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-6 sm:p-8">
              {/* Tab Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('warranty'); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    mode === 'warranty'
                      ? 'bg-white text-primary-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Warranty Number
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('booking'); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    mode === 'booking'
                      ? 'bg-white text-primary-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Booking Reference
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="The email used for your booking"
                  />
                </div>

                {mode === 'warranty' ? (
                  <div>
                    <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Number
                    </label>
                    <input
                      type="text"
                      id="warranty"
                      value={warrantyNumber}
                      onChange={(e) => setWarrantyNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                      placeholder="e.g. WT-260207-A1B2C3D4"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="bookingRef" className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Reference
                    </label>
                    <input
                      type="text"
                      id="bookingRef"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                      placeholder="e.g. TEC-12345"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check Warranty
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-6 sm:p-8">
              {/* Status Badge + Warranty Number */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
                  <ShieldCheck className="w-7 h-7 text-green-600" />
                </div>
                <div className="mb-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    STATUS_STYLES[result.warranty.status]?.bg || 'bg-gray-100'
                  } ${STATUS_STYLES[result.warranty.status]?.text || 'text-gray-800'}`}>
                    {STATUS_STYLES[result.warranty.status]?.label || result.warranty.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Warranty Number</p>
                <p className="text-2xl font-mono font-bold text-primary-900">
                  {result.warranty.warranty_number}
                </p>
              </div>

              {/* Days Remaining Progress Bar */}
              {result.warranty.status === 'active' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Coverage Remaining</span>
                    <span className="font-semibold text-primary-900">
                      {result.warranty.days_remaining} of {result.warranty.duration_days} days
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${Math.round((result.warranty.days_remaining / result.warranty.duration_days) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 w-24">Valid From</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(result.warranty.start_date).toLocaleDateString('en-CA', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 w-24">Valid Until</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(result.warranty.end_date).toLocaleDateString('en-CA', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 w-24">Device</span>
                  <span className="text-sm font-medium text-gray-900">{result.booking.device_name}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 w-24">Service</span>
                  <span className="text-sm font-medium text-gray-900">{result.booking.service_name}</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 w-24">Booking Ref</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{result.booking.booking_ref}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 bg-primary-50 rounded-lg text-center">
                <p className="text-sm text-primary-800">
                  Need to file a warranty claim? Call us at{' '}
                  <a href="tel:+16048495329" className="font-semibold text-primary-900 hover:underline">
                    (604) 849-5329
                  </a>
                </p>
              </div>

              {/* Try Again */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleReset}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Look up another warranty
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-heading font-bold text-primary-900">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm border border-gray-200 group">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 flex items-center justify-between">
                What does my warranty cover?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600">
                Your warranty covers defects in parts used during the repair, workmanship issues related to the service performed, and the same issue recurring within the warranty period. It does not cover new damage, water damage, software issues, or unrelated hardware problems.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 group">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 flex items-center justify-between">
                How do I file a warranty claim?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600">
                Call us at <a href="tel:+16048495329" className="text-primary-700 font-medium hover:underline">(604) 849-5329</a> or{' '}
                <Link href="/contact" className="text-primary-700 font-medium hover:underline">contact us online</Link>.
                Have your warranty number ready. We&apos;ll arrange a free re-repair or replacement of the affected component.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 group">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 flex items-center justify-between">
                My warranty has expired. What now?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600">
                If your warranty has expired, we still offer competitive rates for repeat customers.{' '}
                <Link href="/book-online" className="text-primary-700 font-medium hover:underline">Book a new repair</Link>{' '}
                and mention your previous booking for a loyalty discount.
              </div>
            </details>
          </div>
        </div>
      </div>
    </Layout>
  );
}
