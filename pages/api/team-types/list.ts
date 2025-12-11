import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const teamTypesPath = path.join(process.cwd(), 'data', 'team-types.json');
    
    if (!fs.existsSync(teamTypesPath)) {
      return res.status(200).json({ teamTypes: [] });
    }

    const teamTypesData = fs.readFileSync(teamTypesPath, 'utf8');
    const teamTypes: string[] = JSON.parse(teamTypesData);

    // Convert to the format expected by the frontend
    const formattedTeamTypes = teamTypes.map((name, index) => ({
      id: index + 1,
      name
    }));

    return res.status(200).json({ teamTypes: formattedTeamTypes });
  } catch (err: any) {
    console.error('Error reading team types:', err);
    return res.status(500).json({ message: 'Failed to fetch team types' });
  }
}
