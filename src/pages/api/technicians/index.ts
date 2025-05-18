import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import logger from '@/utils/logger';

/**
 * API handler for technicians endpoint
 * GET - Retrieve a list of technicians
 * POST - Create a new technician
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetTechnicians(req, res);
    case 'POST':
      return handleCreateTechnician(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

/**
 * Handle GET request to retrieve technicians
 */
async function handleGetTechnicians(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters
    const { specialization, service_area, is_active } = req.query;
    
    // Build the query
    let query = supabase.from('technicians').select('*');
    
    // Apply filters
    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }
    
    if (service_area) {
      query = query.contains('active_service_areas', [service_area]);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching technicians:', error);
      return res.status(500).json({ error: 'Failed to fetch technicians' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in technicians API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle POST request to create a technician
 */
async function handleCreateTechnician(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    
    // Validate required fields
    const requiredFields = ['auth_id', 'full_name', 'email', 'phone', 'specializations', 'active_service_areas'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('technicians')
      .insert([body])
      .select();
    
    if (error) {
      logger.error('Error creating technician:', error);
      return res.status(500).json({ error: 'Failed to create technician' });
    }
    
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error('Unexpected error in create technician API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Simple API auth middleware
const withApiAuth = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  // Validate the token
  const token = authHeader.split(' ')[1];
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user to request object for use in handler
    (req as any).user = data.user;
    
    // Call the original handler
    return handler(req, res);
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Export with auth middleware
export default withApiAuth(handler); 