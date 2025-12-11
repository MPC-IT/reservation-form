import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Company name is required" });
    }

    const existing = await prisma.company.findUnique({ where: { name } });

    if (existing) {
      return res.status(409).json({ error: "Company already exists" });
    }

    const company = await prisma.company.create({
      data: { name },
    });

    return res.status(200).json(company);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error creating company" });
  }
}
