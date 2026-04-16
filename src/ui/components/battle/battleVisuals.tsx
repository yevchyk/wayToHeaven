import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { BattleActionSelection } from '@engine/types/battle';
import type { ItemData } from '@engine/types/item';
import type { SkillData } from '@engine/types/skill';
import type { BattleAuraPreset, BattleUnitRuntime } from '@engine/types/unit';
import { resolveContentImageUrl } from '@ui/components/character-composite/characterCompositeAssetResolver';

const auraFrameSourcePaths: Record<BattleAuraPreset, readonly string[]> = {
  fire: [
    'src/content/shared/placeholders/battle-auras/fire/frame-1.png',
    'src/content/shared/placeholders/battle-auras/fire/frame-2.png',
    'src/content/shared/placeholders/battle-auras/fire/frame-3.png',
  ],
  holy: [
    'src/content/shared/placeholders/battle-auras/holy/frame-1.png',
    'src/content/shared/placeholders/battle-auras/holy/frame-2.png',
    'src/content/shared/placeholders/battle-auras/holy/frame-3.png',
  ],
  violet: [
    'src/content/shared/placeholders/battle-auras/violet/frame-1.png',
    'src/content/shared/placeholders/battle-auras/violet/frame-2.png',
    'src/content/shared/placeholders/battle-auras/violet/frame-3.png',
  ],
};

const auraColors: Record<BattleAuraPreset, string> = {
  fire: '#ffb26b',
  holy: '#f3ebbe',
  violet: '#b78dff',
};

const defaultPortraitSourcePaths = {
  ally: 'src/content/shared/placeholders/portraits/young-woman.jpg',
  enemyHuman: 'src/content/shared/placeholders/portraits/rough-man.jpg',
  enemyMystic: 'src/content/shared/placeholders/portraits/old-woman.jpg',
  enemyBeast: 'src/content/shared/placeholders/battle-portraits/wolf-sigil.png',
} as const;

function resolveTemplateVisual(rootStore: GameRootStore, unit: BattleUnitRuntime) {
  return unit.side === 'ally'
    ? rootStore.getCharacterTemplateById(unit.templateId)?.battleVisual ?? null
    : rootStore.getEnemyTemplateById(unit.templateId)?.battleVisual ?? null;
}

function getDefaultPortraitSourcePath(unit: BattleUnitRuntime) {
  if (unit.tags.includes('wolf') || unit.tags.includes('beast')) {
    return defaultPortraitSourcePaths.enemyBeast;
  }

  if (unit.side === 'enemy' && (unit.tags.includes('fearful') || unit.tags.includes('charmed'))) {
    return defaultPortraitSourcePaths.enemyMystic;
  }

  return unit.side === 'ally'
    ? defaultPortraitSourcePaths.ally
    : defaultPortraitSourcePaths.enemyHuman;
}

export function resolveBattlePortraitUrl(rootStore: GameRootStore, unit: BattleUnitRuntime) {
  const templateVisual = resolveTemplateVisual(rootStore, unit);
  const template =
    unit.side === 'ally'
      ? rootStore.getCharacterTemplateById(unit.templateId)
      : rootStore.getEnemyTemplateById(unit.templateId);

  return (
    resolveContentImageUrl(
      templateVisual?.portraitAssetId ?? template?.portraitId ?? null,
      templateVisual?.portraitSourcePath,
    ) ?? resolveContentImageUrl(null, getDefaultPortraitSourcePath(unit))
  );
}

function inferAuraFromSkill(skill: SkillData | null): BattleAuraPreset | null {
  if (!skill) {
    return null;
  }

  if (skill.damageKind === 'fire') {
    return 'fire';
  }

  if (skill.damageKind === 'arcane') {
    return 'violet';
  }

  return null;
}

function inferAuraFromItem(item: ItemData | null): BattleAuraPreset | null {
  if (!item) {
    return null;
  }

  if (item.effects?.some((effect) => effect.type === 'dealDamage' && effect.damageKind === 'fire')) {
    return 'fire';
  }

  if (
    item.effects?.some(
      (effect) =>
        effect.type === 'cleanseStatuses' ||
        (effect.type === 'restoreResource' && effect.resource === 'hp'),
    )
  ) {
    return 'holy';
  }

  if (item.effects?.some((effect) => effect.type === 'restoreResource' && effect.resource === 'mana')) {
    return 'violet';
  }

  return null;
}

export function inferBattleActionAura(
  rootStore: GameRootStore,
  action: BattleActionSelection | null,
): BattleAuraPreset | null {
  if (!action) {
    return null;
  }

  if (action.type === 'skill') {
    return inferAuraFromSkill(action.skillId ? rootStore.getSkillById(action.skillId) ?? null : null);
  }

  if (action.type === 'item') {
    return inferAuraFromItem(action.itemId ? rootStore.getItemById(action.itemId) ?? null : null);
  }

  return null;
}

export function inferBattleStatusAura(unit: BattleUnitRuntime): BattleAuraPreset | null {
  if (unit.statuses.some((status) => status.type === 'burn')) {
    return 'fire';
  }

  if (unit.statuses.some((status) => status.type === 'shield' || status.type === 'regen')) {
    return 'holy';
  }

  if (unit.statuses.some((status) => status.type === 'fear' || status.type === 'charm')) {
    return 'violet';
  }

  return unit.battleVisual?.defaultAuraPreset ?? null;
}

export function getBattleAuraFrameUrls(kind: BattleAuraPreset) {
  return auraFrameSourcePaths[kind].map((sourcePath) => resolveContentImageUrl(null, sourcePath));
}

export function BattleAuraOverlay({
  kind,
  intensity = 'normal',
}: {
  kind: BattleAuraPreset;
  intensity?: 'normal' | 'focus';
}) {
  const frameUrls = getBattleAuraFrameUrls(kind);
  const glowColor = auraColors[kind];

  if (frameUrls.every((entry) => !entry)) {
    return null;
  }

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: intensity === 'focus' ? '-20%' : '-16%',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        '@keyframes battleAuraGlow': {
          '0%, 100%': {
            opacity: 0.74,
            transform: 'scale(0.96)',
          },
          '50%': {
            opacity: 1,
            transform: 'scale(1.04)',
          },
        },
        '@keyframes battleAuraFrameOne': {
          '0%, 32%': { opacity: 1 },
          '33%, 100%': { opacity: 0 },
        },
        '@keyframes battleAuraFrameTwo': {
          '0%, 32%': { opacity: 0 },
          '33%, 65%': { opacity: 1 },
          '66%, 100%': { opacity: 0 },
        },
        '@keyframes battleAuraFrameThree': {
          '0%, 65%': { opacity: 0 },
          '66%, 100%': { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: '16%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(glowColor, intensity === 'focus' ? 0.34 : 0.22)} 0%, ${alpha(
            glowColor,
            0.08,
          )} 38%, rgba(0,0,0,0) 72%)`,
          filter: 'blur(18px)',
          animation: 'battleAuraGlow 1800ms ease-in-out infinite',
        }}
      />
      {frameUrls.map((frameUrl, index) =>
        frameUrl ? (
          <Box
            key={`${kind}-${index}`}
            component="img"
            src={frameUrl}
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0,
              filter: `drop-shadow(0 0 16px ${alpha(glowColor, 0.42)})`,
              animationDuration: '1100ms',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'steps(1, end)',
              animationName:
                index === 0
                  ? 'battleAuraFrameOne'
                  : index === 1
                    ? 'battleAuraFrameTwo'
                    : 'battleAuraFrameThree',
            }}
          />
        ) : null,
      )}
    </Box>
  );
}
