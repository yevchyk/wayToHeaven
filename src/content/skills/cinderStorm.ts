import type { SkillData } from '@engine/types/skill';

export const cinderStormSkill: SkillData = {
  id: 'cinder-storm',
  name: 'Cinder Storm',
  description: 'A low, hungry wash of embers that scorches every foe in reach.',
  damageKind: 'fire',
  targetPattern: 'all-enemies',
  scalingStat: 'magicalAttack',
  basePower: 2,
  manaCost: 3,
};
