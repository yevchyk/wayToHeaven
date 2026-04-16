import { basicAttackSkill } from '@content/skills/basicAttack';
import { cinderStormSkill } from '@content/skills/cinderStorm';
import { fireboltSkill } from '@content/skills/firebolt';
import { wolfRendSkill } from '@content/skills/wolfRend';
import type { SkillData } from '@engine/types/skill';

export const skillContentRegistry = {
  [basicAttackSkill.id]: basicAttackSkill,
  [fireboltSkill.id]: fireboltSkill,
  [cinderStormSkill.id]: cinderStormSkill,
  [wolfRendSkill.id]: wolfRendSkill,
} satisfies Record<string, SkillData>;
