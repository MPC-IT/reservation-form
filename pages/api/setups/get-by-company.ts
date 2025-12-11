import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { companyId } = req.query;

  if (!companyId || typeof companyId !== "string") {
    return res.status(400).json({ error: "Company ID is required" });
  }

  try {
    const setups = await prisma.setup.findMany({
      where: {
        companyId: parseInt(companyId),
      },
      include: {
        company: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(setups);
  } catch (error) {
    console.error("Error fetching setups:", error);
    res.status(500).json({ error: "Failed to fetch setups" });
  }
}
