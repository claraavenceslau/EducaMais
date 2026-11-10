import * as Location from 'expo-location';
import type { DemandLocation } from '../types';
import { joinAddress } from '../utils/location';

export type LocationResult =
  | { status: 'ok'; location: DemandLocation }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error' };

/** Pede permissão (só enquanto o app está aberto) e lê a posição atual. */
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return { status: 'denied', canAskAgain: permission.canAskAgain };

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude, accuracy } = pos.coords;

    let description = '';
    try {
      const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (a) description = joinAddress([a.street ? `${a.street}${a.streetNumber ? ', ' + a.streetNumber : ''}` : a.name, a.district, a.city]);
    } catch {
      // endereço é um complemento; sem ele ficam só as coordenadas
    }

    return {
      status: 'ok',
      location: {
        source: 'gps',
        description: description || 'Localização aproximada do aparelho',
        latitude,
        longitude,
        accuracy: accuracy ?? undefined,
      },
    };
  } catch {
    return { status: 'error' };
  }
}
