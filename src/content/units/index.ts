import type { CharacterInstance, CharacterTemplate, EnemyTemplate } from '@engine/types/unit';

import { banditEnemyTemplate } from './banditEnemy';
import { guardEnemyTemplate } from './guardEnemy';
import { mainHeroInstance, mainHeroTemplate } from './mainHero';
import { roadCompanionInstance, roadCompanionTemplate } from './roadCompanion';
import { saltPassRaiderEnemyTemplate } from './saltPassRaiderEnemy';

export const characterTemplateRegistry: Record<string, CharacterTemplate> = {
  [mainHeroTemplate.id]: mainHeroTemplate,
  [roadCompanionTemplate.id]: roadCompanionTemplate,
};

export const characterInstanceRegistry: Record<string, CharacterInstance> = {
  [mainHeroInstance.id]: mainHeroInstance,
  [roadCompanionInstance.id]: roadCompanionInstance,
};

export const enemyTemplateRegistry: Record<string, EnemyTemplate> = {
  [guardEnemyTemplate.id]: guardEnemyTemplate,
  [banditEnemyTemplate.id]: banditEnemyTemplate,
  [saltPassRaiderEnemyTemplate.id]: saltPassRaiderEnemyTemplate,
};

export const defaultPartyInstanceIds = [mainHeroInstance.id, roadCompanionInstance.id];
