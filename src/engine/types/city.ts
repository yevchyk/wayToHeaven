import type { Condition } from '@engine/types/conditions';
import type { GameEffect } from '@engine/types/effects';
import type { ActionTone } from '@engine/types/actions';

export interface CitySceneAction {
  id: string;
  text: string;
  tone?: ActionTone;
  description?: string;
  conditions?: Condition[];
  effects?: GameEffect[];
  nextSceneId?: string;
  dialogueId?: string;
  battleTemplateId?: string;
  travelBoardId?: string;
  once?: boolean;
}

export interface CitySceneData {
  id: string;
  cityId: string;
  cityName: string;
  locationName: string;
  actions: CitySceneAction[];
  chapterId?: string;
  districtLabel?: string;
  statusLabel?: string;
  description?: string;
  backgroundId?: string;
  onEnterEffects?: GameEffect[];
}
