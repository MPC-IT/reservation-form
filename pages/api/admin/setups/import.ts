// pages/api/admin/setups/import.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../lib/session';
import formidable from 'formidable';
import fs from 'fs';
import prisma from '../../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const headers = lines[0].split(',').map(h => h.trim());

    const setupNameIndex = headers.indexOf('SetupName');
    const companyNameIndex = headers.indexOf('CompanyName');
    const setupEmailIndex = headers.indexOf('SetupEmail');
    
    if (setupNameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "SetupName" column' });
    }
    
    if (companyNameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "CompanyName" column' });
    }

    const setupsToImport: Array<{ setupName: string; companyName: string; setupEmail?: string }> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const setupName = values[setupNameIndex];
      const companyName = values[companyNameIndex];
      const setupEmail = setupEmailIndex !== -1 ? values[setupEmailIndex] : undefined;
      
      if (!setupName || !companyName) continue;

      setupsToImport.push({ setupName, companyName, setupEmail });
    }

    // Import setups into database
    let importedCount = 0;
    for (const { setupName, companyName, setupEmail } of setupsToImport) {
      try {
        // Find or create company
        let company = await prisma.company.findUnique({
          where: { name: companyName }
        });
        
        if (!company) {
          company = await prisma.company.create({
            data: { name: companyName }
          });
        }

        // Check if setup already exists for this company
        const existingSetup = await prisma.setup.findFirst({
          where: {
            name: setupName,
            companyId: company.id
          }
        });

        if (!existingSetup) {
          await prisma.setup.create({
            data: {
              name: setupName,
              email: setupEmail,
              companyId: company.id
            }
          });
          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing setup ${setupName} for ${companyName}:`, error);
        // Continue with next setup
      }
    }

    return res.status(200).json({ message: 'Import successful', count: importedCount });
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ message: err.message || 'Import failed' });
  }
}
