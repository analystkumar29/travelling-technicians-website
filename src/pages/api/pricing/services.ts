import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('api/pricing/services');

interface Service {
  id: number;
  name: string;
  slug?: string;
  display_name: string;
  description?: string;
  estimated_duration_minutes?: number;
  warranty_period_days: number;
  is_doorstep_eligible: boolean;
  requires_diagnostics: boolean;
  category: {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
  };
  device_type: string;
  sort_order: number;
}

interface ApiResponse {
  success: boolean;
  services?: Service[];
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { deviceType, category } = req.query;

    // Validate required parameters
    if (!deviceType) {
      apiLogger.warn('Missing deviceType parameter');
      return res.status(400).json({
        success: false,
        message: 'deviceType parameter is required'
      });
    }

    // Validate device type
    const validDeviceTypes = ['mobile', 'laptop', 'tablet'];
    if (!validDeviceTypes.includes(deviceType as string)) {
      apiLogger.warn('Invalid device type', { deviceType });
      return res.status(400).json({
        success: false,
        message: 'Invalid device type. Must be one of: mobile, laptop, tablet'
      });
    }

    apiLogger.info('Fetching services', { deviceType, category });

    // Get Supabase client
    const supabase = getServiceSupabase();

    // Build query to fetch services from database
    let query = supabase
      .from('services')
      .select(`
        id,
        name,
        slug,
        display_name,
        description,
        estimated_duration_minutes,
        is_doorstep_eligible,
        requires_diagnostics,
        is_active,
        device_type_id,
        category:service_categories(
          id,
          name,
          slug,
          display_order
        ),
        device_type:device_types!device_type_id(
          id,
          name
        )
      `)
      .eq('is_active', true);

    // Get device type ID first
    const deviceTypeName = Array.isArray(deviceType) ? deviceType[0] : deviceType;
    const { data: deviceTypes, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id, name')
      .ilike('name', deviceTypeName)
      .limit(1);

    if (deviceTypeError || !deviceTypes || deviceTypes.length === 0) {
      apiLogger.warn('Device type not found', { deviceType, error: deviceTypeError });
      // Fallback to static data if device type not found
      const staticServices = getStaticServices(deviceType as string, category as string);
      return res.status(200).json({
        success: true,
        services: staticServices
      });
    }

    const deviceTypeId = deviceTypes[0].id;

    // Filter by device type ID
    query = query.eq('device_type_id', deviceTypeId);

    // Filter by category if specified
    if (category) {
      query = query.eq('category.slug', category);
    }

    // Order by category display order, then by slug
    query = query.order('slug', { ascending: true });

    const { data: dbServices, error } = await query;

    if (error) {
      apiLogger.error('Error fetching services from database', { error });
      // Fallback to static data
      const staticServices = getStaticServices(deviceType as string, category as string);
      return res.status(200).json({
        success: true,
        services: staticServices
      });
    }

    if (!dbServices || dbServices.length === 0) {
      apiLogger.warn('No services found in database, using fallback', { deviceType, category });
      // Fallback to static data
      const staticServices = getStaticServices(deviceType as string, category as string);
      return res.status(200).json({
        success: true,
        services: staticServices
      });
    }

    // Transform database services to API format
    const services: Service[] = dbServices.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      display_name: s.display_name || s.name,
      description: s.description,
      estimated_duration_minutes: s.estimated_duration_minutes,
      warranty_period_days: 365, // Default warranty
      is_doorstep_eligible: s.is_doorstep_eligible,
      requires_diagnostics: s.requires_diagnostics,
      category: s.category ? {
        id: s.category.id,
        name: s.category.name,
        display_name: s.category.name,
        description: undefined,
        icon_name: s.category.slug
      } : {
        id: 0,
        name: 'General',
        display_name: 'General Services',
        icon_name: 'general'
      },
      device_type: deviceType as string,
      sort_order: 0
    }));

    apiLogger.info('Successfully fetched services from database', { count: services.length });

    return res.status(200).json({
      success: true,
      services
    });

  } catch (error) {
    apiLogger.error('Unexpected error in services API', { error });
    
    // Fallback to static data on error
    try {
      const staticServices = getStaticServices(
        req.query.deviceType as string, 
        req.query.category as string
      );
      
      return res.status(200).json({
        success: true,
        services: staticServices
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch services'
      });
    }
  }
}

// Fallback static data for services
function getStaticServices(deviceType: string, category?: string): Service[] {
  const mobileServices: Service[] = [
    {
      id: 1,
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace damaged or cracked screens with high-quality parts',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 1,
        name: 'screen_repair',
        display_name: 'Screen Repair',
        icon_name: 'screen'
      },
      device_type: 'mobile',
      sort_order: 1
    },
    {
      id: 2,
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old or failing batteries to extend device life',
      estimated_duration_minutes: 30,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 2,
        name: 'battery_repair',
        display_name: 'Battery Repair',
        icon_name: 'battery'
      },
      device_type: 'mobile',
      sort_order: 2
    },
    {
      id: 3,
      name: 'charging_port_repair',
      display_name: 'Charging Port Repair',
      description: 'Fix loose or non-functioning charging ports',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 3,
        name: 'charging_repair',
        display_name: 'Charging Repair',
        icon_name: 'charging'
      },
      device_type: 'mobile',
      sort_order: 3
    },
    {
      id: 4,
      name: 'speaker_microphone_repair',
      display_name: 'Speaker/Microphone Repair',
      description: 'Resolve audio issues with speakers or microphones',
      estimated_duration_minutes: 40,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 4,
        name: 'audio_repair',
        display_name: 'Audio Repair',
        icon_name: 'audio'
      },
      device_type: 'mobile',
      sort_order: 4
    },
    {
      id: 5,
      name: 'camera_repair',
      display_name: 'Camera Repair',
      description: 'Fix front or rear camera issues',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 5,
        name: 'camera_repair',
        display_name: 'Camera Repair',
        icon_name: 'camera'
      },
      device_type: 'mobile',
      sort_order: 5
    },
    {
      id: 6,
      name: 'water_damage_diagnostics',
      display_name: 'Water Damage Diagnostics',
      description: 'Assess and repair water-damaged devices when possible',
      estimated_duration_minutes: 90,
      warranty_period_days: 180,
      is_doorstep_eligible: true,
      requires_diagnostics: true,
      category: {
        id: 6,
        name: 'diagnostics',
        display_name: 'Diagnostics',
        icon_name: 'diagnostics'
      },
      device_type: 'mobile',
      sort_order: 6
    }
  ];

  const laptopServices: Service[] = [
    {
      id: 7,
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace cracked or damaged laptop screens',
      estimated_duration_minutes: 60,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 1,
        name: 'screen_repair',
        display_name: 'Screen Repair',
        icon_name: 'screen'
      },
      device_type: 'laptop',
      sort_order: 1
    },
    {
      id: 8,
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old laptop batteries to restore battery life',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 2,
        name: 'battery_repair',
        display_name: 'Battery Repair',
        icon_name: 'battery'
      },
      device_type: 'laptop',
      sort_order: 2
    },
    {
      id: 9,
      name: 'keyboard_repair',
      display_name: 'Keyboard Repair/Replacement',
      description: 'Fix or replace damaged laptop keyboards',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 7,
        name: 'input_repair',
        display_name: 'Input Device Repair',
        icon_name: 'keyboard'
      },
      device_type: 'laptop',
      sort_order: 3
    },
    {
      id: 10,
      name: 'ram_upgrade',
      display_name: 'RAM Upgrade',
      description: 'Increase memory capacity for better performance',
      estimated_duration_minutes: 30,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 8,
        name: 'hardware_upgrade',
        display_name: 'Hardware Upgrade',
        icon_name: 'memory'
      },
      device_type: 'laptop',
      sort_order: 4
    },
    {
      id: 11,
      name: 'storage_upgrade',
      display_name: 'HDD/SSD Replacement/Upgrade',
      description: 'Replace or upgrade storage drives for better performance',
      estimated_duration_minutes: 45,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 8,
        name: 'hardware_upgrade',
        display_name: 'Hardware Upgrade',
        icon_name: 'storage'
      },
      device_type: 'laptop',
      sort_order: 5
    },
    {
      id: 12,
      name: 'software_troubleshooting',
      display_name: 'Software Troubleshooting',
      description: 'Resolve software issues and performance problems',
      estimated_duration_minutes: 90,
      warranty_period_days: 90,
      is_doorstep_eligible: true,
      requires_diagnostics: true,
      category: {
        id: 9,
        name: 'software_repair',
        display_name: 'Software Repair',
        icon_name: 'software'
      },
      device_type: 'laptop',
      sort_order: 6
    }
  ];

  const tabletServices: Service[] = [
    {
      id: 13,
      name: 'screen_replacement',
      display_name: 'Screen Replacement',
      description: 'Replace damaged or cracked tablet screens',
      estimated_duration_minutes: 50,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 1,
        name: 'screen_repair',
        display_name: 'Screen Repair',
        icon_name: 'screen'
      },
      device_type: 'tablet',
      sort_order: 1
    },
    {
      id: 14,
      name: 'battery_replacement',
      display_name: 'Battery Replacement',
      description: 'Replace old tablet batteries to extend device life',
      estimated_duration_minutes: 40,
      warranty_period_days: 365,
      is_doorstep_eligible: true,
      requires_diagnostics: false,
      category: {
        id: 2,
        name: 'battery_repair',
        display_name: 'Battery Repair',
        icon_name: 'battery'
      },
      device_type: 'tablet',
      sort_order: 2
    }
  ];

  const deviceServicesMap: Record<string, Service[]> = {
    mobile: mobileServices,
    laptop: laptopServices,
    tablet: tabletServices
  };

  let services = deviceServicesMap[deviceType?.toLowerCase()] || [];

  // Filter by category if specified
  if (category) {
    services = services.filter(service => 
      service.category.name.toLowerCase() === category.toLowerCase()
    );
  }

  return services;
} 