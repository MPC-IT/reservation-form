export function formatHtmlEmail(res) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2 style="color:#1f2a44;">Reservation Details</h2>
    <p><strong>Company:</strong> ${res.companyName}</p>
    <p><strong>Call Type:</strong> ${res.profileType} – ${res.callType}</p>
    <p><strong>Deal / Reference:</strong> ${res.dealName || "N/A"}</p>
    <p><strong>Date:</strong> ${res.callDate || "N/A"}</p>
    <p><strong>Time:</strong> ${res.startTime || "N/A"} (${res.timeZone || "CT"})</p>

    ${
      res.profileType === "Assisted"
        ? `<p><strong>Conference ID:</strong> ${res.conferenceId}</p>`
        : `
          <p><strong>Host Passcode:</strong> ${res.hostPasscode}</p>
          <p><strong>Guest Passcode:</strong> ${res.guestPasscode}</p>
        `
    }

    <br/>
    <p><strong>Notes:</strong><br>${res.notes || "None provided"}</p>
  </div>
  `;
}

export function formatPlainTextEmail(res) {
  return `
Reservation Details
------------------------------
Company: ${res.companyName}
Call Type: ${res.profileType} – ${res.callType}
Deal / Reference: ${res.dealName || "N/A"}
Date: ${res.callDate || "N/A"}
Time: ${res.startTime || "N/A"} (${res.timeZone || "CT"})

${
  res.profileType === "Assisted"
    ? `Conference ID: ${res.conferenceId}`
    : `Host Passcode: ${res.hostPasscode}
Guest Passcode: ${res.guestPasscode}`
}

Notes:
${res.notes || "None"}
`;
}
