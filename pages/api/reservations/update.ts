import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { validateSession } from '../../../lib/session';
import { z } from 'zod';
import { addToCallLog, updateCallLog } from '../../../lib/callLogWriter';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { logReservationUpdated } from '../../../lib/auditLogger';

// Define the reservation schema for validation
const reservationUpdateSchema = z.object({
  id: z.number().min(1, 'Reservation ID is required'),
  profileType: z.string().min(1, 'Profile type is required'),
  callType: z.string().min(1, 'Call type is required'),
  companyId: z.number().nullable().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  dealName: z.string().nullable().optional(),
  setupName: z.string().nullable().optional(),
  setupEmail: z.string().email('Invalid email address').nullable().optional(),
  callDate: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  timeZone: z.string().nullable().optional(),
  hostPasscode: z.string().nullable().optional(),
  guestPasscode: z.string().nullable().optional(),
  conferenceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  host: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  status: z.string().min(1, 'Status is required'),
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
    const validation = reservationUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }

    const {
      id,
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
      status,
    } = validation.data;

    // Check if reservation exists
    const existingReservation = await prisma.profile.findUnique({
      where: { id },
    });

    if (!existingReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Detect which fields have changed for audit logging
    const fieldsChanged: string[] = [];
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    // Compare each field to detect changes
    const fieldComparisons = [
      { field: 'profileType', old: existingReservation.profileType, new: profileType },
      { field: 'callType', old: existingReservation.callType, new: callType },
      { field: 'companyName', old: existingReservation.companyName, new: companyName },
      { field: 'dealName', old: existingReservation.dealName, new: dealName },
      { field: 'setupName', old: existingReservation.setupName, new: setupName },
      { field: 'setupEmail', old: existingReservation.setupEmail, new: setupEmail },
      { field: 'callDate', old: existingReservation.callDate, new: callDate },
      { field: 'startTime', old: existingReservation.startTime, new: startTime },
      { field: 'timeZone', old: existingReservation.timeZone, new: timeZone },
      { field: 'hostPasscode', old: existingReservation.hostPasscode, new: hostPasscode },
      { field: 'guestPasscode', old: existingReservation.guestPasscode, new: guestPasscode },
      { field: 'conferenceId', old: existingReservation.conferenceId, new: conferenceId },
      { field: 'notes', old: existingReservation.notes, new: notes },
      { field: 'status', old: existingReservation.status, new: status },
      { field: 'companyId', old: existingReservation.companyId, new: companyId },
    ];

    fieldComparisons.forEach(({ field, old, new: newVal }) => {
      if (old !== newVal) {
        fieldsChanged.push(field);
        oldValues[field] = old;
        newValues[field] = newVal;
      }
    });

    // Update the reservation
    const reservation = await prisma.profile.update({
      where: { id },
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
        status,
        companyId,
        updatedById: session.userId,
      },
    });

    // Update Call Log for relevant changes (non-blocking)
    // Sync to Call Log if status is Confirmed OR if key scheduling details changed
    const shouldSyncCallLog = status === 'Confirmed' || 
      fieldsChanged.includes('callDate') || 
      fieldsChanged.includes('startTime') || 
      fieldsChanged.includes('timeZone') || 
      fieldsChanged.includes('host') || 
      fieldsChanged.includes('duration') ||
      fieldsChanged.includes('status');

    if (shouldSyncCallLog) {
      try {
        // Get Google access token from session
        const googleSession = await getServerSession(req, res, authOptions);
        const accessToken = (googleSession as any)?.accessToken;

        if (accessToken) {
          // Get the old reservation data for comparison
          const oldReservationData = {
            id: reservation.id,
            profileType: reservation.profileType,
            callType: reservation.callType,
            companyName: reservation.companyName,
            dealName: reservation.dealName || '',
            setupName: reservation.setupName || '',
            setupEmail: reservation.setupEmail || '',
            callDate: reservation.callDate || '',
            startTime: reservation.startTime || '',
            timeZone: reservation.timeZone || '',
            host: host || undefined,
            duration: duration || undefined,
            createdAt: reservation.createdAt,
          };

          const newReservationData = {
            id: reservation.id,
            profileType: reservation.profileType,
            callType: reservation.callType,
            companyName: reservation.companyName,
            dealName: reservation.dealName || '',
            setupName: reservation.setupName || '',
            setupEmail: reservation.setupEmail || '',
            callDate: reservation.callDate || '',
            startTime: reservation.startTime || '',
            timeZone: reservation.timeZone || '',
            host: host || undefined,
            duration: duration || undefined,
            createdAt: reservation.createdAt,
          };

          const callLogResult = await updateCallLog(
            accessToken, 
            oldReservationData, 
            newReservationData, 
            session.userId, 
            session.userEmail
          );

          if (!callLogResult.success) {
            console.error('Call Log update failed:', callLogResult.error);
            // Don't fail the reservation update, just log the error
          } else {
            console.log(`Reservation ${reservation.id} synced to Call Log successfully`);
          }
        } else {
          console.warn('No Google access token available for Call Log update');
        }
      } catch (callLogError) {
        console.error('Unexpected error updating Call Log:', callLogError);
        // Don't fail the reservation update
      }
    }

    // Audit logging for reservation update (non-blocking)
    // This logs the update action for compliance and tracking purposes
    // Only log if there were actual changes to prevent noise
    if (fieldsChanged.length > 0) {
      logReservationUpdated(
        reservation.id,
        session.userId,
        session.userEmail || 'unknown',
        fieldsChanged,
        oldValues,
        newValues
      ).catch(error => {
        // Audit logging failures should never impact the user experience
        console.error('Failed to log reservation update:', error);
      });
    }

    return res.status(200).json({
      message: 'Reservation updated successfully',
      profile: reservation,
    });

  } catch (error) {
    console.error('Error updating reservation:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
