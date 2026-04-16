import type { SkillData } from '@engine/types/skill';

export const wolfRendSkill: SkillData = {
  id: 'wolf-rend',
  name: 'Wolf Rend',
  description: 'A tearing bite that can leave the target bleeding into their next turn.',
  damageKind: 'physical',
  targetPattern: 'single-enemy',
  scalingStat: 'physicalAttack',
  basePower: 1,
  statusApplications: [
    {
      statusType: 'bleed',
      chance: 0.45,
      duration: 2,
      potency: 4,
    },
  ],
};
