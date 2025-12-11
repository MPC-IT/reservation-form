// pages/api/admin/team-types/import.ts
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
    if (nameIndex === -1) {
      return res.status(400).json({ message: 'CSV must contain a "name" column' });
    }

    const teamTypes: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      if (!name) continue;

      teamTypes.push(name);
    }

    // Store team types in a JSON file (temporary solution)
    const teamTypesPath = path.join(process.cwd(), 'data', 'team-types.json');
    const dataDir = path.dirname(teamTypesPath);
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing team types or create empty array
    let existingTeamTypes: string[] = [];
    if (fs.existsSync(teamTypesPath)) {
      const existingData = fs.readFileSync(teamTypesPath, 'utf8');
      existingTeamTypes = JSON.parse(existingData);
    }

    // Merge new team types with existing ones (remove duplicates)
    const allTeamTypes = [...new Set([...existingTeamTypes, ...teamTypes])];

    // Save updated team types
    fs.writeFileSync(teamTypesPath, JSON.stringify(allTeamTypes, null, 2));

    return res.status(200).json({ message: 'Import successful', count: teamTypes.length });
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ message: err.message || 'Import failed' });
  }
}
