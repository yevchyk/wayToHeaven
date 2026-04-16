import type { CharacterInstance, CharacterTemplate } from '@engine/types/unit';

export const mainHeroTemplate: CharacterTemplate = {
  id: 'main-hero-template',
  kind: 'character',
  name: 'Pilgrim',
  description: 'A wanderer who survives by stubborn resolve.',
  battleVisual: {
    portraitSourcePath: 'src/content/shared/placeholders/portraits/young-woman.jpg',
  },
  faction: 'player',
  baseStats: {
    strength: 7,
    agility: 6,
    sexuality: 3,
    magicAffinity: 2,
    initiative: 5,
    mana: 4,
    health: 8,
  },
  startingTags: ['human', 'living', 'pilgrim'],
  startingStatuses: [],
  skillIds: ['basic-attack', 'firebolt', 'cinder-storm'],
  itemIds: ['basic-potion'],
  preview: {
    background: 'background/pilgrim-road-dawn',
    body: 'body/pilgrim-frame',
    costume: 'costume/linen-tunic',
    hair: 'hair/umber-braid',
  },
  startingEquipment: {
    costume: 'pilgrim-mantle',
    weapon: 'oak-staff',
  },
};

export const mainHeroInstance: CharacterInstance = {
  id: 'main-hero',
  templateId: mainHeroTemplate.id,
  level: 1,
  tags: ['party-leader'],
};
