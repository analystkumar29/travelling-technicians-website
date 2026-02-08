import crypto from 'crypto';

const SECRET = process.env.BOOKING_VERIFICATION_SECRET;

/**
 * Generate a deterministic HMAC-SHA256 review token for a booking.
 * No expiry — customers may leave reviews weeks after repair.
 */
export function generateReviewToken(bookingRef: string, email: string): string {
  if (!SECRET) {
    throw new Error('BOOKING_VERIFICATION_SECRET is required');
  }
  const data = `${bookingRef}:${email.toLowerCase().trim()}:review`;
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

/**
 * Verify a review token using timing-safe comparison.
 */
export function verifyReviewToken(token: string, bookingRef: string, email: string): boolean {
  if (!SECRET) return false;
  const expected = generateReviewToken(bookingRef, email);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
