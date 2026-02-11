import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { isValidUUID } from '@/types/admin';

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { model_id, category } = req.query;

  if (!model_id || typeof model_id !== 'string' || !isValidUUID(model_id)) {
    return res.status(400).json({ success: false, message: 'Valid model_id required' });
  }
  if (!category || (category !== 'screen' && category !== 'battery')) {
    return res.status(400).json({ success: false, message: 'category must be screen or battery' });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc('get_all_wholesale_parts', {
    p_device_model_id: model_id,
    p_service_category: category,
  });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const parts = (data || []).map((p: any) => ({
    part_id: p.part_id,
    name: p.part_name,
    price: parseFloat(p.wholesale_price),
    quality_tier: p.quality_tier,
    sku: p.sku,
  }));

  return res.status(200).json({ success: true, parts });
});
