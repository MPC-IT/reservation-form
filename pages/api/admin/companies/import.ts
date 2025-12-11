// pages/api/admin/companies/import.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateSession } from '../../../../lib/session';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await validateSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvText = fs.readFileSync(file.filepath, 'utf8');
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const nameIndex = headers.indexOf('name');
    if (nameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "name" column' });
    }

    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      if (!name) continue;

      await prisma.company.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      imported++;
    }

    return res.status(200).json({ message: 'Import successful', count: imported });
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ message: err.message || 'Import failed' });
  } finally {
    await prisma.$disconnect();
  }
}
