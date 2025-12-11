import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { company } = req.query;
    
    const setupsPath = path.join(process.cwd(), 'data', 'setups.json');
    
    if (!fs.existsSync(setupsPath)) {
      return res.status(200).json({ setups: [] });
    }

    const setupsData = fs.readFileSync(setupsPath, 'utf8');
    const setupsByCompany: { [key: string]: string[] } = JSON.parse(setupsData);

    let setups: string[] = [];
    
    if (company && typeof company === 'string') {
      // Return setups for specific company
      setups = setupsByCompany[company] || [];
    } else {
      // Return all setups if no company specified
      setups = Object.values(setupsByCompany).flat();
    }

    // Convert to the format expected by the frontend
    const formattedSetups = setups.map((name, index) => ({
      id: index + 1,
      name
    }));

    return res.status(200).json({ setups: formattedSetups });
  } catch (err: any) {
    console.error('Error reading setups:', err);
    return res.status(500).json({ message: 'Failed to fetch setups' });
  }
}
