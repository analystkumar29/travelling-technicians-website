import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ success: false, error: 'No entries provided' });
  }
  const supabase = getServiceSupabase();
  let successCount = 0;
  let errorCount = 0;
  for (const entry of entries) {
    const { device_type, brand_name, model_name, service_name, tier_name, base_price } = entry;
    // Find IDs for model, service, tier
    const [{ data: modelData }, { data: serviceData }, { data: tierData }] = await Promise.all([
      supabase.from('device_models').select('id').eq('name', model_name).single(),
      supabase.from('services').select('id').eq('name', service_name).single(),
      supabase.from('pricing_tiers').select('id').eq('name', tier_name).single(),
    ]);
    if (!modelData?.id || !serviceData?.id || !tierData?.id) {
      errorCount++;
      continue;
    }
    // Upsert price
    const { error } = await supabase
      .from('dynamic_pricing')
      .upsert({
        model_id: modelData.id,
        service_id: serviceData.id,
        pricing_tier_id: tierData.id,
        base_price,
        is_active: true,
      }, { onConflict: 'model_id,service_id,pricing_tier_id' });
    if (error) {
      errorCount++;
    } else {
      successCount++;
    }
  }
  return res.status(200).json({ success: true, message: `Bulk update complete: ${successCount} succeeded, ${errorCount} failed.` });
} 