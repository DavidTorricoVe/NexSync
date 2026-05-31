import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-edge";

const AUTH_PAGES = ["/login", "/registro"];
const PUBLIC_PAGES = ["/", ...AUTH_PAGES];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register"];

function isPublicApi(pathname: string) {
  return PUBLIC_API.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (PUBLIC_PAGES.includes(pathname)) {
    if (AUTH_PAGES.includes(pathname) && session) {
      return NextResponse.redirect(new URL("/buscar", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
