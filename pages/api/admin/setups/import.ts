// pages/api/admin/setups/import.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateSession } from '../../../../lib/session';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const nameIndex = headers.indexOf('name');
    const companyIndex = headers.indexOf('company');
    
    if (nameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "name" column' });
    }
    
    if (companyIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "company" column' });
    }

    const setupsByCompany: { [key: string]: string[] } = {};
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      const company = values[companyIndex];
      
      if (!name || !company) continue;

      if (!setupsByCompany[company]) {
        setupsByCompany[company] = [];
      }
      setupsByCompany[company].push(name);
    }

    // Store setups by company in a JSON file
    const setupsPath = path.join(process.cwd(), 'data', 'setups.json');
    const dataDir = path.dirname(setupsPath);
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing setups or create empty object
    let existingSetups: { [key: string]: string[] } = {};
    if (fs.existsSync(setupsPath)) {
      const existingData = fs.readFileSync(setupsPath, 'utf8');
      existingSetups = JSON.parse(existingData);
    }

    // Merge new setups with existing ones
    for (const [company, newSetups] of Object.entries(setupsByCompany)) {
      if (!existingSetups[company]) {
        existingSetups[company] = [];
      }
      // Remove duplicates and merge
      existingSetups[company] = [...new Set([...existingSetups[company], ...newSetups])];
    }

    // Save updated setups
    fs.writeFileSync(setupsPath, JSON.stringify(existingSetups, null, 2));

    const totalSetups = Object.values(setupsByCompany).reduce((sum, setups) => sum + setups.length, 0);
    return res.status(200).json({ message: 'Import successful', count: totalSetups });
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ message: err.message || 'Import failed' });
  }
}
