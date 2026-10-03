import rawVenues from '../data/venues.json';
import type { Venue } from './types';

const CATALOG = rawVenues as Venue[];

export function getCatalog(): Venue[] {
  return CATALOG;
}

export function getVenueById(id: string): Venue | undefined {
  return CATALOG.find((v) => v.id === id);
}

export function getZonas(): string[] {
  return Array.from(new Set(CATALOG.map((v) => v.zona))).sort();
}
