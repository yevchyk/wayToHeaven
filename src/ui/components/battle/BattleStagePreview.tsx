import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { CombatLogEntry } from '@engine/types/battle';
import type { BattleAuraPreset } from '@engine/types/unit';
import type { CorruptionSkin } from '@ui/components/shell/corruptionSkins';
import { BattleAuraOverlay } from '@ui/components/battle/battleVisuals';

interface StagePortrait {
  name: string;
  roleLabel: string;
  portraitUrl: string | null;
  auraKind?: BattleAuraPreset | null;
  side: 'ally' | 'enemy';
}

export interface StageImpactCue {
  id: string;
  tone: 'damage' | 'heal' | 'status' | 'action' | 'miss';
  sourceSide: 'ally' | 'enemy' | null;
  targetSide: 'ally' | 'enemy' | null;
  label: string;
}

function resolveImpactColors(tone: StageImpactCue['tone']) {
  switch (tone) {
    case 'damage':
      return {
        core: '#ffac7a',
        edge: '#8c2f24',
      };
    case 'heal':
      return {
        core: '#eae2b0',
        edge: '#7b8d58',
      };
    case 'status':
      return {
        core: '#cab6ff',
        edge: '#6944b8',
      };
    case 'miss':
      return {
        core: '#dfe5ef',
        edge: '#657180',
      };
    case 'action':
    default:
      return {
        core: '#f0d5a1',
        edge: '#7b5832',
      };
  }
}

function StagePortraitPanel({
  portrait,
  skin,
}: {
  portrait: StagePortrait;
  skin: CorruptionSkin;
}) {
  const align = portrait.side === 'ally' ? 'left' : 'right';

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        [align]: 0,
        width: { xs: '42%', md: '34%' },
        maxWidth: 220,
        height: '100%',
        overflow: 'hidden',
        borderRadius: portrait.side === 'ally' ? '22px 22px 0 18px' : '22px 22px 18px 0',
        border: `1px solid ${alpha(skin.frame.border, 0.7)}`,
        background: `linear-gradient(180deg, ${alpha('#120f12', 0.12)} 0%, ${alpha('#08090d', 0.76)} 100%)`,
      }}
    >
      {portrait.portraitUrl ? (
        <Box
          component="img"
          alt=""
          src={portrait.portraitUrl}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: portrait.side === 'ally' ? 'center top' : 'center 18%',
            filter: portrait.side === 'enemy' ? 'saturate(0.8) contrast(1.06)' : 'saturate(0.92)',
          }}
        />
      ) : null}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            portrait.side === 'ally'
              ? 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 42%, rgba(0,0,0,0.56) 100%)'
              : 'linear-gradient(270deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 42%, rgba(0,0,0,0.56) 100%)',
        }}
      />
      {portrait.auraKind ? <BattleAuraOverlay kind={portrait.auraKind} /> : null}
      <Box
        sx={{
          position: 'absolute',
          left: portrait.side === 'ally' ? 12 : 'auto',
          right: portrait.side === 'enemy' ? 12 : 'auto',
          bottom: 10,
        }}
      >
        <Typography
          sx={{
            color: alpha(skin.text.muted, 0.9),
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textAlign: portrait.side === 'ally' ? 'left' : 'right',
          }}
        >
          {portrait.roleLabel}
        </Typography>
        <Typography
          sx={{
            color: skin.text.primary,
            fontSize: '0.92rem',
            textAlign: portrait.side === 'ally' ? 'left' : 'right',
          }}
        >
          {portrait.name}
        </Typography>
      </Box>
    </Box>
  );
}

export function BattleStagePreview({
  skin,
  ally,
  enemy,
  recentImpact,
  previewAuraKind,
  previewSourceSide,
  previewTargetSide,
}: {
  skin: CorruptionSkin;
  ally: StagePortrait | null;
  enemy: StagePortrait | null;
  recentImpact: StageImpactCue | null;
  previewAuraKind: BattleAuraPreset | null;
  previewSourceSide: 'ally' | 'enemy' | null;
  previewTargetSide: 'ally' | 'enemy' | null;
}) {
  const previewColor =
    previewAuraKind === 'fire'
      ? '#ffb56e'
      : previewAuraKind === 'holy'
        ? '#f4efc8'
        : previewAuraKind === 'violet'
          ? '#c4acff'
          : '#f2d7a9';
  const impactColors = recentImpact ? resolveImpactColors(recentImpact.tone) : null;
  const shouldShowPreviewProjectile =
    previewAuraKind !== null && previewSourceSide !== null && previewTargetSide !== null;
  const previewLeft =
    shouldShowPreviewProjectile && previewSourceSide === 'ally' ? '26%' : '42%';
  const previewWidth =
    shouldShowPreviewProjectile && previewSourceSide !== previewTargetSide ? '34%' : '18%';
  const impactLeft =
    recentImpact?.targetSide === 'ally'
      ? '17%'
      : recentImpact?.targetSide === 'enemy'
        ? '67%'
        : '45%';

  return (
    <Stack spacing={0.55}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
        <Typography
          sx={{
            color: alpha(skin.text.muted, 0.92),
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Battle Stage
        </Typography>
        <Typography sx={{ color: skin.text.secondary, fontSize: '0.74rem' }}>
          {recentImpact?.label ?? 'The line is tense but still.'}
        </Typography>
      </Stack>

      <Box
        data-testid="battle-stage-preview"
        sx={{
          position: 'relative',
          minHeight: { xs: 164, md: 182 },
          overflow: 'hidden',
          borderRadius: 2.2,
          border: `1px solid ${alpha(skin.frame.border, 0.72)}`,
          background: `
            radial-gradient(circle at 50% 20%, ${alpha(skin.frame.accent, 0.12)} 0%, rgba(0,0,0,0) 34%),
            linear-gradient(180deg, rgba(10, 12, 16, 0.24) 0%, rgba(5, 6, 9, 0.42) 42%, rgba(7, 8, 11, 0.78) 100%)
          `,
          '@keyframes battleStageProjectile': {
            '0%': {
              opacity: 0,
              transform: 'scaleX(0.12)',
            },
            '18%': {
              opacity: 0.92,
            },
            '100%': {
              opacity: 0,
              transform: 'scaleX(1)',
            },
          },
          '@keyframes battleStageImpact': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.22)',
            },
            '24%': {
              opacity: 0.96,
            },
            '100%': {
              opacity: 0,
              transform: 'scale(1.26)',
            },
          },
          '@keyframes battleStagePulse': {
            '0%': {
              opacity: 0.16,
            },
            '50%': {
              opacity: 0.36,
            },
            '100%': {
              opacity: 0.16,
            },
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 44%, rgba(0,0,0,0.28) 100%)',
            animation: 'battleStagePulse 2200ms ease-in-out infinite',
          }}
        />

        {ally ? <StagePortraitPanel portrait={ally} skin={skin} /> : null}
        {enemy ? <StagePortraitPanel portrait={enemy} skin={skin} /> : null}

        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: '0 28%',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 32%, rgba(0,0,0,0.14) 100%)',
          }}
        />

        {shouldShowPreviewProjectile ? (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: '48%',
              left: previewLeft,
              width: previewWidth,
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${alpha(previewColor, 0)} 0%, ${alpha(
                previewColor,
                0.95,
              )} 48%, ${alpha(previewColor, 0)} 100%)`,
              boxShadow: `0 0 18px ${alpha(previewColor, 0.42)}`,
              transformOrigin: previewSourceSide === 'ally' ? 'left center' : 'right center',
              transform:
                previewSourceSide === 'ally'
                  ? 'rotate(-4deg)'
                  : 'rotate(4deg) scaleX(-1)',
              animation: 'battleStageProjectile 560ms ease-out infinite',
            }}
          />
        ) : null}

        {recentImpact && impactColors ? (
          <>
            {recentImpact.sourceSide !== null && recentImpact.targetSide !== null ? (
              <Box
                key={`trail-${recentImpact.id}`}
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: '48%',
                  left: recentImpact.sourceSide === 'ally' ? '28%' : '38%',
                  width: recentImpact.sourceSide === recentImpact.targetSide ? '18%' : '30%',
                  height: 7,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${alpha(impactColors.edge, 0)} 0%, ${alpha(
                    impactColors.core,
                    0.96,
                  )} 46%, ${alpha(impactColors.edge, 0)} 100%)`,
                  boxShadow: `0 0 22px ${alpha(impactColors.core, 0.4)}`,
                  transform:
                    recentImpact.sourceSide === 'ally'
                      ? 'rotate(-5deg)'
                      : 'rotate(5deg) scaleX(-1)',
                  transformOrigin:
                    recentImpact.sourceSide === 'ally' ? 'left center' : 'right center',
                  animation: 'battleStageProjectile 620ms ease-out',
                }}
              />
            ) : null}
            <Box
              key={`impact-${recentImpact.id}`}
              aria-hidden="true"
              sx={{
                position: 'absolute',
                top: '34%',
                left: impactLeft,
                width: 92,
                height: 92,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(
                  impactColors.core,
                  0.92,
                )} 0%, ${alpha(impactColors.edge, 0.26)} 34%, rgba(0,0,0,0) 74%)`,
                filter: 'blur(1px)',
                animation: 'battleStageImpact 720ms ease-out',
              }}
            />
          </>
        ) : null}
      </Box>
    </Stack>
  );
}
