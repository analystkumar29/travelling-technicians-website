import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';

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
    const { id } = req.query;
    const { pin } = req.body;

    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    const supabase = getServiceSupabase();

    const { data: tech, error: techError } = await supabase
      .from('technicians')
      .select('id, full_name')
      .eq('id', id as string)
      .single();

    if (techError || !tech) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const pinHash = hashPin(pin);

    const { error: updateError } = await supabase
      .from('technicians')
      .update({ pin_code: pinHash })
      .eq('id', id as string);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to set PIN' });
    }

    return res.status(200).json({
      success: true,
      message: `PIN set for ${tech.full_name}`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdminAuth(handler);
