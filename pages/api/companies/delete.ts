import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "Missing company ID" });

    await prisma.company.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting company:", err);
    return res.status(500).json({ error: "Could not delete company" });
  }
}
