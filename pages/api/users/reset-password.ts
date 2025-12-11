import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, newPassword } = req.body;

    if (!id || !newPassword) {
      return res.status(400).json({ error: "User id and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id },
      data: { password: hash },
    });

    return res.status(200).json({ user: updated });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
