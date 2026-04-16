import type { DamageKind } from '@engine/types/combat';
import type { StatusType } from '@engine/types/status';

export type SkillScalingStat = 'physicalAttack' | 'magicalAttack';
export type SkillTargetPattern = 'single-enemy' | 'all-enemies' | 'single-ally' | 'self';

export interface SkillStatusApplication {
  statusType: StatusType;
  chance: number;
  duration?: number;
  potency?: number;
  stacks?: number;
}

export interface SkillData {
  id: string;
  name: string;
  description?: string;
  damageKind: DamageKind;
  targetPattern: SkillTargetPattern;
  scalingStat: SkillScalingStat;
  basePower?: number;
  manaCost?: number;
  statusApplications?: SkillStatusApplication[];
}

export function skillPatternRequiresTarget(pattern: SkillTargetPattern) {
  return pattern === 'single-enemy' || pattern === 'single-ally';
}
