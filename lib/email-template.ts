// lib/email-template.ts

export interface EmailData {
  profileType: string;
  callType: string;
  [key: string]: any;
}

interface Field {
  label: string;
  value: any;
}

export function generateEmailHtml(data: EmailData): string {
  const directAccessNote = `
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; color: #856404; font-weight: bold;">Please note that we have provided the following Direct Access links to your Invite:</p>
      <ul style="margin: 10px 0; color: #856404;">
        <li>Speaker Direct Access Link</li>
        <li>Participant Direct Access Link</li>
      </ul>
      <p style="margin: 0; color: #856404;">It is imperative that the correct Direct Access link is provided to the correct intended party to avoid Participants joining the Speaker Sub Conference prior to call start time.</p>
    </div>
  `;

  const sections: { [key: string]: Field[] } = {};

  // Build sections based on call type
  if (data.profileType === 'Assisted') {
    buildAssistedSections(sections, data);
  } else if (data.profileType === 'Passcode') {
    buildPasscodeSections(sections, data);
  }

  // Generate HTML sections
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: #007bff; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 15px; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; color: #495057; }
        .field-value { color: #212529; }
        .required { color: #dc3545; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reservation Confirmation</h1>
          <p>Thank you for your reservation. Here are your conference details:</p>
        </div>
  `;

  // Add direct access note for assisted calls
  if (data.profileType === 'Assisted') {
    html += directAccessNote;
  }

  // Add all sections
  for (const [sectionTitle, fields] of Object.entries(sections)) {
    html += `
      <div class="section">
        <div class="section-title">${sectionTitle}</div>
    `;
    
    for (const field of fields) {
      html += `
        <div class="field">
          <span class="field-label">${field.label}:</span>
          <span class="field-value">${field.value || 'N/A'}</span>
        </div>
      `;
    }
    
    html += `</div>`;
  }

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

function buildAssistedSections(sections: { [key: string]: Field[] }, data: EmailData) {
  // SETUP DETAILS
  sections['SETUP DETAILS'] = [
    { label: 'Company Name', value: data.companyName },
    { label: 'Setup Name', value: data.setupName },
    { label: 'Setup Email', value: data.setupEmail },
  ];

  // Conference call details (dynamic title based on call type)
  const callDetailsTitle = getCallDetailsTitle(data.callType);
  sections[callDetailsTitle] = [
    { label: 'Deal/Reference Name', value: data.dealReferenceName },
    { label: 'Date', value: data.callDate },
    { label: 'Time', value: data.startTime },
    { label: 'Time Zone', value: data.timeZone },
    { label: 'Host', value: data.host },
    { label: 'Duration', value: data.duration },
  ];

  // Speaker invitation details (dynamic title)
  const speakerTitle = getSpeakerTitle(data.callType);
  sections[speakerTitle] = [
    { label: 'Speaker Team Direct Access Link', value: data.speakerDirectAccessLink },
    { label: 'Speaker Team Dial-In Numbers', value: formatMultiLine(data.speakerDialInNumbers) },
    { label: 'Speaker Team International Dial-In Numbers', value: formatMultiLine(data.speakerInternationalDialInNumbers) },
    { label: 'Speaker Team Conference ID', value: data.speakerConferenceId },
  ];

  // Participant invitation details (dynamic title)
  const participantTitle = getParticipantTitle(data.callType);
  sections[participantTitle] = [
    { label: 'Participant Direct Access Link', value: data.participantDirectAccessLink },
    { label: 'Participant Dial-In Numbers', value: formatMultiLine(data.participantDialInNumbers) },
    { label: 'Participant International Dial-In Numbers', value: formatMultiLine(data.participantInternationalDialInNumbers) },
    { label: 'Participant Conference ID', value: data.participantConferenceId },
  ];

  // Add Listen Only section for Management Teach In
  if (data.callType === 'Management Teach In') {
    sections['MANAGEMENT LISTEN ONLY PARTICIPANT INVITATION DETAILS'] = [
      { label: 'Listen Only Direct Access Link', value: data.listenOnlyDirectAccessLink },
      { label: 'Listen Only Dial-In Numbers', value: formatMultiLine(data.listenOnlyDialInNumbers) },
      { label: 'Listen Only International Dial-In Numbers', value: formatMultiLine(data.listenOnlyInternationalDialInNumbers) },
      { label: 'Listen Only Conference ID', value: data.listenOnlyConferenceId },
    ];
  }

  // Conference Replay
  if (data.conferenceReplay === 'Yes') {
    sections['CONFERENCE REPLAY'] = [
      { label: 'From Date', value: data.replayFromDate },
      { label: 'To Date', value: data.replayToDate },
      { label: 'End Time', value: data.replayEndTime },
      { label: 'Time Zone', value: data.replayTimeZone },
      { label: 'Conference Replay Direct Access Link', value: 'https://replay-dev.multipointcom.com/play-back' },
      { label: 'Conference Replay Code', value: data.replayCode },
    ];
  }

  // Multiview Details
  if (data.multiview === 'Yes') {
    sections['MULTIVIEW DETAILS'] = [
      { label: 'MultiView Access Link', value: 'http://mv1.multipointcom.com' },
      { label: 'Username', value: data.multiviewUsername },
      { label: 'Conference Number', value: data.multiviewConferenceNumber },
    ];
  }

  // Conference Coordinator Details
  const coordinatorFields = [
    { label: 'Reservation ID', value: data.reservationId },
    { label: 'Number of Participants', value: data.participants },
  ];

  // Add call-type specific coordinator fields
  if (data.callType === 'Management Teach In') {
    coordinatorFields.push({ label: 'Listen Only Bridge Name', value: data.listenOnlyBridgeName });
  } else if (data.callType === 'Analyst Teach In') {
    coordinatorFields.push({ label: 'Replay Participant List Recipient Email', value: data.replayParticipantListRecipientEmail });
    coordinatorFields.push({ label: 'Other', value: data.other });
  }

  // Add conditional coordinator fields
  if (data.participantList === 'Yes') {
    coordinatorFields.push({ label: 'Participant List Information', value: data.participantListInformation });
    coordinatorFields.push({ label: 'Participant List Recipient Email', value: data.participantListRecipientEmail });
  }

  if (data.operatorScript === 'Yes') {
    coordinatorFields.push({ label: 'Operator Script Verbiage', value: formatMultiLine(data.operatorScriptVerbiage) });
  }

  coordinatorFields.push(
    { label: 'Conference MP3', value: data.conferenceMP3 },
    { label: 'Conference Transcript', value: data.conferenceTranscript }
  );

  if (data.conferenceTranscript === 'Yes') {
    coordinatorFields.push({ label: 'Turnaround Time', value: data.turnaroundTime });
  }

  coordinatorFields.push({ label: 'QA', value: data.qa });

  if (data.qa === 'Yes') {
    coordinatorFields.push({ label: 'QA Specific Order of Questions', value: data.qaSpecificOrder });
  }

  sections['CONFERENCE COORDINATOR DETAILS'] = coordinatorFields;

  // Add hints sections for specific call types
  if (data.callType === 'Management Teach In') {
    sections['EVENT MEET HELPFUL HINTS'] = [
      { label: 'Note', value: 'Listen Only Link Bridge Name to be: RES ID-LO-COMPANY NAME/CALL NAME (max 30 characters)' },
      { label: 'Note', value: 'Activate MAIN Side Event Meet Link on bridge BEFORE Listen Only Side' },
      { label: 'Note', value: 'Ensure the Replay, Transcript and MP3 information is uploaded to this portal' },
    ];
  }
}

function buildPasscodeSections(sections: { [key: string]: Field[] }, data: EmailData) {
  // SETUP DETAILS
  sections['SETUP DETAILS'] = [
    { label: 'Company Name', value: data.companyName },
    { label: 'Setup Name', value: data.setupName },
    { label: 'Setup Email', value: data.setupEmail },
  ];

  // PASSCODE INVITATION DETAILS
  sections['PASSCODE INVITATION DETAILS'] = [
    { label: 'Date', value: data.callDate },
    { label: 'Time', value: data.startTime },
    { label: 'Time Zone', value: data.timeZone },
    { label: 'Host', value: data.host },
    { label: 'Duration', value: data.duration },
    { label: 'Dial-In Numbers', value: formatMultiLine(data.dialInNumbers) },
    { label: 'International Dial-In Numbers', value: formatMultiLine(data.internationalDialInNumbers) },
    { label: 'Host Passcode', value: data.hostPasscode },
    { label: 'Guest Passcode', value: data.guestPasscode },
  ];

  // Conference Coordinator Details
  const coordinatorFields = [
    { label: 'Reservation ID', value: data.reservationId },
    { label: 'Number of Participants', value: data.participants },
    { label: 'Bridge Instructions', value: data.bridgeInstructions },
  ];

  sections['CONFERENCE COORDINATOR DETAILS'] = coordinatorFields;

  // Helpful Hints
  sections['HELPFUL HINTS'] = [
    { label: 'Note', value: 'Dial-In Numbers: Add Dedicated Dial In Number assigned to call details onto the bridge' },
    { label: 'Note', value: 'Direct Access (EM Link) Dial into using link to test' },
    { label: 'Note', value: 'Conference Record and Playback: Ensure the Replay, Transcript and MP3 information is uploaded to this portal' },
  ];
}

function getCallDetailsTitle(callType: string): string {
  const titles: { [key: string]: string } = {
    'Investor Call': 'INVESTOR - FULLY MONITORED CONFERENCE CALL DETAILS',
    'Standard QA': 'FULLY MONITORED CONFERENCE CALL DETAILS',
    'Management Teach In': 'MANAGEMENT FULLY MONITORED CONFERENCE CALL DETAILS',
    'Analyst Teach In': 'ANALYST - FULLY MONITORED CONFERENCE CALL DETAILS',
    'Team Call': 'TEAM CALL CONFERENCE DETAILS',
  };
  return titles[callType] || 'CONFERENCE CALL DETAILS';
}

function getSpeakerTitle(callType: string): string {
  const titles: { [key: string]: string } = {
    'Investor Call': 'INVESTOR SPEAKER INVITATION DETAILS',
    'Standard QA': 'SPEAKER INVITATION DETAILS',
    'Management Teach In': 'MANAGEMENT SPEAKER INVITATION DETAILS',
    'Analyst Teach In': 'ANALYST SPEAKER INVITATION DETAILS',
    'Team Call': 'COMMITTEE SPEAKER INVITATION DETAILS',
  };
  return titles[callType] || 'SPEAKER INVITATION DETAILS';
}

function getParticipantTitle(callType: string): string {
  const titles: { [key: string]: string } = {
    'Investor Call': 'INVESTOR PARTICIPANT INVITATION DETAILS',
    'Standard QA': 'PARTICIPANT INVITATION DETAILS',
    'Management Teach In': 'MANAGEMENT PARTICIPANT INVITATION DETAILS',
    'Analyst Teach In': 'ANALYST PARTICIPANT INVITATION DETAILS',
    'Team Call': 'TEAM PARTICIPANT INVITATION DETAILS',
  };
  return titles[callType] || 'PARTICIPANT INVITATION DETAILS';
}

function formatMultiLine(text: string | undefined): string {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}
