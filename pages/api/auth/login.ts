// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateUser } from "../../../lib/auth";
import { createSession } from "../../../lib/session";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;

  const user = await authenticateUser(email, password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = createSession(user.id, user.role);

  res.setHeader(
    "Set-Cookie",
    serialize("mpc_session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })
  );

  res.status(200).json({ success: true, user });
}
