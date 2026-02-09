import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';
import { logger } from '@/utils/logger';

const pinLogger = logger.createModuleLogger('TechnicianPIN');

function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { technician_id, pin } = req.body;

    if (!technician_id) {
      return res.status(400).json({ error: 'technician_id is required' });
    }

    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    const supabase = getServiceSupabase();

    // Verify technician exists
    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('id, full_name')
      .eq('id', technician_id)
      .single();

    if (techError || !tech) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Hash and store PIN
    const pinHash = hashPin(pin);

    const { error: updateError } = await supabase
      .from('technicians')
      .update({ pin_code: pinHash })
      .eq('id', technician_id);

    if (updateError) {
      pinLogger.error('Error setting PIN:', updateError);
      return res.status(500).json({ error: 'Failed to set PIN' });
    }

    pinLogger.info(`PIN set for technician: ${tech.full_name}`);

    return res.status(200).json({
      success: true,
      message: `PIN set for ${tech.full_name}`,
    });
  } catch (error) {
    pinLogger.error('Setup PIN error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdminAuth(handler);
