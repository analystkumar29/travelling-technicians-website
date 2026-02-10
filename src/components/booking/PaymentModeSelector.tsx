/**
 * PaymentModeSelector — Pay Now (Stripe) vs Pay After Repair toggle
 * Renders a tax breakdown when "Pay Now" is selected.
 */

import { CreditCard, Banknote } from 'lucide-react';
import { calculateTax, formatCurrency } from '@/lib/tax-calculator';

interface PaymentModeSelectorProps {
  paymentMode: 'pay-later' | 'upfront';
  onSelect: (mode: 'pay-later' | 'upfront') => void;
  quotedPrice: number | undefined;
  province?: string;
}

export default function PaymentModeSelector({
  paymentMode,
  onSelect,
  quotedPrice,
  province = 'BC',
}: PaymentModeSelectorProps) {
  const tax = quotedPrice ? calculateTax(quotedPrice, province) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary-900">Payment Method</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pay After Repair */}
        <button
          type="button"
          onClick={() => onSelect('pay-later')}
          className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            paymentMode === 'pay-later'
              ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <Banknote className={`h-6 w-6 mb-2 ${paymentMode === 'pay-later' ? 'text-primary-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${paymentMode === 'pay-later' ? 'text-primary-900' : 'text-gray-700'}`}>
            Pay After Repair
          </span>
          <span className="text-xs text-gray-500 mt-1 text-center">
            Pay the technician directly after your repair
          </span>
          {paymentMode === 'pay-later' && (
            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Pay Now */}
        <button
          type="button"
          onClick={() => onSelect('upfront')}
          className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            paymentMode === 'upfront'
              ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <CreditCard className={`h-6 w-6 mb-2 ${paymentMode === 'upfront' ? 'text-primary-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${paymentMode === 'upfront' ? 'text-primary-900' : 'text-gray-700'}`}>
            Pay Now
          </span>
          <span className="text-xs text-gray-500 mt-1 text-center">
            Secure online payment via Stripe
          </span>
          {paymentMode === 'upfront' && (
            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Tax breakdown when Pay Now is selected */}
      {paymentMode === 'upfront' && tax && (
        <div className="glass-surface-light rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-primary-700">
            <span>Subtotal</span>
            <span>{formatCurrency(tax.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-primary-500">
            <span>GST (5%)</span>
            <span>{formatCurrency(tax.gstAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-primary-500">
            <span>BC PST (7%)</span>
            <span>{formatCurrency(tax.pstAmount)}</span>
          </div>
          <div className="border-t border-primary-200/50 pt-2 flex justify-between text-base font-semibold text-primary-900">
            <span>Total</span>
            <span>{formatCurrency(tax.total)}</span>
          </div>
          <p className="text-xs text-primary-500 mt-1">
            You&apos;ll be redirected to Stripe&apos;s secure checkout page.
          </p>
        </div>
      )}
    </div>
  );
}
