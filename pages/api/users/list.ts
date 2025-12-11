import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error loading users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
