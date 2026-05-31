import type { Contract } from "./contracts-store";

const STORAGE_KEY = "recursolink_contracts";

function readAll(): Record<string, Contract> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Contract>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, Contract>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveContractLocal(contract: Contract) {
  const all = readAll();
  all[contract.id] = contract;
  writeAll(all);
}

export function getContractLocal(id: string): Contract | undefined {
  return readAll()[id];
}

export function cacheContractsLocal(contracts: Contract[]) {
  const all = readAll();
  for (const contract of contracts) {
    all[contract.id] = contract;
  }
  writeAll(all);
}

const CONTRACTED_LISTINGS_KEY = "recursolink_contracted_listings";

export function markListingContractedLocal(listingId: string) {
  const ids = new Set(getContractedListingIdsLocal());
  ids.add(listingId);
  if (typeof window !== "undefined") {
    localStorage.setItem(CONTRACTED_LISTINGS_KEY, JSON.stringify([...ids]));
  }
}

export function getContractedListingIdsLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONTRACTED_LISTINGS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isListingContractedLocal(listingId: string): boolean {
  return getContractedListingIdsLocal().includes(listingId);
}
