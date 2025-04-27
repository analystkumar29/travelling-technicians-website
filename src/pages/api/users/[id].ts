import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.id as string;
  
  // Make sure userId exists and is a number
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const id = parseInt(userId, 10);
  
  // GET - fetch a specific user
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          bookings: {
            select: {
              id: true,
              referenceCode: true,
              bookingDate: true,
              bookingTimeSlot: true,
              status: true,
              service: {
                select: {
                  name: true,
                  deviceType: true,
                },
              },
            },
          },
        },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
  
  // PUT - update a user
  if (req.method === 'PUT') {
    try {
      const { name, email, phone, address, postalCode, city, province } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          postalCode: postalCode || undefined,
          city: city || undefined,
          province: province || undefined,
        },
      });
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }
  
  // DELETE - delete a user
  if (req.method === 'DELETE') {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { bookings: true },
      });
      
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't allow deletion if user has bookings
      if (existingUser.bookings.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user with existing bookings',
          bookings: existingUser.bookings.length
        });
      }
      
      // Delete user
      await prisma.user.delete({
        where: { id },
      });
      
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 