import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { validateSession } from '../../../../lib/session';
import { z } from 'zod';

// Define the update schema (similar to create but all fields are optional)
const updateReservationSchema = z.object({
  profileType: z.string().optional(),
  callType: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  dealName: z.string().optional(),
  setupName: z.string().optional(),
  setupEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  callDate: z.string().optional(),
  startTime: z.string().optional(),
  timeZone: z.string().optional(),
  hostPasscode: z.string().optional(),
  guestPasscode: z.string().optional(),
  conferenceId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Pending', 'Confirmed', 'Completed', 'Cancelled']).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate session
    const session = await validateSession(req);
    if (!session?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }

    // Get the existing reservation
    const existingReservation = await prisma.profile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only allow the creator or an admin to update the reservation
    if (existingReservation.createdById !== session.userId && session.role !== 'admin') {
      return res.status(403).json({
        message: 'You do not have permission to update this reservation',
      });
    }

    // Validate request body
    const validation = updateReservationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const updateData = validation.data;

    // Prepare the data for update
    const dataToUpdate: any = { ...updateData };
    
    // Only include the fields that were provided in the request
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    // Add the updatedBy and updatedAt fields
    dataToUpdate.updatedById = session.userId;
    dataToUpdate.updatedAt = new Date();

    // If companyId is being updated, ensure it's a number
    if (dataToUpdate.companyId) {
      dataToUpdate.companyId = parseInt(dataToUpdate.companyId);
    }

    // Update the reservation
    const updatedReservation = await prisma.profile.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    return res.status(200).json({
      id: updatedReservation.id,
      message: 'Reservation updated successfully',
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
