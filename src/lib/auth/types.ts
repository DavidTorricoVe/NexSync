import type { Sector } from "@/lib/types";

export interface AuthUser {
  id: string;
  email: string;
  companyName: string;
  sector: Sector;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  companyName: string;
  sector: Sector;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const SESSION_COOKIE = "recursolink_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días
