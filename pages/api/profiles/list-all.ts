import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ profiles });
  } catch (err) {
    console.error("Error listing profiles:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
