export interface Contract {
  id: string;
  listingId: string;
  companyName: string;
  title: string;
  price: number;
  priceUnit: string;
  comision: number;
  total: number;
  paymentMethod: string;
  billing: {
    nit: string;
    razonSocial: string;
    direccionFiscal: string;
    emailFactura: string;
    tipoDocumento: string;
  };
  score: number;
  termsAccepted: boolean;
  userId?: string;
  userEmail?: string;
  buyerCompany?: string;
  buyerAccountEmail?: string;
  sellerUserId?: string;
  sellerEmail?: string;
  sellerCompanyName?: string;
  createdAt: string;
}

import { findContractInNotifications } from "@/lib/notifications";

declare global {
  // eslint-disable-next-line no-var
  var __recursolinkContracts: Contract[] | undefined;
}

function getStore(): Contract[] {
  if (!global.__recursolinkContracts) {
    global.__recursolinkContracts = [];
  }
  return global.__recursolinkContracts;
}

export function getContracts(): Contract[] {
  return getStore();
}

export function getContractById(id: string): Contract | undefined {
  return getStore().find((c) => c.id === id);
}

export function addContract(contract: Contract): void {
  const store = getStore();
  const existing = store.findIndex((c) => c.id === contract.id);
  if (existing >= 0) {
    store[existing] = contract;
  } else {
    store.unshift(contract);
  }
}

export function findContractById(id: string): Contract | undefined {
  return getContractById(id) ?? findContractInNotifications(id);
}

export function userCanAccessContract(
  contract: Contract,
  userId: string | undefined
): boolean {
  if (!userId) return false;
  return contract.userId === userId || contract.sellerUserId === userId;
}
