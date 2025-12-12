import { NextApiRequest, NextApiResponse } from 'next';
import { ConfirmationHtmlGenerator } from '../../../lib/confirmationHtmlGenerator';
import { ReservationConfirmationData } from '../../../components/ConfirmationRenderer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const reservationData: ReservationConfirmationData = req.body;
    
    // Generate HTML email content using the shared renderer
    const emailHtml = ConfirmationHtmlGenerator.generateEmailHtml(reservationData);
    
    // Set appropriate headers for HTML file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="reservation-confirmation-${reservationData.reservationId || 'new'}.html"`);
    
    return res.status(200).send(emailHtml);
  } catch (error) {
    console.error('Error generating email:', error);
    return res.status(500).json({ error: 'Failed to generate email' });
  }
}
