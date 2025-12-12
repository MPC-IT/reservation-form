import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../lib/session';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await validateSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }

  try {
    // Delete all data in order (due to foreign key constraints)
    await prisma.teamCall.deleteMany({});
    await prisma.setup.deleteMany({});
    await prisma.company.deleteMany({});

    return res.status(200).json({ message: 'All companies, setups, and team calls cleared successfully' });
  } catch (err: any) {
    console.error('Clear error:', err);
    return res.status(500).json({ message: err.message || 'Failed to clear data' });
  }
}
