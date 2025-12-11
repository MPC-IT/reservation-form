import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      profileType,
      callType,
      companyId,
      dealName,
      setupName,
      setupEmail,
      callDate,
      startTime,
      timeZone,
      hostPasscode,
      guestPasscode,
      conferenceId,
      notes,
    } = req.body;

    if (!profileType || !callType || !companyId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Get company name for the profile
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) }
    });

    if (!company) {
      return res.status(400).json({ error: "Company not found." });
    }

    const profile = await prisma.profile.create({
      data: {
        profileType,
        callType,
        companyName: company.name,
        companyId: Number(companyId),
        dealName: dealName || null,
        setupName: setupName || null,
        setupEmail: setupEmail || null,
        callDate: callDate || null,
        startTime: startTime || null,
        timeZone: timeZone || null,
        hostPasscode: hostPasscode || null,
        guestPasscode: guestPasscode || null,
        conferenceId: conferenceId || null,
        notes: notes || null,

        // When user hits Save, treat as Pending Confirmation
        status: "Pending Confirmation",
      },
    });

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Error creating profile:", err);
    return res.status(500).json({ error: "Failed to create reservation" });
  }
}
