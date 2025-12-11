// lib/session.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET || "dev_secret_key";

export function createSession(userId: number, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: "7d" });
}

export async function validateSession(req: Request | any) {
  try {
    let token: string | undefined;

    // NextRequest: cookies.get("mpc_session")
    if (req.cookies && typeof req.cookies.get === "function") {
      token = req.cookies.get("mpc_session")?.value;
      console.log('validateSession: NextRequest cookies.get token:', token);
    }

    // NextApiRequest: cookies is a plain object
    if (!token && req.cookies && typeof req.cookies === "object") {
      token = req.cookies["mpc_session"];
      console.log('validateSession: NextApiRequest cookies object token:', token);
    }

    // Fallback: read from cookie header (works for both Request and NextApiRequest)
    if (!token) {
      let cookieHeader: string | undefined;

      if (req.headers) {
        if (typeof req.headers.get === "function") {
          cookieHeader = req.headers.get("cookie") ?? undefined;
        } else if (typeof req.headers === "object") {
          cookieHeader = req.headers.cookie;
        }
      }

      console.log('validateSession: cookieHeader:', cookieHeader);

      if (cookieHeader) {
        const parts = cookieHeader.split(";").map((c: string) => c.trim());
        const found = parts.find((c: string) => c.startsWith("mpc_session="));
        if (found) {
          token = found.split("=")[1];
          console.log('validateSession: extracted token from header:', token);
        }
      }
    }

    if (!token) return null;

    return jwt.verify(token, SECRET) as any;
  } catch (err) {
    console.error('validateSession error:', err);
    return null;
  }
}
