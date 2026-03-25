import type { LocationData } from '@engine/types/world';

import { firstLocation } from './firstLocation';

export const locationContentRegistry: Record<string, LocationData> = {
  [firstLocation.id]: firstLocation,
};

export { firstLocation };
export {
  chapter1CityLocationBackdropEntries,
  chapter1SceneMetaBackdropEntries,
  chapter1TravelBackdropEntries,
} from './chapter1LocationBackdropWorkbench';
export type { LocationBackdropWorkbenchEntry } from './chapter1LocationBackdropWorkbench';
