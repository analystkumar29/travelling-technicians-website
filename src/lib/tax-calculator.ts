/**
 * BC Tax Calculator for Travelling Technicians
 * GST (5%) + PST (7%) = 12% combined
 */

export interface TaxBreakdown {
  subtotal: number;
  gstRate: number;
  pstRate: number;
  gstAmount: number;
  pstAmount: number;
  totalTax: number;
  total: number;
  province: string;
}

const TAX_RATES: Record<string, { gst: number; pst: number }> = {
  BC: { gst: 0.05, pst: 0.07 },
  // Add other provinces as needed
};

/**
 * Calculate GST + PST tax breakdown for a given subtotal
 */
export function calculateTax(subtotal: number, province = 'BC'): TaxBreakdown {
  const rates = TAX_RATES[province] || TAX_RATES.BC;
  const gstAmount = Math.round(subtotal * rates.gst * 100) / 100;
  const pstAmount = Math.round(subtotal * rates.pst * 100) / 100;
  const totalTax = Math.round((gstAmount + pstAmount) * 100) / 100;

  return {
    subtotal,
    gstRate: rates.gst,
    pstRate: rates.pst,
    gstAmount,
    pstAmount,
    totalTax,
    total: Math.round((subtotal + totalTax) * 100) / 100,
    province,
  };
}

/**
 * Convert a dollar amount to Stripe cents (integer)
 */
export function toStripeCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format a dollar amount for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
