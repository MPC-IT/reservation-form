import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { validateSession } from '../../../lib/session';
import { z } from 'zod';

// Schema for query parameters validation
const auditLogsQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('25'),
  eventType: z.string().optional(),
  userId: z.string().transform(Number).optional(),
  reservationId: z.string().transform(Number).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userSearch: z.string().optional(),
});

// Human-readable event type labels
export const EVENT_TYPE_LABELS: Record<string, string> = {
  reservation_created: 'Reservation Created',
  reservation_updated: 'Reservation Updated',
  reservation_email_sent: 'Email Sent',
  reservation_email_failed: 'Email Failed',
  reservation_exported: 'Reservation Exported',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate session and admin access
    const session = await validateSession(req);
    if (!session?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Validate query parameters
    const query = auditLogsQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: query.error.errors,
      });
    }

    const {
      page,
      limit,
      eventType,
      userId,
      reservationId,
      startDate,
      endDate,
      userSearch,
    } = query.data;

    // Build where clause for filtering
    const where: any = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (reservationId) {
      where.reservationId = reservationId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (userSearch) {
      where.OR = [
        {
          userEmail: {
            contains: userSearch,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: userSearch,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    // Get audit logs with pagination
    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        reservation: {
          select: {
            id: true,
            companyName: true,
            dealName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: Math.min(limit, 100), // Cap at 100 to prevent excessive queries
    });

    // Format the response
    const formattedLogs = auditLogs.map((log) => ({
      id: log.id,
      eventType: log.eventType,
      eventLabel: EVENT_TYPE_LABELS[log.eventType] || log.eventType,
      reservationId: log.reservationId,
      reservation: log.reservation,
      userId: log.userId,
      user: log.user,
      userEmail: log.userEmail,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      createdAt: log.createdAt,
    }));

    return res.status(200).json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      eventTypes: Object.keys(EVENT_TYPE_LABELS).map((key) => ({
        value: key,
        label: EVENT_TYPE_LABELS[key],
      })),
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
