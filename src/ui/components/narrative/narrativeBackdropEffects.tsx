import type { ReactElement } from 'react';

import { Box } from '@mui/material';

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

export function parseNarrativeBackdropStyleTokens(style: string | readonly string[] | null | undefined) {
  if (!style) {
    return [];
  }

  const rawTokens =
    typeof style === 'string'
      ? style
        .split(/[+,]/)
        .flatMap((entry: string) => entry.trim().split(/\s+/))
      : [...style];

  return uniqueValues(rawTokens.map((entry: string) => entry.trim()).filter(Boolean));
}

export function buildNarrativeBackdropStyleToken(effectIds: readonly string[]) {
  const normalized = uniqueValues(effectIds.map((entry) => entry.trim()).filter(Boolean));

  return normalized.length > 0 ? normalized.join('+') : null;
}

function buildEffectLayer(key: string, sx: object) {
  return (
    <Box
      key={key}
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...sx,
      }}
    />
  );
}

function renderBloodBorderEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.88,
    backgroundImage: `
      radial-gradient(120% 90% at 0% 100%, rgba(104, 6, 12, 0.62) 0%, rgba(104, 6, 12, 0.18) 34%, transparent 62%),
      radial-gradient(120% 90% at 100% 100%, rgba(104, 6, 12, 0.58) 0%, rgba(104, 6, 12, 0.14) 34%, transparent 64%),
      linear-gradient(180deg, rgba(75, 4, 10, 0.18) 0%, transparent 18%),
      linear-gradient(90deg, rgba(118, 9, 18, 0.18) 0%, transparent 8%, transparent 92%, rgba(118, 9, 18, 0.2) 100%)
    `,
    mixBlendMode: 'screen',
    boxShadow: 'inset 0 0 0 1px rgba(148, 28, 43, 0.34), inset 0 0 48px rgba(56, 0, 0, 0.24)',
  });
}

function renderShadowVeilEffect(key: string) {
  return buildEffectLayer(key, {
    backgroundImage: `
      radial-gradient(120% 100% at 50% 52%, transparent 0%, rgba(6, 8, 12, 0.06) 38%, rgba(6, 8, 12, 0.32) 72%, rgba(6, 8, 12, 0.68) 100%),
      linear-gradient(180deg, rgba(3, 4, 8, 0.42) 0%, transparent 28%, transparent 72%, rgba(3, 4, 8, 0.32) 100%)
    `,
    mixBlendMode: 'multiply',
  });
}

function renderSmokeHazeEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.78,
    backgroundImage: `
      radial-gradient(55% 48% at 16% 22%, rgba(204, 193, 184, 0.14) 0%, rgba(94, 90, 88, 0.12) 42%, transparent 78%),
      radial-gradient(52% 44% at 82% 18%, rgba(182, 171, 160, 0.12) 0%, rgba(90, 84, 80, 0.1) 38%, transparent 74%),
      radial-gradient(64% 54% at 50% 70%, rgba(120, 114, 109, 0.12) 0%, transparent 68%)
    `,
    filter: 'blur(6px)',
    mixBlendMode: 'screen',
  });
}

function renderColdMorningSpillEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.82,
    backgroundImage: `
      linear-gradient(124deg, rgba(220, 234, 255, 0.42) 0%, rgba(174, 196, 234, 0.22) 18%, rgba(116, 146, 189, 0.08) 34%, transparent 56%),
      linear-gradient(180deg, rgba(239, 245, 255, 0.14) 0%, transparent 28%)
    `,
    mixBlendMode: 'screen',
  });
}

function renderGildedCeremonyEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.72,
    backgroundImage: `
      radial-gradient(60% 38% at 50% 12%, rgba(245, 209, 140, 0.26) 0%, rgba(245, 209, 140, 0.1) 44%, transparent 82%),
      linear-gradient(180deg, rgba(219, 173, 86, 0.08) 0%, transparent 34%)
    `,
    mixBlendMode: 'screen',
  });
}

function renderGlassRefractionEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.72,
    backgroundImage: `
      linear-gradient(112deg, transparent 0%, transparent 38%, rgba(214, 235, 231, 0.18) 45%, transparent 52%, transparent 100%),
      linear-gradient(140deg, transparent 0%, transparent 58%, rgba(183, 214, 224, 0.12) 66%, transparent 74%, transparent 100%)
    `,
    mixBlendMode: 'screen',
  });
}

function renderMoonSliceEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.8,
    backgroundImage: `
      linear-gradient(118deg, rgba(203, 221, 255, 0.34) 0%, rgba(152, 177, 218, 0.14) 14%, transparent 22%),
      linear-gradient(180deg, rgba(22, 28, 42, 0.12) 0%, transparent 22%)
    `,
    mixBlendMode: 'screen',
  });
}

function renderFirelightVignetteEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.74,
    backgroundImage: `
      radial-gradient(64% 56% at 50% 82%, rgba(255, 184, 90, 0.24) 0%, rgba(255, 184, 90, 0.06) 38%, transparent 70%),
      linear-gradient(180deg, rgba(32, 18, 8, 0.18) 0%, transparent 26%, transparent 78%, rgba(20, 10, 6, 0.2) 100%)
    `,
    mixBlendMode: 'screen',
  });
}

function renderAshHazeEffect(key: string) {
  return buildEffectLayer(key, {
    opacity: 0.72,
    backgroundImage: `
      linear-gradient(180deg, rgba(186, 156, 112, 0.1) 0%, rgba(88, 68, 48, 0.06) 28%, transparent 56%),
      radial-gradient(70% 60% at 50% 18%, rgba(166, 144, 118, 0.14) 0%, transparent 70%)
    `,
    mixBlendMode: 'screen',
  });
}

const NARRATIVE_BACKDROP_EFFECT_RENDERERS: Record<string, (key: string) => ReactElement> = {
  'ash-haze': renderAshHazeEffect,
  'blood-border': renderBloodBorderEffect,
  'cold-morning-spill': renderColdMorningSpillEffect,
  'firelight-vignette': renderFirelightVignetteEffect,
  'gilded-ceremony': renderGildedCeremonyEffect,
  'glass-refraction': renderGlassRefractionEffect,
  'moon-slice': renderMoonSliceEffect,
  'shadow-veil': renderShadowVeilEffect,
  'smoke-haze': renderSmokeHazeEffect,
};

export function renderNarrativeBackdropEffectLayers(style: string | readonly string[] | null | undefined) {
  const tokens = parseNarrativeBackdropStyleTokens(style);

  if (tokens.length === 0) {
    return null;
  }

  const layers: ReactElement[] = [];

  tokens.forEach((token, index) => {
    const renderer = NARRATIVE_BACKDROP_EFFECT_RENDERERS[token];

    if (renderer) {
      layers.push(renderer(`${token}-${index}`));
    }
  });

  return layers;
}
