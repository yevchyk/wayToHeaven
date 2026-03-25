import type { DamageKind } from '@engine/types/combat';
import type {
  BooleanTagModifier,
  NumericTagModifier,
  TagId,
  TagModifierStat,
  TagRuleSet,
  TagToggleTarget,
} from '@engine/types/tags';

interface NumericModifierContext {
  damageKind?: DamageKind;
}

interface NumericModifierSummary {
  flat: number;
  multiplier: number;
}

const tagRules: TagRuleSet[] = [
  {
    tag: 'robot',
    description: 'Artificial bodies reject toxins and blood loss.',
    grantsStatusImmunities: ['poison', 'bleed'],
    modifiers: [
      {
        kind: 'boolean',
        target: 'canReceiveHealing',
        value: false,
      },
    ],
  },
  {
    tag: 'tree',
    description: 'Wooden bodies burn easily.',
    modifiers: [
      {
        kind: 'numeric',
        target: 'damageTaken',
        mode: 'multiplier',
        value: 1.5,
        damageKind: 'fire',
      },
    ],
  },
  {
    tag: 'fairy',
    description: 'Light-footed and difficult to pin down.',
    modifiers: [
      {
        kind: 'numeric',
        target: 'evasion',
        mode: 'multiplier',
        value: 1.15,
      },
    ],
  },
  {
    tag: 'living',
    description: 'Responds to restorative effects.',
    modifiers: [
      {
        kind: 'boolean',
        target: 'canReceiveHealing',
        value: true,
      },
    ],
  },
  {
    tag: 'beast',
    description: 'Wild instincts resist control effects.',
    modifiers: [
      {
        kind: 'numeric',
        target: 'controlResistance',
        mode: 'flat',
        value: 0.25,
      },
    ],
  },
  {
    tag: 'stunned',
    description: 'The unit cannot act this turn.',
    modifiers: [
      {
        kind: 'boolean',
        target: 'canAct',
        value: false,
      },
    ],
  },
  {
    tag: 'charmed',
    description: 'The unit loses its action.',
    modifiers: [
      {
        kind: 'boolean',
        target: 'canAct',
        value: false,
      },
    ],
  },
  {
    tag: 'fearful',
    description: 'Fear overrides intent.',
    modifiers: [
      {
        kind: 'boolean',
        target: 'canAct',
        value: false,
      },
    ],
  },
  {
    tag: 'shielded',
    description: 'A temporary barrier softens incoming blows.',
    modifiers: [
      {
        kind: 'numeric',
        target: 'damageTaken',
        mode: 'multiplier',
        value: 0.75,
      },
    ],
  },
];

export const tagRulesRegistry = Object.fromEntries(
  tagRules.map((rule) => [rule.tag, rule]),
) satisfies Record<string, TagRuleSet>;

export function getTagRule(tag: TagId) {
  return tagRulesRegistry[tag];
}

export function collectTagRules(tags: readonly TagId[]) {
  return Array.from(new Set(tags))
    .map((tag) => getTagRule(tag))
    .filter((rule): rule is TagRuleSet => rule !== undefined);
}

export function getStatusImmunitiesForTags(tags: readonly TagId[]) {
  return new Set(collectTagRules(tags).flatMap((rule) => rule.grantsStatusImmunities ?? []));
}

export function getBooleanTagToggle(tags: readonly TagId[], target: TagToggleTarget) {
  const modifiers = collectTagRules(tags)
    .flatMap((rule) => rule.modifiers ?? [])
    .filter(
      (modifier): modifier is BooleanTagModifier =>
        modifier.kind === 'boolean' && modifier.target === target,
    );

  if (modifiers.length === 0) {
    return undefined;
  }

  return modifiers.some((modifier) => modifier.value === false)
    ? false
    : modifiers.at(-1)?.value;
}

export function getNumericTagModifierSummary(
  tags: readonly TagId[],
  target: TagModifierStat,
  context: NumericModifierContext = {},
): NumericModifierSummary {
  return collectTagRules(tags)
    .flatMap((rule) => rule.modifiers ?? [])
    .filter(
      (modifier): modifier is NumericTagModifier =>
        modifier.kind === 'numeric' &&
        modifier.target === target &&
        (modifier.damageKind === undefined || modifier.damageKind === context.damageKind),
    )
    .reduce<NumericModifierSummary>(
      (summary, modifier) => ({
        flat: modifier.mode === 'flat' ? summary.flat + modifier.value : summary.flat,
        multiplier:
          modifier.mode === 'multiplier' ? summary.multiplier * modifier.value : summary.multiplier,
      }),
      {
        flat: 0,
        multiplier: 1,
      },
    );
}

export function applyNumericTagModifiers(
  baseValue: number,
  tags: readonly TagId[],
  target: TagModifierStat,
  context: NumericModifierContext = {},
) {
  const summary = getNumericTagModifierSummary(tags, target, context);

  return (baseValue + summary.flat) * summary.multiplier;
}
