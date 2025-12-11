import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { validateSession } from '../../../lib/session';
import { z } from 'zod';

// Define the reservation schema for validation
const reservationSchema = z.object({
  profileType: z.string().min(1, 'Profile type is required'),
  callType: z.string().min(1, 'Call type is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().min(1, 'Company name is required'),
  dealName: z.string().min(1, 'Deal name is required'),
  setupName: z.string().min(1, 'Setup name is required'),
  setupEmail: z.string().email('Invalid email address'),
  callDate: z.string().min(1, 'Call date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  hostPasscode: z.string().optional(),
  guestPasscode: z.string().optional(),
  conferenceId: z.string().optional(),
  notes: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate session
    const session = await validateSession(req);
    if (!session?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = reservationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const {
      profileType,
      callType,
      companyId,
      companyName,
      dealName,
      setupName,
      setupEmail,
      callDate,
      startTime,
      timeZone,
      hostPasscode,
      guestPasscode,
      conferenceId,
      notes,
    } = validation.data;

    // Create the reservation
    const reservation = await prisma.profile.create({
      data: {
        profileType,
        callType,
        companyName,
        dealName,
        setupName,
        setupEmail,
        callDate,
        startTime,
        timeZone,
        hostPasscode,
        guestPasscode,
        conferenceId,
        notes,
        status: 'Draft',
        companyId: parseInt(companyId),
        createdById: session.userId,
        updatedById: session.userId,
      },
    });

    return res.status(201).json({
      id: reservation.id,
      message: 'Reservation created successfully',
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
