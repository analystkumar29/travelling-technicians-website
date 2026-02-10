/**
 * Stripe server-side client singleton + customer management
 */

import Stripe from 'stripe';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const stripeLogger = logger.createModuleLogger('stripe');

let stripeInstance: Stripe | null = null;

/**
 * Get the singleton Stripe server-side client
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Get or create a Stripe customer for a given email.
 * Saves stripe_customer_id to customer_profiles on first creation.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  phone?: string,
  existingStripeId?: string | null
): Promise<string> {
  const stripe = getStripe();
  const supabase = getServiceSupabase();

  // If we already have a Stripe customer ID, verify it's still valid
  if (existingStripeId) {
    try {
      const customer = await stripe.customers.retrieve(existingStripeId);
      if (!customer.deleted) {
        return existingStripeId;
      }
    } catch {
      stripeLogger.warn('Existing Stripe customer not found, creating new', {
        stripeId: existingStripeId,
      });
    }
  }

  // Check if customer_profiles has a stripe_customer_id for this email
  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('id, stripe_customer_id')
    .eq('email', email)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      if (!customer.deleted) {
        return profile.stripe_customer_id;
      }
    } catch {
      // Customer was deleted in Stripe, create a new one
    }
  }

  // Search Stripe for existing customer by email
  const existingCustomers = await stripe.customers.list({ email, limit: 1 });
  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;
    // Save to profile if we have one
    if (profile) {
      await supabase
        .from('customer_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.id);
    }
    return customerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    phone: phone || undefined,
    metadata: { source: 'travelling-technicians' },
  });

  stripeLogger.info('Created new Stripe customer', { customerId: customer.id, email });

  // Save to customer_profiles if we have a matching profile
  if (profile) {
    await supabase
      .from('customer_profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', profile.id);
  }

  return customer.id;
}

/**
 * Get the base URL for callbacks (success/cancel URLs)
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return 'https://www.travelling-technicians.ca';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
