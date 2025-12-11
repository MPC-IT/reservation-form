import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" }
    });

    return res.status(200).json({ companies });
  } catch (err) {
    console.error("Error loading companies:", err);
    return res.status(500).json({ error: "Server error loading companies" });
  } finally {
    await prisma.$disconnect();
  }
}
