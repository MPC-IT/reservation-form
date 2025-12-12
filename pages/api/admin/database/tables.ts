// pages/api/admin/database/tables.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../lib/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await validateSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }

  try {
    // Get table information using Prisma's introspection
    const tables = [];
    
    // Define the tables we want to expose
    const tableNames = [
      'User',
      'Company', 
      'Setup',
      'TeamCall',
      'Reservation',
      'AuditLog'
    ];

    for (const tableName of tableNames) {
      try {
        // Get table structure and count
        const model = (prisma as any)[tableName.toLowerCase()];
        if (!model) continue;

        // Get row count
        const count = await model.count();
        
        // Get column information (basic)
        const sample = await model.findFirst({
          take: 1
        });

        if (sample) {
          const columns = Object.keys(sample).map(key => ({
            name: key,
            type: typeof sample[key],
            nullable: sample[key] === null
          }));

          tables.push({
            name: tableName,
            columns,
            count
          });
        } else {
          // Table exists but is empty
          tables.push({
            name: tableName,
            columns: [],
            count: 0
          });
        }
      } catch (err) {
        console.warn(`Could not access table ${tableName}:`, err);
        // Skip tables that don't exist or can't be accessed
      }
    }

    // Add BridgeInstructions (stored in JSON file, not database)
    try {
      const fs = require('fs');
      const path = require('path');
      const bridgeInstructionsPath = path.join(process.cwd(), 'data', 'bridge-instructions.json');
      
      if (fs.existsSync(bridgeInstructionsPath)) {
        const bridgeData = JSON.parse(fs.readFileSync(bridgeInstructionsPath, 'utf8'));
        tables.push({
          name: 'BridgeInstructions',
          columns: [
            { name: 'id', type: 'number', nullable: false },
            { name: 'name', type: 'string', nullable: false }
          ],
          count: bridgeData.length || 0
        });
      } else {
        tables.push({
          name: 'BridgeInstructions',
          columns: [
            { name: 'id', type: 'number', nullable: false },
            { name: 'name', type: 'string', nullable: false }
          ],
          count: 0
        });
      }
    } catch (err) {
      console.warn('Could not access BridgeInstructions:', err);
    }

    return res.status(200).json({ tables });
  } catch (error: any) {
    console.error('Database tables error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch database tables',
      error: error.message 
    });
  }
}
