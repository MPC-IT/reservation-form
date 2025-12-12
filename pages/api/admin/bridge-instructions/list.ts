import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const bridgeInstructionsPath = path.join(process.cwd(), 'data', 'bridge-instructions.json');
    
    if (!fs.existsSync(bridgeInstructionsPath)) {
      return res.status(200).json({ bridgeInstructions: [] });
    }

    const bridgeInstructionsData = fs.readFileSync(bridgeInstructionsPath, 'utf8');
    const bridgeInstructions: string[] = JSON.parse(bridgeInstructionsData);

    return res.status(200).json({ bridgeInstructions });
  } catch (err: any) {
    console.error('Error reading bridge instructions:', err);
    return res.status(500).json({ message: 'Failed to fetch bridge instructions' });
  }
}
