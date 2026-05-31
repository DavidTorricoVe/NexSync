import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "./types";
import { verifySessionToken } from "./session-token";

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
