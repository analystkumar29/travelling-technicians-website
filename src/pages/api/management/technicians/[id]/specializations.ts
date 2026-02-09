import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supabase = getServiceSupabase();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('technician_specializations')
        .select('id, service_id, category_id, skill_level, services:service_id (name, display_name), service_categories:category_id (name)')
        .eq('technician_id', id as string);

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch specializations' });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { specializations } = req.body;

      if (!Array.isArray(specializations)) {
        return res.status(400).json({ error: 'specializations must be an array' });
      }

      // Delete existing specializations
      await supabase
        .from('technician_specializations')
        .delete()
        .eq('technician_id', id as string);

      // Insert new ones
      if (specializations.length > 0) {
        const rows = specializations.map((s: any) => ({
          technician_id: id,
          service_id: s.service_id || null,
          category_id: s.category_id || null,
          skill_level: s.skill_level || 'standard',
        }));

        const { error: insertError } = await supabase
          .from('technician_specializations')
          .insert(rows);

        if (insertError) {
          console.error('Error inserting specializations:', insertError);
          return res.status(500).json({ error: 'Failed to update specializations' });
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdminAuth(handler);
