import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { validateSession } from '../../../../lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Get the reservation
    const reservation = await prisma.profile.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only allow the creator or an admin to view the reservation
    if (reservation.createdById !== session.userId && session.role !== 'admin') {
      return res.status(403).json({
        message: 'You do not have permission to view this reservation',
      });
    }

    return res.status(200).json({
      ...reservation,
      // Format dates as strings for the client
      callDate: reservation.callDate,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
