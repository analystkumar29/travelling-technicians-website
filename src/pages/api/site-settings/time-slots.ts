import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch time slot configuration from site_settings
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'booking_time_slots_weekday',
        'booking_time_slots_weekend',
        'booking_slot_duration'
      ]);

    if (error) {
      console.error('Error fetching time slot settings:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch time slot configuration',
        details: error.message 
      });
    }

    // Parse the settings
    const weekdaySlotsSetting = settings.find(s => s.key === 'booking_time_slots_weekday');
    const weekendSlotsSetting = settings.find(s => s.key === 'booking_time_slots_weekend');
    const slotDurationSetting = settings.find(s => s.key === 'booking_slot_duration');

    // Parse JSON values or use defaults
    let weekdaySlots: string[] = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    let weekendSlots: string[] = ['9:00', '11:00', '13:00', '15:00', '17:00'];
    let slotDuration = 120; // 2 hours in minutes

    try {
      if (weekdaySlotsSetting?.value) {
        weekdaySlots = JSON.parse(weekdaySlotsSetting.value);
      }
      if (weekendSlotsSetting?.value) {
        weekendSlots = JSON.parse(weekendSlotsSetting.value);
      }
      if (slotDurationSetting?.value) {
        slotDuration = parseInt(slotDurationSetting.value, 10);
      }
    } catch (parseError) {
      console.error('Error parsing time slot settings:', parseError);
      // Use defaults if parsing fails
    }

    // Validate slot duration
    if (isNaN(slotDuration) || slotDuration <= 0) {
      slotDuration = 120; // Default to 2 hours
    }

    // Validate time slots format
    const validateTimeSlots = (slots: any[]): string[] => {
      if (!Array.isArray(slots)) {
        return weekdaySlots; // Return default
      }
      
      return slots
        .map(slot => {
          if (typeof slot === 'string') {
            // Ensure format is HH:MM
            const match = slot.match(/^(\d{1,2}):(\d{2})$/);
            if (match) {
              const hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              }
            }
          }
          return null;
        })
        .filter((slot): slot is string => slot !== null);
    };

    const validatedWeekdaySlots = validateTimeSlots(weekdaySlots);
    const validatedWeekendSlots = validateTimeSlots(weekendSlots);

    // Return the configuration
    return res.status(200).json({
      weekdaySlots: validatedWeekdaySlots.length > 0 ? validatedWeekdaySlots : weekdaySlots,
      weekendSlots: validatedWeekendSlots.length > 0 ? validatedWeekendSlots : weekendSlots,
      slotDuration,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error in time-slots API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}