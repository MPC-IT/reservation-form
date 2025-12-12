// pages/api/export/email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateEmailHtml } from '../../../lib/email-template';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const formData = req.body;
    
    // Generate HTML email
    const htmlEmail = generateEmailHtml(formData);
    
    // Set response headers for HTML download
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reservation-confirmation-${Date.now()}.html"`);
    
    res.status(200).send(htmlEmail);
  } catch (err: any) {
    console.error('Email export error:', err);
    res.status(500).json({ message: 'Failed to generate email export' });
  }
}
