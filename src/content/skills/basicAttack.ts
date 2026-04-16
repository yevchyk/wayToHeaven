import type { SkillData } from '@engine/types/skill';

export const basicAttackSkill: SkillData = {
  id: 'basic-attack',
  name: 'Basic Attack',
  description: 'A direct physical strike with no setup cost.',
  damageKind: 'physical',
  targetPattern: 'single-enemy',
  scalingStat: 'physicalAttack',
  basePower: 0,
};
