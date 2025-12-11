// pages/api/bridge-instructions/list.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const bridgeInstructionsPath = path.join(process.cwd(), 'data', 'bridge-instructions.json');
    
    if (!fs.existsSync(bridgeInstructionsPath)) {
      return res.status(200).json({ bridgeInstructions: [] });
    }

    const bridgeInstructionsData = fs.readFileSync(bridgeInstructionsPath, 'utf8');
    const bridgeInstructions: string[] = JSON.parse(bridgeInstructionsData);

    // Convert to the format expected by the frontend
    const formattedBridgeInstructions = bridgeInstructions.map((name, index) => ({
      id: index + 1,
      name
    }));

    return res.status(200).json({ bridgeInstructions: formattedBridgeInstructions });
  } catch (err: any) {
    console.error('Error reading bridge instructions:', err);
    return res.status(500).json({ message: 'Failed to fetch bridge instructions' });
  }
}
