import type { NextApiRequest, NextApiResponse } from 'next';

type PingResponse = {
  status: string;
  timestamp: string;
  message: string;
}

/**
 * Simple health check endpoint
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PingResponse>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
} 