// lib/auth.ts
import prisma from "./prisma";
import bcrypt from "bcryptjs";

/**
 * Validates email + password against Prisma user table
 */
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return { id: user.id, name: user.name, role: user.role };
}
