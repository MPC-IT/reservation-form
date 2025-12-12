// lib/formatEmail.ts

export type ReservationEmailData = {
  profileType: string;
  callType: string;
  companyName: string;

  dealName?: string;
  setupName?: string;
  setupEmail?: string;

  callDate?: string;
  startTime?: string;
  timeZone?: string;

  hostPasscode?: string;
  guestPasscode?: string;

  conferenceId?: string;
  notes?: string;
  
  // Passcode specific fields
  dialInNumbers?: string;
  internationalDialInNumbers?: string;
  reservationId?: string;
  participants?: string;
  bridgeInstructions?: string;
  
  // Assisted specific fields
  speakerDirectAccessLink?: string;
  speakerDialInNumbers?: string;
  speakerInternationalDialInNumbers?: string;
  participantDirectAccessLink?: string;
  participantDialInNumbers?: string;
  participantInternationalDialInNumbers?: string;
  
  // Multiview and Replay
  multiview?: string;
  multiviewAccessLink?: string;
  conferenceReplay?: string;
  replayAccessLink?: string;
  
  // Additional fields
  host?: string;
  duration?: string;
  referenceName?: string;
};

/**
 * Builds an HTML email body for a reservation.
 */
export function formatHtmlEmail(res: ReservationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <div style="max-width: 700px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1f2a44 0%, #2c3e50 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">Reservation Confirmation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your conference call has been scheduled</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          
          <!-- Basic Info -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2a44; border-bottom: 2px solid #e1e8ed; padding-bottom: 10px; margin-bottom: 20px;">Reservation Details</h2>
            
            <table cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Profile Type</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.profileType}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Call Type</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.callType}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Company Name</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.companyName}</td>
              </tr>
              ${res.dealName ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Deal / Reference Name</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.dealName}</td>
              </tr>` : ''}
              ${res.setupName ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Setup Contact</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.setupName}</td>
              </tr>` : ''}
              ${res.setupEmail ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Setup Email</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.setupEmail}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Date & Time -->
          ${(res.callDate || res.startTime || res.timeZone) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2a44; border-bottom: 2px solid #e1e8ed; padding-bottom: 10px; margin-bottom: 20px;">Schedule</h2>
            <table cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
              ${res.callDate ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Date</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.callDate}</td>
              </tr>` : ''}
              ${res.startTime ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Time</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.startTime}${res.timeZone ? ` (${res.timeZone})` : ""}</td>
              </tr>` : ''}
              ${res.duration ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Duration</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.duration}</td>
              </tr>` : ''}
              ${res.host ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Host</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.host}</td>
              </tr>` : ''}
            </table>
          </div>` : ''}

          <!-- Access Information -->
          ${(res.hostPasscode || res.guestPasscode || res.dialInNumbers || res.speakerDirectAccessLink) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2a44; border-bottom: 2px solid #e1e8ed; padding-bottom: 10px; margin-bottom: 20px;">Access Information</h2>
            
            ${res.dialInNumbers ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Dial-In Numbers</h3>
              <div style="background: #e8f4fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; user-select: all;">
                ${res.dialInNumbers.replace(/\n/g, '<br>')}
              </div>
            </div>` : ''}
            
            ${res.internationalDialInNumbers ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">International Dial-In Numbers</h3>
              <div style="background: #e8f4fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; user-select: all;">
                ${res.internationalDialInNumbers.replace(/\n/g, '<br>')}
              </div>
            </div>` : ''}
            
            ${res.speakerDialInNumbers ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Speaker Dial-In Numbers</h3>
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; user-select: all;">
                ${res.speakerDialInNumbers.replace(/\n/g, '<br>')}
              </div>
            </div>` : ''}
            
            ${res.participantDialInNumbers ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Participant Dial-In Numbers</h3>
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; user-select: all;">
                ${res.participantDialInNumbers.replace(/\n/g, '<br>')}
              </div>
            </div>` : ''}
            
            <table cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
              ${res.hostPasscode ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Host Passcode</td>
                <td style="background: #ffebee; border-left: 4px solid #f44336; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; user-select: all;">${res.hostPasscode}</td>
              </tr>` : ''}
              ${res.guestPasscode ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Guest Passcode</td>
                <td style="background: #ffebee; border-left: 4px solid #f44336; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; user-select: all;">${res.guestPasscode}</td>
              </tr>` : ''}
              ${res.conferenceId ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Conference ID</td>
                <td style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; user-select: all;">${res.conferenceId}</td>
              </tr>` : ''}
              ${res.reservationId ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Reservation ID</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.reservationId}</td>
              </tr>` : ''}
            </table>
          </div>` : ''}

          <!-- Access Links -->
          ${(res.speakerDirectAccessLink || res.participantDirectAccessLink || res.multiviewAccessLink || res.replayAccessLink) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2a44; border-bottom: 2px solid #e1e8ed; padding-bottom: 10px; margin-bottom: 20px;">Access Links</h2>
            
            ${res.speakerDirectAccessLink ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Speaker Direct Access Link</h3>
              <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 15px; border-radius: 4px;">
                <a href="${res.speakerDirectAccessLink}" style="color: #9c27b0; text-decoration: none; font-weight: 600; user-select: all;">${res.speakerDirectAccessLink}</a>
              </div>
            </div>` : ''}
            
            ${res.participantDirectAccessLink ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Participant Direct Access Link</h3>
              <div style="background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 15px; border-radius: 4px;">
                <a href="${res.participantDirectAccessLink}" style="color: #9c27b0; text-decoration: none; font-weight: 600; user-select: all;">${res.participantDirectAccessLink}</a>
              </div>
            </div>` : ''}
            
            ${res.multiview === 'Yes' && res.multiviewAccessLink ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Multiview Access Link</h3>
              <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; border-radius: 4px;">
                <a href="${res.multiviewAccessLink}" style="color: #1976d2; text-decoration: none; font-weight: 600; user-select: all;">${res.multiviewAccessLink}</a>
              </div>
            </div>` : ''}
            
            ${res.conferenceReplay === 'Yes' && res.replayAccessLink ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 16px;">Conference Replay Link</h3>
              <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; border-radius: 4px;">
                <a href="${res.replayAccessLink}" style="color: #4caf50; text-decoration: none; font-weight: 600; user-select: all;">${res.replayAccessLink}</a>
              </div>
            </div>` : ''}
          </div>` : ''}

          <!-- Additional Information -->
          ${(res.participants || res.bridgeInstructions || res.referenceName || res.notes) ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2a44; border-bottom: 2px solid #e1e8ed; padding-bottom: 10px; margin-bottom: 20px;">Additional Information</h2>
            <table cellpadding="12" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
              ${res.participants ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Number of Participants</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.participants}</td>
              </tr>` : ''}
              ${res.bridgeInstructions ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Bridge Instructions</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.bridgeInstructions}</td>
              </tr>` : ''}
              ${res.referenceName ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Reference Name</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.referenceName}</td>
              </tr>` : ''}
              ${res.notes ? `
              <tr>
                <td style="font-weight: 600; color: #555; width: 180px; vertical-align: top;">Notes</td>
                <td style="background: #f8f9fa; padding: 12px; border-radius: 4px;">${res.notes}</td>
              </tr>` : ''}
            </table>
          </div>` : ''}

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e8ed;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            This message was generated by the Reservation Form system.<br>
            If you have any questions, please contact your conference coordinator.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}
