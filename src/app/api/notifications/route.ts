import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getNotificationsForUser,
  markAllRead,
  markNotificationRead,
} from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const notifications = getNotificationsForUser(session.id);
  const unread = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unread });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const { id, markAll } = body as { id?: string; markAll?: boolean };

  if (markAll) {
    markAllRead(session.id);
    return NextResponse.json({ ok: true });
  }

  if (id && markNotificationRead(id, session.id)) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Notificación no encontrada." }, { status: 404 });
}
