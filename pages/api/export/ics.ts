import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing reservation ID");
  }

  const reservation = await prisma.profile.findUnique({
    where: { id: Number(id) },
  });

  if (!reservation) {
    return res.status(404).send("Reservation not found");
  }

  const {
    companyName,
    profileType,
    callType,
    dealName,
    callDate,
    startTime,
    timeZone,
    conferenceId,
    hostPasscode,
    guestPasscode,
  } = reservation;

  const dtStart = `${callDate}T${startTime.replace(":", "")}00`;
  const dtEnd = `${callDate}T${String(Number(startTime.split(":")[0]) + 1).padStart(2, "0")}${startTime.split(":")[1]}00`;

  const description = `
Company: ${companyName}
Call Type: ${profileType} - ${callType}
Deal: ${dealName || "N/A"}
Conference ID: ${conferenceId || "N/A"}
Host Passcode: ${hostPasscode || "N/A"}
Guest Passcode: ${guestPasscode || "N/A"}
  `;

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Multipoint Communications//Reservation Creator//EN
BEGIN:VEVENT
UID:${id}@multipointcom.com
DTSTAMP:${dtStart}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${companyName} Reservation – ${callType}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
END:VEVENT
END:VCALENDAR
`;

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=reservation-${id}.ics`);
  return res.send(ics);
}
