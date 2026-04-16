import type {
  StatusDefinition,
  StatusEffectInstance,
  StatusMetadataValue,
  StatusType,
} from '@engine/types/status';
import type { TagId } from '@engine/types/tags';

interface CreateStatusEffectInstanceOptions {
  id?: string;
  sourceUnitId?: string;
  potency?: number;
  remainingDuration?: number;
  stacks?: number;
  grantedTags?: TagId[];
  metadata?: Record<string, StatusMetadataValue>;
}

const statusDefinitions = [
  {
    type: 'poison',
    name: 'Poison',
    description: 'Deals toxic damage at turn end.',
    category: 'damage',
    defaultDuration: 3,
    tickTiming: 'turnEnd',
    stackPolicy: 'stack',
    isNegative: true,
    defaultPotency: 4,
    payload: {
      kind: 'damage',
      amount: 4,
      damageKind: 'poison',
      scalesWithStacks: true,
    },
    blockedByTags: ['poison-immune'],
  },
  {
    type: 'burn',
    name: 'Burn',
    description: 'Deals fire damage at turn end.',
    category: 'damage',
    defaultDuration: 3,
    tickTiming: 'turnEnd',
    stackPolicy: 'refresh',
    isNegative: true,
    defaultPotency: 5,
    payload: {
      kind: 'damage',
      amount: 5,
      damageKind: 'fire',
      scalesWithStacks: true,
    },
    blockedByTags: ['burn-immune'],
  },
  {
    type: 'bleed',
    name: 'Bleed',
    description: 'Deals wound damage at the start of the unit turn.',
    category: 'damage',
    defaultDuration: 2,
    tickTiming: 'turnStart',
    stackPolicy: 'stack',
    isNegative: true,
    defaultPotency: 4,
    payload: {
      kind: 'damage',
      amount: 4,
      damageKind: 'bleed',
      scalesWithStacks: true,
    },
    blockedByTags: ['bleed-immune'],
  },
  {
    type: 'stun',
    name: 'Stun',
    description: 'Prevents the unit from acting on its next turn.',
    category: 'control',
    defaultDuration: 1,
    tickTiming: 'turnStart',
    stackPolicy: 'refresh',
    isNegative: true,
    grantsTags: ['stunned'],
  },
  {
    type: 'charm',
    name: 'Charm',
    description: 'Overwrites intent and skips the next action.',
    category: 'control',
    defaultDuration: 1,
    tickTiming: 'turnStart',
    stackPolicy: 'refresh',
    isNegative: true,
    grantsTags: ['charmed'],
  },
  {
    type: 'fear',
    name: 'Fear',
    description: 'The unit hesitates and loses the turn.',
    category: 'control',
    defaultDuration: 1,
    tickTiming: 'turnStart',
    stackPolicy: 'refresh',
    isNegative: true,
    grantsTags: ['fearful'],
  },
  {
    type: 'shield',
    name: 'Shield',
    description: 'Reduces incoming damage for a short time.',
    category: 'barrier',
    defaultDuration: 2,
    tickTiming: 'turnEnd',
    stackPolicy: 'refresh',
    isNegative: false,
    grantsTags: ['shielded'],
  },
  {
    type: 'regen',
    name: 'Regeneration',
    description: 'Restores health at turn end.',
    category: 'support',
    defaultDuration: 3,
    tickTiming: 'turnEnd',
    stackPolicy: 'refresh',
    isNegative: false,
    defaultPotency: 5,
    payload: {
      kind: 'heal',
      amount: 5,
      damageKind: 'healing',
      scalesWithStacks: true,
    },
  },
] satisfies StatusDefinition[];

export const statusDefinitionsRegistry = Object.fromEntries(
  statusDefinitions.map((definition) => [definition.type, definition]),
) satisfies Record<string, StatusDefinition>;

export function getStatusDefinition(statusType: StatusType) {
  return statusDefinitionsRegistry[statusType];
}

export function createStatusEffectInstance(
  statusType: StatusType,
  options: CreateStatusEffectInstanceOptions = {},
): StatusEffectInstance {
  const definition = getStatusDefinition(statusType);

  if (!definition) {
    throw new Error(`Status definition "${statusType}" was not found.`);
  }

  const grantedTags = Array.from(
    new Set([...(definition.grantsTags ?? []), ...(options.grantedTags ?? [])]),
  );
  const potency = options.potency ?? definition.defaultPotency;

  return {
    id: options.id ?? `${statusType}-status`,
    type: statusType,
    remainingDuration: options.remainingDuration ?? definition.defaultDuration,
    stacks: options.stacks ?? 1,
    tickTiming: definition.tickTiming,
    ...(options.sourceUnitId ? { sourceUnitId: options.sourceUnitId } : {}),
    ...(potency !== undefined ? { potency } : {}),
    ...(grantedTags.length > 0 ? { grantedTags } : {}),
    ...(options.metadata ? { metadata: { ...options.metadata } } : {}),
  };
}

