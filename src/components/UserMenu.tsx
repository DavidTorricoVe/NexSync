"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/auth/types";
import { Loader2, LogOut, User } from "lucide-react";

interface Props {
  user: AuthUser | null;
  loading: boolean;
  onLogout: () => void;
  loggingOut: boolean;
}

export default function UserMenu({ user, loading, onLogout, loggingOut }: Props) {
  if (loading) {
    return (
      <div className="hidden md:flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/registro"
        className="hidden md:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Crear cuenta
      </Link>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg bg-brand-light px-3 py-1.5 max-w-[180px]">
        <User className="h-4 w-4 text-brand-secondary shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-brand-primary truncate">{user.companyName}</p>
          <p className="text-[10px] text-brand-secondary truncate">{user.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        title="Cerrar sesión"
      >
        {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      </button>
    </div>
  );
}
