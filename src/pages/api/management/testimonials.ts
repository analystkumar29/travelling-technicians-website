import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/testimonials');

interface Testimonial {
  id: string;
  customer_name: string;
  city: string | null;
  device_model: string | null;
  service: string | null;
  rating: number | null;
  review: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
  location_id: string | null;
  service_id: string | null;
  neighborhood_id: number | null;
  verified: boolean;
  source: string;
  device_type: string | null;
  service_locations?: { id: string; city_name: string; slug: string } | null;
  services?: { id: string; name: string; display_name: string } | null;
}

interface ApiResponse {
  success: boolean;
  testimonials?: Testimonial[];
  testimonial?: Testimonial;
  message?: string;
  error?: string;
}

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase);
      case 'POST':
        return await handlePost(req, res, supabase);
      case 'PUT':
        return await handlePut(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in testimonials API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
});

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { source, is_featured, city } = req.query;

    apiLogger.info('Fetching testimonials');

    let query = supabase
      .from('testimonials')
      .select('*, service_locations(id, city_name, slug), services(id, name, display_name)')
      .order('created_at', { ascending: false });

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    if (is_featured === 'true') {
      query = query.eq('is_featured', true);
    } else if (is_featured === 'false') {
      query = query.eq('is_featured', false);
    }

    if (city && city !== 'all') {
      query = query.eq('city', city);
    }

    const { data: testimonials, error } = await query;

    if (error) {
      apiLogger.error('Error fetching testimonials', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch testimonials',
        error: error.message
      });
    }

    apiLogger.info('Successfully fetched testimonials', { count: testimonials?.length || 0 });

    return res.status(200).json({
      success: true,
      testimonials: testimonials || []
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const {
      customer_name,
      city,
      device_model,
      device_type,
      service,
      rating,
      review,
      is_featured,
      featured_order,
      location_id,
      service_id,
      neighborhood_id,
      verified,
      source
    } = req.body;

    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'customer_name is required'
      });
    }

    if (rating !== undefined && rating !== null) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'rating must be an integer between 1 and 5'
        });
      }
    }

    if (source !== undefined) {
      const validSources = ['google', 'yelp', 'manual', 'synthetic'];
      if (!validSources.includes(source)) {
        return res.status(400).json({
          success: false,
          message: `source must be one of: ${validSources.join(', ')}`
        });
      }
    }

    apiLogger.info('Creating testimonial', { customer_name });

    const insertData: Record<string, unknown> = {
      customer_name: customer_name.trim()
    };

    if (city !== undefined) insertData.city = city;
    if (device_model !== undefined) insertData.device_model = device_model;
    if (device_type !== undefined) insertData.device_type = device_type;
    if (service !== undefined) insertData.service = service;
    if (rating !== undefined && rating !== null) insertData.rating = Number(rating);
    if (review !== undefined) insertData.review = review;
    if (is_featured !== undefined) insertData.is_featured = Boolean(is_featured);
    if (featured_order !== undefined) insertData.featured_order = Number(featured_order);
    if (location_id !== undefined) insertData.location_id = location_id || null;
    if (service_id !== undefined) insertData.service_id = service_id || null;
    if (neighborhood_id !== undefined) insertData.neighborhood_id = neighborhood_id || null;
    if (verified !== undefined) insertData.verified = Boolean(verified);
    if (source !== undefined) insertData.source = source;

    const { data: newTestimonial, error } = await supabase
      .from('testimonials')
      .insert(insertData)
      .select('*, service_locations(id, city_name, slug), services(id, name, display_name)')
      .single();

    if (error) {
      apiLogger.error('Error creating testimonial', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to create testimonial',
        error: error.message
      });
    }

    apiLogger.info('Successfully created testimonial', { id: newTestimonial.id });

    return res.status(201).json({
      success: true,
      testimonial: newTestimonial,
      message: 'Testimonial created successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial'
    });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'id query parameter is required'
      });
    }

    const {
      customer_name,
      city,
      device_model,
      device_type,
      service,
      rating,
      review,
      is_featured,
      featured_order,
      location_id,
      service_id,
      neighborhood_id,
      verified,
      source
    } = req.body;

    if (rating !== undefined && rating !== null) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'rating must be an integer between 1 and 5'
        });
      }
    }

    if (source !== undefined) {
      const validSources = ['google', 'yelp', 'manual', 'synthetic'];
      if (!validSources.includes(source)) {
        return res.status(400).json({
          success: false,
          message: `source must be one of: ${validSources.join(', ')}`
        });
      }
    }

    apiLogger.info('Updating testimonial', { id });

    const updateData: Record<string, unknown> = {};

    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (city !== undefined) updateData.city = city;
    if (device_model !== undefined) updateData.device_model = device_model;
    if (device_type !== undefined) updateData.device_type = device_type;
    if (service !== undefined) updateData.service = service;
    if (rating !== undefined) updateData.rating = rating !== null ? Number(rating) : null;
    if (review !== undefined) updateData.review = review;
    if (is_featured !== undefined) updateData.is_featured = Boolean(is_featured);
    if (featured_order !== undefined) updateData.featured_order = Number(featured_order);
    if (location_id !== undefined) updateData.location_id = location_id || null;
    if (service_id !== undefined) updateData.service_id = service_id || null;
    if (neighborhood_id !== undefined) updateData.neighborhood_id = neighborhood_id || null;
    if (verified !== undefined) updateData.verified = Boolean(verified);
    if (source !== undefined) updateData.source = source;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const { data: updated, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select('*, service_locations(id, city_name, slug), services(id, name, display_name)')
      .single();

    if (error) {
      apiLogger.error('Error updating testimonial', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to update testimonial',
        error: error.message
      });
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    apiLogger.info('Successfully updated testimonial', { id });

    return res.status(200).json({
      success: true,
      testimonial: updated,
      message: 'Testimonial updated successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial'
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'id query parameter is required'
      });
    }

    apiLogger.info('Deleting testimonial', { id });

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      apiLogger.error('Error deleting testimonial', { error });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete testimonial',
        error: error.message
      });
    }

    apiLogger.info('Successfully deleted testimonial', { id });

    return res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial'
    });
  }
}
