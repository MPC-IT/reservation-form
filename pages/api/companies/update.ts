import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, name } = req.body;

    if (!id || !name.trim()) {
      return res.status(400).json({ error: "Invalid update request" });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error updating company" });
  }
}
