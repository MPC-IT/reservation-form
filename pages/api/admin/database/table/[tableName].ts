// pages/api/admin/database/table/[tableName].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../../lib/session';
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

  const { tableName } = req.query;

  if (!tableName || typeof tableName !== 'string') {
    return res.status(400).json({ message: 'Table name is required' });
  }

  // Validate table name to prevent SQL injection
  const validTables = ['user', 'company', 'setup', 'teamcall', 'reservation', 'auditlog'];
  if (!validTables.includes(tableName.toLowerCase()) && tableName.toLowerCase() !== 'bridgeinstructions') {
    return res.status(400).json({ message: 'Invalid table name' });
  }

  try {
    // Handle BridgeInstructions separately (stored in JSON file)
    if (tableName.toLowerCase() === 'bridgeinstructions') {
      const fs = require('fs');
      const path = require('path');
      const bridgeInstructionsPath = path.join(process.cwd(), 'data', 'bridge-instructions.json');
      
      let bridgeData = [];
      if (fs.existsSync(bridgeInstructionsPath)) {
        const rawData = fs.readFileSync(bridgeInstructionsPath, 'utf8');
        bridgeData = JSON.parse(rawData);
      }
      
      // Format data with IDs
      const formattedData = bridgeData.map((instruction: string, index: number) => ({
        id: index + 1,
        name: instruction
      }));
      
      return res.status(200).json({ data: formattedData });
    }

    // Get the model dynamically for database tables
    const model = (prisma as any)[tableName.toLowerCase()];
    if (!model) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Fetch data with limit to prevent large responses
    const data = await model.findMany({
      take: 100, // Limit to 100 rows for performance
      orderBy: {
        id: 'desc'
      }
    });

    // Sanitize data for display (remove sensitive fields)
    const sanitizedData = data.map((row: any) => {
      const sanitized = { ...row };
      
      // Remove sensitive fields like passwords
      if (sanitized.password) {
        sanitized.password = '[REDACTED]';
      }
      
      // Convert dates to strings for JSON serialization
      Object.keys(sanitized).forEach(key => {
        if (sanitized[key] instanceof Date) {
          sanitized[key] = sanitized[key].toISOString();
        }
      });

      return sanitized;
    });

    return res.status(200).json({ data: sanitizedData });
  } catch (error: any) {
    console.error('Database table data error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch table data',
      error: error.message 
    });
  }
}
