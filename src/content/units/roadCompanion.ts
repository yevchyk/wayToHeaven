import type { CharacterInstance, CharacterTemplate } from '@engine/types/unit';

export const roadCompanionTemplate: CharacterTemplate = {
  id: 'road-companion-template',
  kind: 'character',
  name: 'Ash',
  description: 'A quick-footed scout with a sharp tongue and sharper eyes.',
  faction: 'ally',
  baseStats: {
    strength: 4,
    agility: 8,
    sexuality: 4,
    magicAffinity: 3,
    initiative: 7,
    mana: 3,
    health: 6,
  },
  startingTags: ['human', 'living', 'scout'],
  startingStatuses: [],
  skillIds: ['basic-attack'],
  preview: {
    background: 'background/scout-ridge',
    body: 'body/scout-frame',
    costume: 'costume/scout-leathers',
    hair: 'hair/ash-crop',
  },
  startingEquipment: {
    headwear: 'travel-hood',
  },
};

export const roadCompanionInstance: CharacterInstance = {
  id: 'road-companion',
  templateId: roadCompanionTemplate.id,
  level: 1,
  currentHp: 62,
  currentMana: 18,
  tags: ['watchful'],
};
