import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      id,
      profileType,
      callType,
      companyName,
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

    if (!id) {
      return res.status(400).json({ error: "Missing reservation ID." });
    }

    const profile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        profileType,
        callType,
        companyName,
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
      },
    });

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
