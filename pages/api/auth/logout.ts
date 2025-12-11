// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    serialize("mpc_session", "", {
      path: "/",
      expires: new Date(0),
    })
  );

  res.status(200).json({ success: true });
}
