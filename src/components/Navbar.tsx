"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";
import type { AuthUser } from "@/lib/auth/types";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const homeLink = { href: "/", label: "Inicio", icon: Home };

const appLinks = [
  { href: "/buscar", label: "Buscar con IA", icon: Search },
  { href: "/publicar", label: "Ofrecer recurso", icon: PlusCircle },
  { href: "/empresas", label: "Recursos", icon: Building2 },
  { href: "/dashboard", label: "Impacto", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadUser = useCallback(() => {
    setAuthLoading(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    loadUser();
  }, [pathname, loadUser]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoggingOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/registro";
  const navLinks = user ? [homeLink, ...appLinks] : [homeLink];

  function linkClass(href: string) {
    const active = pathname === href;
    return `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-brand-light text-brand-secondary"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-primary/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/nexsync-logo.png"
            alt={BRAND_NAME}
            width={140}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <p className="text-[10px] text-brand-muted font-medium leading-tight max-w-[140px]">
              {BRAND_TAGLINE}
            </p>
          </div>
        </Link>

        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3">
          {!isAuthPage && (
            <>
              {user && <NotificationBell />}
              <UserMenu
                user={user}
                loading={authLoading}
                onLogout={handleLogout}
                loggingOut={loggingOut}
              />
              {user ? (
                <Link
                  href="/buscar"
                  className="inline-flex items-center rounded-lg bg-brand-action px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors"
                >
                  Agente IA
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg bg-brand-action px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </>
          )}
        </div>

        {!isAuthPage && (
          <>
            <button
              type="button"
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setOpen(!open)}
              aria-label="Menú"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {user && (
              <div className="md:hidden">
                <NotificationBell mobile />
              </div>
            )}
          </>
        )}
      </div>

      {open && !isAuthPage && (
        <nav className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-light"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-2">
            {authLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-brand-action" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <p className="text-xs text-brand-secondary px-3">{user.companyName}</p>
                <Link
                  href="/buscar"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-brand-action py-2.5 text-sm font-semibold text-white"
                >
                  Agente IA
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm text-slate-600"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center rounded-lg bg-brand-action py-2.5 text-sm font-semibold text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center rounded-lg border border-slate-200 py-2.5 text-sm font-medium"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
