import type { DemandLocation } from '../types';

export function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/** Link que abre o ponto no aplicativo de mapas ou no navegador. */
export function mapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function hasCoords(l?: DemandLocation): l is DemandLocation & { latitude: number; longitude: number } {
  return !!l && l.latitude !== undefined && l.longitude !== undefined;
}

export function manualLocation(description: string): DemandLocation {
  return { source: 'manual', description: description.trim() };
}

/** Monta "Rua X, Bairro, Cidade" ignorando partes que vieram vazias. */
export function joinAddress(parts: (string | null | undefined)[]): string {
  return parts.filter((p): p is string => !!p && p.trim().length > 0).join(', ');
}
