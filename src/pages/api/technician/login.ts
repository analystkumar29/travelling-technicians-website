import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { generateTechnicianToken } from '@/middleware/technicianAuth';
import { logger } from '@/utils/logger';

const authLogger = logger.createModuleLogger('TechnicianLogin');

// Rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function hashPin(pin: string, salt: string): string {
  return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIP = req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    'unknown';

  // Rate limit check
  const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
  if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  if (attempts.count >= 5) {
    return res.status(429).json({ error: 'Too many failed attempts. Please wait 15 minutes.' });
  }

  try {
    const { phone, pin, rememberMe } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN are required' });
    }

    // Normalize phone: strip non-digits
    const normalizedPhone = phone.replace(/\D/g, '');

    const supabase = getServiceSupabase();

    // Find technician by phone (check both phone and whatsapp_number)
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select('id, full_name, phone, whatsapp_number, pin_code, is_active')
      .or(`phone.eq.${phone},whatsapp_number.eq.${phone}`)
      .maybeSingle();

    if (techError) {
      authLogger.error('DB error during technician lookup:', techError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Also try normalized phone if no match
    let tech = technician;
    if (!tech) {
      const { data: techByNorm } = await supabase
        .from('technicians')
        .select('id, full_name, phone, whatsapp_number, pin_code, is_active')
        .or(`phone.eq.${normalizedPhone},whatsapp_number.eq.${normalizedPhone}`)
        .maybeSingle();
      tech = techByNorm;
    }

    if (!tech) {
      attempts.count += 1;
      attempts.lastAttempt = Date.now();
      loginAttempts.set(clientIP, attempts);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!tech.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    }

    if (!tech.pin_code) {
      return res.status(403).json({ error: 'PIN not set up. Contact your administrator.' });
    }

    // Verify PIN: stored as "salt:hash"
    const [salt, storedHash] = tech.pin_code.split(':');
    const inputHash = hashPin(pin, salt);

    if (inputHash !== storedHash) {
      attempts.count += 1;
      attempts.lastAttempt = Date.now();
      loginAttempts.set(clientIP, attempts);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last_login_at
    await supabase
      .from('technicians')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', tech.id);

    // Generate JWT
    const token = generateTechnicianToken(tech.id, tech.full_name, rememberMe === true);

    authLogger.info(`Technician login successful: ${tech.full_name}`);

    // Reset rate limit on success
    loginAttempts.delete(clientIP);

    return res.status(200).json({
      success: true,
      token,
      technician: {
        id: tech.id,
        name: tech.full_name,
      },
    });
  } catch (error) {
    authLogger.error('Technician login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
