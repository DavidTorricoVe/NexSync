import type { Contract } from "./contracts-store";

export interface AppNotification {
  id: string;
  userId: string;
  type: "contract_received" | "contract_sent";
  title: string;
  message: string;
  listingId: string;
  contractId: string;
  contractSnapshot?: Contract;
  read: boolean;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __recursolinkNotifications: AppNotification[] | undefined;
}

function getStore(): AppNotification[] {
  if (!global.__recursolinkNotifications) {
    global.__recursolinkNotifications = [];
  }
  return global.__recursolinkNotifications;
}

export function createNotification(
  data: Omit<AppNotification, "id" | "read" | "createdAt">
): AppNotification {
  const notification: AppNotification = {
    ...data,
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  getStore().unshift(notification);
  return notification;
}

export function getNotificationsForUser(userId: string): AppNotification[] {
  return getStore()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationRead(id: string, userId: string): boolean {
  const n = getStore().find((x) => x.id === id && x.userId === userId);
  if (!n) return false;
  n.read = true;
  return true;
}

export function markAllRead(userId: string): void {
  getStore()
    .filter((n) => n.userId === userId && !n.read)
    .forEach((n) => {
      n.read = true;
    });
}

export function countUnread(userId: string): number {
  return getStore().filter((n) => n.userId === userId && !n.read).length;
}

export function findContractInNotifications(id: string): Contract | undefined {
  for (const n of getStore()) {
    if (n.contractSnapshot?.id === id) return n.contractSnapshot;
  }
  return undefined;
}
