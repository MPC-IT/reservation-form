import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { validateSession } from '../../../lib/session';

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

    // Get query parameters
    const {
      page = '1',
      limit = '10',
      search = '',
      status,
      profileType,
      companyId,
      startDate,
      endDate,
      sortBy = 'callDate',
      sortOrder = 'desc',
    } = req.query;

    // Parse pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build the where clause
    const where: any = {};

    // If not admin, only show user's reservations
    if (session.role !== 'admin') {
      where.OR = [
        { createdById: session.userId },
        { updatedById: session.userId },
      ];
    }

    // Search by deal name or company name
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { dealName: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by profile type
    if (profileType) {
      where.profileType = profileType;
    }

    // Filter by company
    if (companyId) {
      where.companyId = parseInt(companyId as string);
    }

    // Filter by date range
    if (startDate || endDate) {
      where.callDate = {};
      if (startDate) {
        where.callDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.callDate.lte = new Date(endDate as string);
      }
    }

    // Get total count for pagination
    const total = await prisma.profile.count({ where });

    // Get reservations with pagination and sorting
    const reservations = await prisma.profile.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format the response
    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      callDate: reservation.callDate.toISOString().split('T')[0],
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    }));

    return res.status(200).json({
      data: formattedReservations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
