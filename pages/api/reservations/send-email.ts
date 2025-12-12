import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../lib/emailService';
import { ReservationConfirmationData } from '../../../components/ConfirmationRenderer';
import { ConfirmationHtmlGenerator } from '../../../lib/confirmationHtmlGenerator';
import { validateSession } from '../../../lib/session';
import { logEmailSent, logEmailFailed } from '../../../lib/auditLogger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate session for audit logging
  let session: any = null;
  try {
    session = await validateSession(req);
  } catch (sessionError) {
    // Continue without session for audit logging, but log the error
    console.error('Session validation failed:', sessionError);
  }
  
  const userId = session?.userId;
  const userEmail = session?.userEmail || 'unknown';

  try {
    const { 
      reservationData, 
      recipientEmail, 
      ccEmails, 
      bccEmails, 
      subject 
    }: {
      reservationData: ReservationConfirmationData;
      recipientEmail: string;
      ccEmails?: string[];
      bccEmails?: string[];
      subject?: string;
    } = req.body;

    // Validate required fields
    if (!reservationData || !recipientEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: reservationData and recipientEmail are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ 
        error: 'Invalid recipient email format' 
      });
    }

    // Validate CC emails if provided
    if (ccEmails && ccEmails.length > 0) {
      for (const email of ccEmails) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            error: `Invalid CC email format: ${email}` 
          });
        }
      }
    }

    // Validate BCC emails if provided
    if (bccEmails && bccEmails.length > 0) {
      for (const email of bccEmails) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            error: `Invalid BCC email format: ${email}` 
          });
        }
      }
    }

    // Test email service connection (optional but good practice)
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return res.status(500).json({ 
        error: 'Email service is not available. Please check your email configuration.' 
      });
    }

    // Send the email
    const result = await emailService.sendConfirmationEmail(reservationData, {
      to: recipientEmail,
      cc: ccEmails,
      bcc: bccEmails,
      subject: subject || 'Your Conference Reservation Confirmation'
    });

    if (result.success) {
      // Audit logging for successful email send (non-blocking)
      // This logs the email action for compliance and tracking purposes
      if (userId && reservationData?.reservationId) {
        logEmailSent(
          parseInt(reservationData.reservationId),
          userId,
          userEmail,
          recipientEmail,
          ccEmails || [],
          subject || 'Your Conference Reservation Confirmation'
        ).catch(error => {
          // Audit logging failures should never impact the user experience
          console.error('Failed to log email sent:', error);
        });
      }

      return res.status(200).json({ 
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      // Audit logging for failed email send (non-blocking)
      // This logs the email failure for compliance and tracking purposes
      if (userId && reservationData?.reservationId) {
        logEmailFailed(
          parseInt(reservationData.reservationId),
          userId,
          userEmail,
          recipientEmail,
          ccEmails || [],
          result.error || 'Unknown email error',
          subject || 'Your Conference Reservation Confirmation'
        ).catch(error => {
          // Audit logging failures should never impact the user experience
          console.error('Failed to log email failure:', error);
        });
      }

      return res.status(500).json({ 
        error: 'Failed to send confirmation email',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in send-email API:', error);
    
    // Audit logging for general email send errors (non-blocking)
    // This logs unexpected errors for compliance and tracking purposes
    // Note: We can't access reservationData here due to scope, so we'll log without reservation ID
    if (userId) {
      logEmailFailed(
        0, // No reservation ID available in this scope
        userId,
        userEmail,
        'unknown', // recipientEmail not available in this scope
        [], // ccEmails not available in this scope
        error instanceof Error ? error.message : 'Unknown error occurred',
        'Email Send Error' // Generic subject for error cases
      ).catch(auditError => {
        // Audit logging failures should never impact the user experience
        console.error('Failed to log email error:', auditError);
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
