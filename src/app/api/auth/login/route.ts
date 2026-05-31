import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/users";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Ingresa correo y contraseña." },
        { status: 400 }
      );
    }

    const user = await loginUser({ email, password });
    const token = await createSessionToken(user);

    const response = NextResponse.json({ user });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al iniciar sesión.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
