import bcrypt from "bcryptjs";
import type { AuthUser, LoginInput, RegisterInput } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __recursolinkUsers: Map<string, StoredUser> | undefined;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

/** Hashes precomputados para que las cuentas demo funcionen en cada instancia serverless. */
const DEMO_USERS: StoredUser[] = [
  {
    id: "user-demo-001",
    email: "demo@recursolink.sc",
    companyName: "Empresa Demo Santa Cruz",
    sector: "industria",
    createdAt: "2026-05-29T00:00:00Z",
    passwordHash: "$2b$10$RcfMweJjDU5sGDO4QpRb1uLYCca1ULSL6fIB7HjuXqBNwndvhCkfe",
  },
  {
    id: "user-oferta-001",
    email: "oferta@recursolink.sc",
    companyName: "AgroFrío Santa Cruz",
    sector: "agro",
    createdAt: "2026-05-29T00:00:00Z",
    passwordHash: "$2b$10$ZWX/tlEAMsj4r78s5VMbUOo/YNltJi0mGS9EuPcILIiTgNsOZYBK6",
  },
  {
    id: "user-contrata-001",
    email: "contrata@recursolink.sc",
    companyName: "Manufactura del Valle SC",
    sector: "industria",
    createdAt: "2026-05-29T00:00:00Z",
    passwordHash: "$2b$10$iJ0Wmqy8xofGNrXPT4qE.uZIjY7Qsi.EwDIKGBr/GDbmmkZTs9mwa",
  },
];

function getUserStore(): Map<string, StoredUser> {
  if (!global.__recursolinkUsers) {
    global.__recursolinkUsers = new Map();
    seedDemoUsers(global.__recursolinkUsers);
  }
  return global.__recursolinkUsers;
}

function seedDemoUsers(store: Map<string, StoredUser>) {
  for (const user of DEMO_USERS) {
    store.set(user.email, user);
  }
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    companyName: user.companyName,
    sector: user.sector,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const store = getUserStore();

  if (store.has(email)) {
    throw new Error("Este correo ya está registrado.");
  }

  if (input.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const user: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    companyName: input.companyName.trim(),
    sector: input.sector,
    createdAt: new Date().toISOString(),
    passwordHash: await bcrypt.hash(input.password, 10),
  };

  store.set(email, user);
  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const store = getUserStore();
  const user = store.get(email);

  if (!user) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  return toPublicUser(user);
}

export function getUserById(id: string): AuthUser | null {
  const store = getUserStore();
  for (const user of store.values()) {
    if (user.id === id) return toPublicUser(user);
  }
  return null;
}
