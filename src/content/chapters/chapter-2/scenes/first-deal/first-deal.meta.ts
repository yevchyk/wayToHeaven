import type { SceneMeta } from '@engine/types/narrative';

import { chapter2BackgroundIds, chapter2MusicIds } from '../../assets';

export const chapter2FirstDealSceneMeta: SceneMeta = {
  id: 'chapter-2/scene/first-deal',
  title: 'Перший міський борг',
  chapterId: 'chapter-2',
  sceneOrder: 2,
  mainSceneFlowId: 'chapter-2/scene/first-deal',
  description: 'Mirella chooses her first binding urban alignment: broker, registry, or shelter labor.',
  defaultBackgroundId: chapter2BackgroundIds.brokerStall,
  defaultMusicId: chapter2MusicIds.ledgerBreath,
};
