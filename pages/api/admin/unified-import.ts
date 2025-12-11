import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../lib/session';
import formidable from 'formidable';
import fs from 'fs';
import prisma from '../../../lib/prisma';

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
    
    // Handle both comma and space separated headers
    const headerLine = lines[0];
    let headers: string[];
    
    if (headerLine.includes(',')) {
      headers = headerLine.split(',').map(h => h.trim());
    } else {
      headers = headerLine.split(/\s+/).map(h => h.trim());
    }

    console.log('CSV Headers:', headers);
    console.log('CSV Lines count:', lines.length);

    const setupNameIndex = headers.indexOf('SetupName');
    const companyNameIndex = headers.indexOf('CompanyName');
    const setupEmailIndex = headers.indexOf('SetupEmail');
    const teamCallIndex = headers.indexOf('TeamCall');
    
    console.log('Column indices:', { setupNameIndex, companyNameIndex, setupEmailIndex, teamCallIndex });
    
    if (setupNameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "SetupName" column. Found headers: ' + headers.join(', ') });
    }
    
    if (companyNameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "CompanyName" column. Found headers: ' + headers.join(', ') });
    }

    const dataToImport: Array<{ 
      setupName: string; 
      companyName: string; 
      setupEmail?: string; 
      teamCall?: string 
    }> = [];
    
    for (let i = 1; i < lines.length; i++) {
      let values: string[];
      
      // Handle both comma and space separated values
      if (lines[i].includes(',')) {
        values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      } else {
        values = lines[i].split(/\s+/).map(v => v.trim().replace(/^"|"$/g, ''));
      }
      
      const setupName = values[setupNameIndex];
      const companyName = values[companyNameIndex];
      const setupEmail = setupEmailIndex !== -1 && setupEmailIndex < values.length ? values[setupEmailIndex] : undefined;
      const teamCall = teamCallIndex !== -1 && teamCallIndex < values.length ? values[teamCallIndex] : undefined;
      
      console.log(`Row ${i}:`, { setupName, companyName, setupEmail, teamCall });
      
      if (!setupName || !companyName) continue;

      dataToImport.push({ setupName, companyName, setupEmail, teamCall });
    }
    
    console.log('Data to import:', dataToImport);

    // Import data into database
    let importedSetups = 0;
    let importedTeamCalls = 0;
    
    for (const { setupName, companyName, setupEmail, teamCall } of dataToImport) {
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
        let setup = await prisma.setup.findFirst({
          where: {
            name: setupName,
            companyId: company.id
          }
        });

        if (!setup) {
          setup = await prisma.setup.create({
            data: {
              name: setupName,
              email: setupEmail,
              companyId: company.id
            }
          });
          importedSetups++;
        }

        // Import team call if provided
        if (teamCall && teamCall.trim()) {
          const existingTeamCall = await prisma.teamCall.findFirst({
            where: {
              name: teamCall,
              setupId: setup.id
            }
          });

          if (!existingTeamCall) {
            await prisma.teamCall.create({
              data: {
                name: teamCall,
                setupId: setup.id
              }
            });
            importedTeamCalls++;
          }
        }
      } catch (error) {
        console.error(`Error importing ${setupName} for ${companyName}:`, error);
        // Continue with next record
      }
    }

    return res.status(200).json({ 
      message: 'Import successful', 
      setupsImported: importedSetups,
      teamCallsImported: importedTeamCalls
    });
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ message: err.message || 'Import failed' });
  }
}
