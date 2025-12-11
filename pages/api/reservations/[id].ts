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

    const reservation = await prisma.profile.findUnique({
      where: { id: Number(id) },
      include: {
        company: true,
        setup: true,
        createdBy: {
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

    // Format dates for display
    const formattedReservation = {
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };

    return res.status(200).json(formattedReservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
