import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { validateSession } from '../../../lib/session';
import { z } from 'zod';
import { addToCallLog } from '../../../lib/callLogWriter';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { logReservationCreated } from '../../../lib/auditLogger';

// Define the reservation schema for validation
const reservationSchema = z.object({
  profileType: z.string().min(1, 'Profile type is required'),
  callType: z.string().min(1, 'Call type is required'),
  companyId: z.string().optional(),
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
  host: z.string().optional(),
  duration: z.string().optional(),
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
      host,
      duration,
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
        companyId: companyId ? parseInt(companyId) : null,
        createdById: session.userId,
        updatedById: session.userId,
      },
    });

    // Add reservation to Call Log (non-blocking)
    try {
      // Get Google access token from session
      const googleSession = await getServerSession(req, res, authOptions);
      const accessToken = (googleSession as any)?.accessToken;

      if (accessToken) {
        const callLogResult = await addToCallLog(accessToken, {
          id: reservation.id,
          profileType,
          callType,
          companyName,
          dealName,
          setupName,
          setupEmail,
          callDate,
          startTime,
          timeZone,
          host,
          duration,
          createdAt: reservation.createdAt,
        }, session.userId, session.userEmail);

        if (!callLogResult.success) {
          console.error('Call Log update failed:', callLogResult.error);
          // Don't fail the reservation creation, just log the error
        } else {
          console.log(`Reservation ${reservation.id} added to Call Log successfully`);
        }
      } else {
        console.warn('No Google access token available for Call Log update');
      }
    } catch (callLogError) {
      console.error('Unexpected error adding to Call Log:', callLogError);
      // Don't fail the reservation creation
    }

    // Audit logging for reservation creation (non-blocking)
    // This logs the creation action for compliance and tracking purposes
    logReservationCreated(
      reservation.id,
      session.userId,
      session.userEmail || 'unknown',
      {
        companyName,
        dealName,
        profileType,
        callType,
      }
    ).catch(error => {
      // Audit logging failures should never impact the user experience
      console.error('Failed to log reservation creation:', error);
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
