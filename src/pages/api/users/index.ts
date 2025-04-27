import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - fetch all users
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          province: true,
          createdAt: true,
        },
      });
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  // POST - create a new user
  if (req.method === 'POST') {
    try {
      const { name, email, phone, address, postalCode, city, province } = req.body;
      
      // Basic validation
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Create new user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          address,
          postalCode,
          city,
          province: province || 'BC',
        },
      });
      
      return res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 