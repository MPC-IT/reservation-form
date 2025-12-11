import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { setupId } = req.query;

  if (!setupId || typeof setupId !== "string") {
    return res.status(400).json({ error: "Setup ID is required" });
  }

  try {
    const teamCalls = await prisma.teamCall.findMany({
      where: {
        setupId: parseInt(setupId),
      },
      include: {
        setup: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(teamCalls);
  } catch (error) {
    console.error("Error fetching team calls:", error);
    res.status(500).json({ error: "Failed to fetch team calls" });
  }
}
