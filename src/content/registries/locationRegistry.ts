import type { LocationData } from '@engine/types/world';

import { firstLocation } from '@content/locations/firstLocation';

export const locationContentRegistry: Record<string, LocationData> = {
  [firstLocation.id]: firstLocation,
};
