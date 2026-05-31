import { SEED_LISTINGS } from "./seed-data";
import type { Listing } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __recursolinkListings: Listing[] | undefined;
  // eslint-disable-next-line no-var
  var __recursolinkContractedListingIds: Set<string> | undefined;
}

function getMemoryStore(): Listing[] {
  if (!global.__recursolinkListings) {
    global.__recursolinkListings = [];
  }
  return global.__recursolinkListings;
}

function getContractedIds(): Set<string> {
  if (!global.__recursolinkContractedListingIds) {
    global.__recursolinkContractedListingIds = new Set();
  }
  return global.__recursolinkContractedListingIds;
}

function isListingAvailable(listing: Listing): boolean {
  if (listing.status === "contracted") return false;
  if (getContractedIds().has(listing.id)) return false;
  return true;
}

export function getAllListings(extra: Listing[] = []): Listing[] {
  const memory = getMemoryStore();
  const ids = new Set<string>();
  const merged: Listing[] = [];

  for (const listing of [...SEED_LISTINGS, ...memory, ...extra]) {
    if (!ids.has(listing.id)) {
      ids.add(listing.id);
      merged.push(listing);
    }
  }

  return merged
    .filter(isListingAvailable)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getOffers(extra: Listing[] = []): Listing[] {
  return getAllListings(extra).filter((l) => l.kind === "oferta");
}

export function getListingById(id: string): Listing | undefined {
  const memory = getMemoryStore();
  const fromMemory = memory.find((l) => l.id === id);
  if (fromMemory) return fromMemory;

  const fromSeed = SEED_LISTINGS.find((l) => l.id === id);
  if (!fromSeed) return undefined;

  if (getContractedIds().has(id) || fromSeed.status === "contracted") {
    return { ...fromSeed, status: "contracted" };
  }
  return fromSeed;
}

export function isListingContracted(listingId: string): boolean {
  return getContractedIds().has(listingId);
}

export function markListingContracted(listingId: string): void {
  getContractedIds().add(listingId);

  const memory = getMemoryStore();
  const listing = memory.find((l) => l.id === listingId);
  if (listing) {
    listing.status = "contracted";
    return;
  }

  const seed = SEED_LISTINGS.find((l) => l.id === listingId);
  if (seed) {
    memory.push({ ...seed, status: "contracted" });
  }
}

export function addListing(listing: Omit<Listing, "id" | "createdAt">): Listing {
  const memory = getMemoryStore();
  const newListing: Listing = {
    ...listing,
    status: listing.status ?? "available",
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  memory.push(newListing);
  return newListing;
}

export function getStats() {
  const contracted = getContractedIds();
  const all = [...SEED_LISTINGS, ...getMemoryStore()].filter(
    (l, i, arr) => arr.findIndex((x) => x.id === l.id) === i
  );
  const offers = all.filter(
    (l) => l.kind === "oferta" && !contracted.has(l.id) && l.status !== "contracted"
  );
  const sectors = new Set(offers.map((l) => l.sector));
  const totalOfferValue = offers.reduce((sum, o) => sum + o.price, 0);

  return {
    totalCompanies: new Set(offers.map((l) => l.companyId)).size,
    totalOffers: offers.length,
    sectorsActive: sectors.size,
    totalOfferValue,
    avgOfferPrice: offers.length
      ? Math.round(totalOfferValue / offers.length)
      : 0,
  };
}
