import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Missing id or status" });
    }

    const allowed = [
      "Draft",
      "Pending Confirmation",
      "Confirmed",
      "Completed",
      "TBD",
      "Cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await prisma.profile.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ profile: updated });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
