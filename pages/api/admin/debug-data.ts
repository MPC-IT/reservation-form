import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../lib/session';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await validateSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }

  try {
    const companies = await prisma.company.findMany();
    const setups = await prisma.setup.findMany({
      include: { company: true }
    });
    const teamCalls = await prisma.teamCall.findMany({
      include: { 
        setup: {
          include: { company: true }
        }
      }
    });

    res.status(200).json({
      companies,
      setups,
      teamCalls,
      counts: {
        companies: companies.length,
        setups: setups.length,
        teamCalls: teamCalls.length
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
}
