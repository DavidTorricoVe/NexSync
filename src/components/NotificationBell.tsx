"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Check, FileText, Handshake } from "lucide-react";
import type { Contract } from "@/lib/contracts-store";
import { cacheContractsLocal } from "@/lib/contracts-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  contractId?: string;
  contractSnapshot?: Contract;
  read: boolean;
  createdAt: string;
}

interface Props {
  mobile?: boolean;
}

export default function NotificationBell({ mobile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function loadNotifications() {
    fetch("/api/notifications")
      .then((r) => {
        if (!r.ok) {
          setLoggedIn(false);
          return null;
        }
        setLoggedIn(true);
        return r.json();
      })
      .then((d) => {
        if (d) {
          setNotifications(d.notifications ?? []);
          setUnread(d.unread ?? 0);
          const snapshots = (d.notifications ?? [])
            .map((n: Notification) => n.contractSnapshot)
            .filter((c: Contract | undefined): c is Contract => Boolean(c));
          if (snapshots.length > 0) cacheContractsLocal(snapshots);
        }
      });
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    const onRefresh = () => loadNotifications();
    window.addEventListener("recursolink:notifications-refresh", onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("recursolink:notifications-refresh", onRefresh);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    loadNotifications();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadNotifications();
  }

  async function openNotification(n: Notification) {
    await markRead(n.id);
    setOpen(false);
    if (n.contractId) {
      router.push(`/factura/${n.contractId}`);
    }
  }

  if (!loggedIn) return null;

  return (
    <div className={`relative ${mobile ? "block" : "hidden md:block"}`} ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-bounce">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
            <p className="font-bold text-slate-900 text-sm">Notificaciones</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-brand-secondary font-semibold hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Sin notificaciones aún
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openNotification(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    !n.read ? "bg-brand-light/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        n.type === "contract_received"
                          ? "bg-brand-light text-brand-secondary"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Handshake className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {n.title}
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-brand-action shrink-0" />
                        )}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      {n.contractId && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-secondary">
                          <FileText className="h-3 w-3" />
                          Ver factura
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("es-BO")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
