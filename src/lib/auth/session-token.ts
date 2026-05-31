import { SignJWT, jwtVerify } from "jose";
import type { AuthUser } from "./types";
import { SESSION_MAX_AGE } from "./types";

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    return new TextEncoder().encode("recursolink-dev-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    companyName: user.companyName,
    sector: user.sector,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.id || !payload.email) return null;

    return {
      id: String(payload.id),
      email: String(payload.email),
      companyName: String(payload.companyName ?? ""),
      sector: (payload.sector as AuthUser["sector"]) ?? "industria",
      createdAt: "",
    };
  } catch {
    return null;
  }
}
