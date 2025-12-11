import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { callType } = req.query;

  try {
    const profiles = await prisma.profile.findMany({
      where: callType ? { callType: String(callType) } : {},
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ profiles });
  } catch (err) {
    console.error("Error listing profiles:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
