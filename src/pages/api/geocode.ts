import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { type, query, lat, lon } = req.query;
  
  try {
    let url = '';
    
    if (type === 'search' && query) {
      // Nominatim search
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query as string)}&countrycodes=ca&state=British Columbia&limit=5&addressdetails=1`;
    } else if (type === 'reverse' && lat && lon) {
      // Reverse geocoding
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    } else {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TheTravellingTechnicians/1.0',
        'Accept-Language': 'en-US,en'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during geocoding' });
  }
} 