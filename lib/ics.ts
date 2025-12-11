export function buildICS(profile: any) {
  const dtStart = profile.callDate && profile.startTime
    ? profile.callDate.replace(/-/g, "") + "T" + profile.startTime.replace(":", "") + "00"
    : "";

  const dtEnd = dtStart; // simple – you can extend duration later

  const summary = `${profile.profileType} – ${profile.callType}`;
  const description = [
    `Company: ${profile.company?.name || ""}`,
    profile.dealName ? `Deal: ${profile.dealName}` : "",
    profile.conferenceId ? `Conference ID: ${profile.conferenceId}` : "",
    profile.guestPasscode ? `Guest Passcode: ${profile.guestPasscode}` : "",
    "",
    profile.notes || "",
  ]
    .filter(Boolean)
    .join("\\n");

  const uid = `reservation-${profile.id}@reservation-creator`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Multipoint Communications//Reservation Creator//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    dtStart && `DTSTART:${dtStart}`,
    dtEnd && `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
