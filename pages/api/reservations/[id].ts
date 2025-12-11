import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateSession } from 'lib/session';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await validateSession(req);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user is authorized to view this reservation
    if (session.role !== 'ADMIN' && reservation.userId !== session.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Format dates for display
    const formattedReservation = {
      ...reservation,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };

    return res.status(200).json(formattedReservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
