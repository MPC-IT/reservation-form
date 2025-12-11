import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
      include: { company: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
