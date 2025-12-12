import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { ReservationConfirmationData } from '../components/ConfirmationRenderer';
import { ConfirmationHtmlGenerator } from './confirmationHtmlGenerator';

// AWS SES configuration - these should be environment variables in production
const SES_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  from: process.env.EMAIL_FROM || 'leesa@multipointcom.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'leesa@multipointcom.com'
};

export interface EmailServiceOptions {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
}

export class EmailService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient(SES_CONFIG);
  }

  async sendConfirmationEmail(
    data: ReservationConfirmationData, 
    options: EmailServiceOptions
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Generate HTML content using the shared renderer
      const htmlContent = ConfirmationHtmlGenerator.generateEmailHtml(data);
      const textContent = this.generateTextVersion(data);

      // Create the send email command
      const params: SendEmailCommandInput = {
        Source: SES_CONFIG.from,
        Destination: {
          ToAddresses: [options.to],
          CcAddresses: options.cc || [],
          BccAddresses: options.bcc || [],
        },
        Message: {
          Subject: {
            Data: options.subject || 'Your Conference Reservation Confirmation',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textContent,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [SES_CONFIG.replyTo],
      };

      // Send the email using AWS SES
      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);

      return {
        success: true,
        messageId: result.MessageId
      };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      
      // Provide user-friendly error messages based on error type
      let userMessage = 'Failed to send email. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('access') || error.message.includes('credentials')) {
          userMessage = 'Email service authentication failed. Please contact support.';
          console.error('Email authentication error:', error.message);
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
          userMessage = 'Email service is temporarily unavailable. Please try again later.';
          console.error('Email server connection error:', error.message);
        } else if (error.message.includes('recipient') || error.message.includes('address')) {
          userMessage = 'Invalid email address. Please check the recipient email.';
        } else if (error.message.includes('rate limit') || error.message.includes('throttling')) {
          userMessage = 'Too many emails sent. Please wait a moment and try again.';
        } else if (error.message.includes('MessageRejected')) {
          userMessage = 'Email rejected by email service. Please check sender configuration.';
        }
      }
      
      return {
        success: false,
        error: userMessage
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test AWS SES connection by attempting to get send quota
      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      const command = new GetSendQuotaCommand({});
      await this.sesClient.send(command);
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      // Log the specific error for debugging
      if (error instanceof Error) {
        if (error.message.includes('access') || error.message.includes('credentials')) {
          console.error('Email authentication error - check AWS credentials:', error.message);
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
          console.error('Email server connection error - check AWS region:', error.message);
        }
      }
      return false;
    }
  }

  private generateTextVersion(data: ReservationConfirmationData): string {
    const lines: string[] = [];
    
    lines.push('RESERVATION CONFIRMATION');
    lines.push('========================');
    lines.push('');
    
    lines.push('Reservation Details:');
    lines.push(`  Profile Type: ${data.profileType}`);
    lines.push(`  Call Type: ${data.callType}`);
    lines.push(`  Company Name: ${data.companyName}`);
    
    if (data.dealName) {
      lines.push(`  Deal / Reference Name: ${data.dealName}`);
    }
    
    if (data.setupName) {
      lines.push(`  Setup Contact: ${data.setupName}`);
    }
    
    if (data.setupEmail) {
      lines.push(`  Setup Email: ${data.setupEmail}`);
    }
    
    lines.push('');
    
    if (data.callDate || data.startTime) {
      lines.push('Call Schedule:');
      if (data.callDate) lines.push(`  Date: ${data.callDate}`);
      if (data.startTime) lines.push(`  Time: ${data.startTime}${data.timeZone ? ` (${data.timeZone})` : ''}`);
      if (data.duration) lines.push(`  Duration: ${data.duration}`);
      if (data.host) lines.push(`  Host: ${data.host}`);
      lines.push('');
    }
    
    if (data.hostPasscode || data.guestPasscode || data.conferenceId || data.dialInNumbers) {
      lines.push('Access Information:');
      if (data.dialInNumbers) {
        lines.push(`  Dial-In Numbers:`);
        data.dialInNumbers.split('\n').forEach(line => {
          if (line.trim()) lines.push(`    ${line.trim()}`);
        });
      }
      if (data.internationalDialInNumbers) {
        lines.push(`  International Dial-In Numbers:`);
        data.internationalDialInNumbers.split('\n').forEach(line => {
          if (line.trim()) lines.push(`    ${line.trim()}`);
        });
      }
      if (data.speakerDialInNumbers) {
        lines.push(`  Speaker Dial-In Numbers:`);
        data.speakerDialInNumbers.split('\n').forEach(line => {
          if (line.trim()) lines.push(`    ${line.trim()}`);
        });
      }
      if (data.participantDialInNumbers) {
        lines.push(`  Participant Dial-In Numbers:`);
        data.participantDialInNumbers.split('\n').forEach(line => {
          if (line.trim()) lines.push(`    ${line.trim()}`);
        });
      }
      if (data.hostPasscode) lines.push(`  Host Passcode: ${data.hostPasscode}`);
      if (data.guestPasscode) lines.push(`  Guest Passcode: ${data.guestPasscode}`);
      if (data.conferenceId) lines.push(`  Conference ID: ${data.conferenceId}`);
      if (data.reservationId) lines.push(`  Reservation ID: ${data.reservationId}`);
      lines.push('');
    }
    
    if (data.speakerDirectAccessLink || data.participantDirectAccessLink) {
      lines.push('Access Links:');
      if (data.speakerDirectAccessLink) lines.push(`  Speaker Direct Access: ${data.speakerDirectAccessLink}`);
      if (data.participantDirectAccessLink) lines.push(`  Participant Direct Access: ${data.participantDirectAccessLink}`);
      if (data.multiviewAccessLink) lines.push(`  Multiview Access: ${data.multiviewAccessLink}`);
      if (data.replayAccessLink) lines.push(`  Replay Access: ${data.replayAccessLink}`);
      lines.push('');
    }
    
    if (data.conferenceReplay === 'Yes' || data.multiview === 'Yes') {
      lines.push('Replay Information:');
      if (data.conferenceReplay === 'Yes') {
        lines.push('  Conference Replay: Enabled');
        if (data.replayFromDate) lines.push(`    From: ${data.replayFromDate}`);
        if (data.replayToDate) lines.push(`    To: ${data.replayToDate}`);
        if (data.replayEndTime) lines.push(`    End Time: ${data.replayEndTime}`);
        if (data.replayTimeZone) lines.push(`    Time Zone: ${data.replayTimeZone}`);
        if (data.replayCode) lines.push(`    Replay Code: ${data.replayCode}`);
      }
      if (data.multiview === 'Yes') {
        lines.push('  Multiview: Enabled');
        if (data.multiviewUsername) lines.push(`    Username: ${data.multiviewUsername}`);
        if (data.multiviewConferenceNumber) lines.push(`    Conference Number: ${data.multiviewConferenceNumber}`);
      }
      lines.push('');
    }
    
    if (data.profileType === 'Assisted' || data.profileType === 'Passcode') {
      lines.push('Important Notices:');
      if (data.profileType === 'Assisted') {
        lines.push('  - Direct Access links have been provided for your invitation');
        lines.push('  - Ensure correct links are provided to the correct parties');
        lines.push('  - This prevents participants joining speaker sub-conferences early');
      }
      lines.push('  - For Auditorium calls: Provide speaker dial-in numbers and conference ID to technician');
      lines.push('    for main feed line connection to conferencing bridge');
      lines.push('');
    }
    
    lines.push('This message was generated by the Reservation Form system.');
    lines.push('If you have any questions, please contact your conference coordinator.');
    
    return lines.join('\n');
  }
}

// Singleton instance for the application
export const emailService = new EmailService();
