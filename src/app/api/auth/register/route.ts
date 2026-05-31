import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/users";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import type { Sector } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, companyName, sector } = body as {
      email: string;
      password: string;
      confirmPassword: string;
      companyName: string;
      sector: Sector;
    };

    if (!email || !password || !companyName || !sector) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    const user = await registerUser({ email, password, companyName, sector });
    const token = await createSessionToken(user);

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrarse.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
