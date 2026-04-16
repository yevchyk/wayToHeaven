import type { SkillData } from '@engine/types/skill';

export const fireboltSkill: SkillData = {
  id: 'firebolt',
  name: 'Firebolt',
  description: 'A compact burst of flame meant to scorch one target.',
  damageKind: 'fire',
  targetPattern: 'single-enemy',
  scalingStat: 'magicalAttack',
  basePower: 4,
  manaCost: 1,
};
