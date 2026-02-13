/**
 * Phone number formatting utilities
 * Converts between different phone number formats
 */

export interface PhoneNumber {
  /** E.164 format: +16048495329 */
  e164: string;
  /** Display format: (604) 849-5329 */
  display: string;
  /** tel: href format: tel:+16048495329 */
  href: string;
  /** Raw input format */
  raw: string;
}

/**
 * Parse and normalize a phone number string
 * Supports various input formats:
 * - +16048495329
 * - 604-849-5329
 * - (604) 849-5329
 * - 6048495329
 * - +1-604-849-5329
 */
export function parsePhoneNumber(input: string): PhoneNumber {
  if (!input || input.trim() === '') {
    throw new Error('Phone number input cannot be empty');
  }

  // Remove all non-digit characters except leading +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // Ensure we have a valid North American number
  let e164: string;
  
  if (cleaned.startsWith('+1')) {
    // Already in E.164 format with country code
    e164 = cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    // 1-604-849-5329 format
    e164 = `+${cleaned}`;
  } else if (cleaned.length === 10) {
    // 6048495329 format (no country code)
    e164 = `+1${cleaned}`;
  } else {
    // Try to parse as is
    e164 = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  // Validate E.164 format
  if (!/^\+\d{10,15}$/.test(e164)) {
    throw new Error(`Invalid phone number format: ${input}. Could not parse to E.164: ${e164}`);
  }

  // Extract area code and number for display formatting
  const match = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (!match) {
    // If not standard North American format, use raw for display
    return {
      e164,
      display: input, // Keep original format for display
      href: `tel:${e164}`,
      raw: input
    };
  }

  const [, areaCode, prefix, lineNumber] = match;
  const display = `(${areaCode}) ${prefix}-${lineNumber}`;
  
  return {
    e164,
    display,
    href: `tel:${e164}`,
    raw: input
  };
}

/**
 * Format a phone number for display
 * Defaults to North American format: (604) 849-5329
 */
export function formatPhoneNumberForDisplay(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed.display;
  } catch {
    // Fallback to original input if parsing fails
    return phone;
  }
}

/**
 * Format a phone number for tel: href
 * Returns tel:+16048495329
 */
export function formatPhoneNumberForHref(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed.href;
  } catch {
    // Fallback to original input if parsing fails
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  }
}

/**
 * Extract area code from phone number
 */
export function extractAreaCode(phone: string): string | null {
  try {
    const parsed = parsePhoneNumber(phone);
    const match = parsed.e164.match(/^\+1(\d{3})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if two phone numbers are equivalent (ignoring formatting)
 */
export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  try {
    const parsed1 = parsePhoneNumber(phone1);
    const parsed2 = parsePhoneNumber(phone2);
    return parsed1.e164 === parsed2.e164;
  } catch {
    // If parsing fails, compare cleaned versions
    const clean1 = phone1.replace(/[^\d+]/g, '');
    const clean2 = phone2.replace(/[^\d+]/g, '');
    return clean1 === clean2;
  }
}

/**
 * Default fallback phone number for development/testing
 */
export const DEFAULT_PHONE_NUMBER = '+16048495329';
export const DEFAULT_PHONE_DISPLAY = '(604) 849-5329';
export const DEFAULT_PHONE_HREF = 'tel:+16048495329';

/**
 * Get default phone number object
 */
export function getDefaultPhoneNumber(): PhoneNumber {
  return parsePhoneNumber(DEFAULT_PHONE_NUMBER);
}

