import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { NarrativeAssetKind } from '@engine/types/narrative';
import {
  humanizeContentAssetLabel,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';
import {
  resolvePresentationBackdrop,
  resolvePresentationStagePortraits,
  type DialoguePresentationRuntime,
  type DialogueStagePortrait,
} from '@ui/components/dialogue/dialoguePresentation';
import {
  buildNarrativeBackdropBackground,
  renderNarrativeBackdropArchitectureLayer,
} from '@ui/components/narrative/narrativeBackdrop';
import { renderNarrativeBackdropEffectLayers } from '@ui/components/narrative/narrativeBackdropEffects';
import { NarrativePortraitFigure } from '@ui/components/narrative/NarrativePortraitFigure';
import { buildSceneFlowStageLayout } from '@ui/components/scene-flow/sceneFlowStageLayout';

const ACTIVE_ACCENT = '#f0cc8b';

interface SceneFlowPresentationShellProps extends PropsWithChildren {
  children: ReactNode;
  header?: ReactNode;
  mapAssetId?: string | null;
  showStage?: boolean;
  stageSx?: SxProps<Theme>;
  contentClassName?: string;
  contentSx?: SxProps<Theme>;
}

interface ResolvedSceneAssetLayer {
  assetId: string;
  kind: NarrativeAssetKind;
  label: string;
  url: string | null;
  isPlaceholder: boolean;
}

function toSxArray(value?: SxProps<Theme>) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? [...value] : [value];
}

function buildPresentationRuntime(
  runtime: ReturnType<typeof useGameRootStore>,
  sceneTitle: string | null,
): DialoguePresentationRuntime {
  const currentNode = runtime.sceneFlow.currentNode;

  return {
    currentBackgroundId: runtime.sceneFlow.currentBackgroundId,
    currentCgId: runtime.sceneFlow.currentCgId,
    currentEmotion: currentNode?.emotion ?? null,
    currentOverlayId: runtime.sceneFlow.currentOverlayId,
    currentPortraitId: currentNode?.portraitId ?? null,
    currentSceneTitle: sceneTitle,
    currentSpeakerId: currentNode?.speakerId ?? null,
    currentSpeakerSide: currentNode?.speakerSide ?? null,
    currentStage: runtime.sceneFlow.currentStage,
  };
}

function resolveSceneLayer(
  rootStore: ReturnType<typeof useGameRootStore>,
  assetId: string | null,
  kind: NarrativeAssetKind,
) {
  if (!assetId) {
    return null;
  }

  const asset = rootStore.getNarrativeAssetById(assetId);
  const url = resolveContentImageUrl(assetId, asset?.sourcePath);

  return {
    assetId,
    kind,
    label: asset?.label ?? humanizeContentAssetLabel(assetId),
    url,
    isPlaceholder: !url,
  } satisfies ResolvedSceneAssetLayer;
}

function ScenePresentationAssetLayer({
  ariaLabel,
  layer,
  mode,
}: {
  ariaLabel: string;
  layer: ResolvedSceneAssetLayer | null;
  mode: 'map' | 'cg' | 'overlay';
}) {
  if (!layer) {
    return null;
  }

  const placeholderTint =
    mode === 'cg'
      ? 'radial-gradient(circle at 50% 30%, rgba(255, 228, 180, 0.18) 0%, rgba(255, 228, 180, 0.03) 36%, rgba(255, 228, 180, 0) 64%)'
      : mode === 'overlay'
        ? 'linear-gradient(180deg, rgba(136, 173, 210, 0.16) 0%, rgba(136, 173, 210, 0.04) 36%, rgba(12, 16, 24, 0.02) 100%)'
        : 'radial-gradient(circle at 48% 52%, rgba(125, 176, 219, 0.18) 0%, rgba(125, 176, 219, 0.03) 32%, rgba(125, 176, 219, 0) 64%)';

  return (
    <Box
      aria-label={ariaLabel}
      className={`scene-flow-shell__asset-layer scene-flow-shell__asset-layer--${mode}`}
      data-asset-id={layer.assetId}
      data-placeholder={layer.isPlaceholder ? 'true' : 'false'}
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        className="scene-flow-shell__asset-image"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: layer.url ? `url("${layer.url}")` : placeholderTint,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: mode === 'cg' ? 'contain' : mode === 'map' ? 'cover' : 'cover',
          opacity: mode === 'cg' ? 0.42 : mode === 'overlay' ? 0.24 : 0.34,
          mixBlendMode: mode === 'overlay' ? 'screen' : 'normal',
        }}
      />

      {layer.isPlaceholder ? (
        <Box
          className="scene-flow-shell__asset-placeholder"
          sx={{
            position: 'absolute',
            top: { xs: 18, md: 24 },
            right: { xs: 18, md: 24 },
            px: 1.25,
            py: 0.65,
            borderRadius: '999px',
            border: `1px solid ${alpha('#f0cc8b', 0.2)}`,
            backgroundColor: alpha('#090b10', 0.5),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            sx={{
              color: alpha('#f7f1e5', 0.84),
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: '0.82rem',
              letterSpacing: '0.03em',
            }}
          >
            {layer.label}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

function DialoguePortraitPlaceholder({
  portrait,
  alignment,
}: {
  portrait: DialogueStagePortrait;
  alignment: 'left' | 'center' | 'right';
}) {
  const accentColor = portrait.isActive ? alpha(ACTIVE_ACCENT, 0.68) : alpha('#d4dde9', 0.18);
  const shoulderOffset =
    alignment === 'left'
      ? { right: '8%' }
      : alignment === 'right'
        ? { left: '8%' }
        : { left: '50%', transform: 'translateX(-50%)' };
  const dressPreset = portrait.placeholderPreset;
  const hasDress = dressPreset !== 'default';
  const dressClipPath =
    dressPreset === 'dress-ripped'
      ? 'polygon(38% 0, 62% 0, 76% 18%, 88% 56%, 72% 68%, 78% 82%, 64% 100%, 46% 84%, 34% 100%, 18% 80%, 26% 58%, 12% 40%, 20% 18%)'
      : dressPreset === 'dress-torn'
        ? 'polygon(30% 0, 70% 0, 86% 24%, 96% 100%, 74% 88%, 58% 100%, 42% 86%, 20% 100%, 6% 78%, 16% 20%)'
        : 'polygon(30% 0, 70% 0, 88% 24%, 98% 100%, 2% 100%, 12% 24%)';
  const dressBackground =
    dressPreset === 'dress-ripped'
      ? 'linear-gradient(180deg, rgba(152, 122, 136, 0.42) 0%, rgba(76, 64, 84, 0.64) 36%, rgba(16, 19, 26, 0.96) 100%)'
      : dressPreset === 'dress-torn'
        ? 'linear-gradient(180deg, rgba(176, 144, 159, 0.5) 0%, rgba(101, 81, 96, 0.7) 34%, rgba(17, 20, 27, 0.96) 100%)'
        : 'linear-gradient(180deg, rgba(198, 168, 188, 0.58) 0%, rgba(126, 103, 122, 0.72) 32%, rgba(18, 21, 28, 0.96) 100%)';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: { xs: '10% 8% 0', md: '4% 10% 0' },
        WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 82%, transparent 100%)',
        maskImage: 'linear-gradient(180deg, black 0%, black 82%, transparent 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: hasDress ? '18% 22% 28%' : '18% 12% 0',
          clipPath: 'polygon(50% 0, 68% 7%, 81% 17%, 90% 33%, 96% 61%, 100% 100%, 0 100%, 4% 61%, 10% 33%, 19% 17%, 32% 7%)',
          background:
            'linear-gradient(180deg, rgba(255, 230, 183, 0.14) 0%, rgba(94, 105, 125, 0.32) 8%, rgba(33, 39, 48, 0.98) 42%, rgba(8, 10, 14, 1) 100%)',
          border: `1px solid ${accentColor}`,
          boxShadow: portrait.isActive
            ? '0 32px 42px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 231, 186, 0.08)'
            : '0 20px 28px rgba(0, 0, 0, 0.34)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '4%',
          left: '50%',
          width: '24%',
          aspectRatio: '1 / 1',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 42% 34%, rgba(252, 235, 200, 0.72) 0%, rgba(175, 186, 205, 0.3) 26%, rgba(29, 35, 44, 0.98) 75%)',
          border: `1px solid ${alpha('#ffe5b3', 0.2)}`,
          boxShadow: '0 18px 26px rgba(0, 0, 0, 0.22)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '22%',
          width: '24%',
          height: '28%',
          ...shoulderOffset,
          clipPath: 'polygon(22% 0, 100% 12%, 82% 100%, 0 84%)',
          background: 'linear-gradient(180deg, rgba(142, 152, 172, 0.5) 0%, rgba(18, 22, 28, 0.96) 100%)',
          opacity: 0.84,
        }}
      />
      {hasDress ? (
        <Box
          sx={{
            position: 'absolute',
            inset: '34% 14% 0',
            clipPath: dressClipPath,
            background: dressBackground,
            border: `1px solid ${alpha('#eed9fb', portrait.isActive ? 0.24 : 0.14)}`,
            boxShadow: '0 24px 34px rgba(0, 0, 0, 0.24)',
          }}
        />
      ) : null}
      <Box
        sx={{
          position: 'absolute',
          inset: '38% 34% 30%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, rgba(245, 220, 164, 0.44) 0%, rgba(245, 220, 164, 0.02) 100%)',
          filter: 'blur(12px)',
          opacity: portrait.isActive ? 0.3 : 0.16,
        }}
      />
    </Box>
  );
}

function getPortraitAlignment(index: number, total: number): 'left' | 'center' | 'right' {
  if (index === 0) {
    return 'left';
  }

  if (index === total - 1) {
    return 'right';
  }

  return 'center';
}

function getPortraitWidth(total: number) {
  if (total >= 4) {
    return { xs: 'min(24vw, 152px)', sm: 172, md: 210, xl: 240 };
  }

  if (total === 3) {
    return { xs: 'min(30vw, 176px)', sm: 198, md: 238, xl: 280 };
  }

  return { xs: 'min(42vw, 220px)', sm: 260, md: 320, xl: 360 };
}

function StagePortrait({
  portrait,
  index,
  layout,
  total,
}: {
  portrait: DialogueStagePortrait;
  index: number;
  layout: ReturnType<typeof buildSceneFlowStageLayout>[number];
  total: number;
}) {
  const alignment = getPortraitAlignment(index, total);
  const hasPortraitSubject = Boolean(
    portrait.displayName ||
      portrait.portrait.type === 'composite' ||
      (portrait.portrait.type === 'asset' && portrait.portrait.url),
  );

  if (!hasPortraitSubject) {
    return null;
  }

  return (
    <Box
      aria-label={`stage portrait ${portrait.speakerId}`}
      className={`scene-flow-shell__portrait scene-flow-shell__portrait--${alignment}${portrait.isActive ? ' is-active' : ''}`}
      data-outfit-id={portrait.outfitId ?? undefined}
      data-portrait-mode={portrait.portrait.type}
      data-stage-side={alignment}
      data-stage-position={layout.left}
      data-stage-scale={layout.scale}
      data-speaker-id={portrait.speakerId}
      sx={{
        position: 'absolute',
        left: layout.left,
        bottom: layout.bottom,
        width: layout.width,
        height: '100%',
        maxHeight: 760,
        maxWidth: getPortraitWidth(total),
        transform: `translateX(-50%) translateY(${portrait.isActive ? 0 : 18}px) scale(${layout.scale * (portrait.isActive ? 1.08 : 0.94)})`,
        zIndex: layout.zIndex,
        pointerEvents: 'none',
        opacity: layout.opacity * (portrait.isActive ? 1 : 0.58),
        transition:
          'left 360ms cubic-bezier(0.22, 1, 0.36, 1), bottom 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease',
        willChange: 'left, bottom, transform, opacity, filter',
        filter: portrait.isActive
          ? 'drop-shadow(0 30px 40px rgba(0, 0, 0, 0.46)) drop-shadow(0 0 20px rgba(240, 204, 139, 0.14))'
          : 'drop-shadow(0 18px 28px rgba(0, 0, 0, 0.34))',
      }}
    >
      <Box
        className="scene-flow-shell__portrait-figure"
        sx={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 78%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, black 0%, black 78%, transparent 100%)',
        }}
      >
        <NarrativePortraitFigure
          objectPosition={
            alignment === 'left'
              ? 'left bottom'
              : alignment === 'right'
                ? 'right bottom'
                : 'center bottom'
          }
          portrait={portrait.portrait}
          renderPlaceholder={() => (
            <DialoguePortraitPlaceholder alignment={alignment} portrait={portrait} />
          )}
        />
      </Box>

      <Box
        className="scene-flow-shell__portrait-shadow"
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 16 },
          [alignment === 'right' ? 'right' : 'left']: { xs: 4, md: 10 },
          width: '72%',
          height: 20,
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0) 72%)',
          filter: 'blur(10px)',
        }}
      />
    </Box>
  );
}

function getTransitionDurationMs(type: string, durationMs?: number) {
  if (durationMs) {
    return durationMs;
  }

  if (type === 'cut') {
    return 90;
  }

  if (type === 'flash') {
    return 240;
  }

  return 420;
}

function resolveTransitionPresentation(type: string) {
  if (type === 'flash') {
    return {
      background:
        'radial-gradient(circle at 50% 46%, rgba(248, 243, 232, 0.32) 0%, rgba(248, 243, 232, 0.16) 28%, rgba(248, 243, 232, 0) 72%)',
      mixBlendMode: 'screen' as const,
      animationName: 'sceneFlowTransitionFlash',
      initialOpacity: 0.68,
    };
  }

  if (type === 'dissolve') {
    return {
      background:
        'radial-gradient(circle at 50% 40%, rgba(235, 224, 205, 0.2) 0%, rgba(16, 20, 28, 0.26) 52%, rgba(7, 10, 16, 0.38) 100%)',
      mixBlendMode: 'screen' as const,
      animationName: 'sceneFlowTransitionDissolve',
      initialOpacity: 0.52,
    };
  }

  if (type === 'cut') {
    return {
      background: 'rgba(4, 5, 8, 0.76)',
      mixBlendMode: 'normal' as const,
      animationName: 'sceneFlowTransitionCut',
      initialOpacity: 1,
    };
  }

  return {
    background:
      'radial-gradient(circle at 50% 44%, rgba(7, 10, 16, 0.02) 0%, rgba(7, 10, 16, 0.18) 44%, rgba(7, 10, 16, 0.34) 100%)',
    mixBlendMode: 'multiply' as const,
    animationName: 'sceneFlowTransitionFade',
    initialOpacity: 0.48,
  };
}

function SceneFlowTransitionLayer() {
  const rootStore = useGameRootStore();
  const transition = rootStore.sceneFlow.activeSession?.presentation.activeTransition ?? null;
  const transitionKey = transition
    ? `${rootStore.sceneFlow.activeSession?.sessionId ?? 'ambient'}:${transition.type}:${transition.durationMs ?? 0}`
    : null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeTransition, setActiveTransition] = useState<typeof transition>(null);

  useEffect(() => {
    if (!transition || !transitionKey) {
      setActiveTransition(null);
      setActiveKey(null);

      return;
    }

    setActiveTransition(transition);
    setActiveKey(transitionKey);

    const scheduledKey = transitionKey;
    const timeoutId = globalThis.setTimeout(() => {
      setActiveKey((currentKey) => {
        if (currentKey !== scheduledKey) {
          return currentKey;
        }

        setActiveTransition(null);

        return null;
      });
    }, getTransitionDurationMs(transition.type, transition.durationMs));

    return () => {
      clearTimeout(timeoutId);
    };
  }, [transition, transitionKey]);

  if (!activeTransition || !activeKey) {
    return null;
  }

  const animationDuration = `${getTransitionDurationMs(activeTransition.type, activeTransition.durationMs)}ms`;
  const presentation = resolveTransitionPresentation(activeTransition.type);

  return (
    <Box
      data-testid="scene-transition-layer"
      data-transition-type={activeTransition.type}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        background: presentation.background,
        mixBlendMode: presentation.mixBlendMode,
        animation:
          presentation.animationName === 'sceneFlowTransitionCut'
            ? `${presentation.animationName} ${animationDuration} steps(1, end)`
            : `${presentation.animationName} ${animationDuration} ease-out`,
        '@keyframes sceneFlowTransitionFade': {
          '0%': {
            opacity: presentation.initialOpacity,
          },
          '100%': {
            opacity: 0,
          },
        },
        '@keyframes sceneFlowTransitionDissolve': {
          '0%': {
            opacity: presentation.initialOpacity,
          },
          '100%': {
            opacity: 0,
          },
        },
        '@keyframes sceneFlowTransitionFlash': {
          '0%': {
            opacity: presentation.initialOpacity,
          },
          '58%': {
            opacity: presentation.initialOpacity * 0.46,
          },
          '100%': {
            opacity: 0,
          },
        },
        '@keyframes sceneFlowTransitionCut': {
          '0%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
      }}
    />
  );
}

export const SceneFlowPresentationShell = observer(function SceneFlowPresentationShell({
  children,
  header,
  mapAssetId = null,
  showStage = true,
  stageSx,
  contentClassName,
  contentSx,
}: SceneFlowPresentationShellProps) {
  const rootStore = useGameRootStore();
  const sceneTitle = rootStore.dialogue.currentSceneTitle ?? rootStore.sceneFlow.currentFlow?.title ?? null;
  const presentationRuntime = buildPresentationRuntime(rootStore, sceneTitle);
  const backdrop = resolvePresentationBackdrop(
    rootStore,
    presentationRuntime,
    rootStore.sceneFlow.currentFlow?.title ?? 'Scene Flow',
  );
  const mapLayer = resolveSceneLayer(rootStore, mapAssetId, 'map');
  const cgLayer = resolveSceneLayer(rootStore, rootStore.sceneFlow.currentCgId, 'cg');
  const overlayLayer = resolveSceneLayer(rootStore, rootStore.sceneFlow.currentOverlayId, 'overlay');
  const portraits = showStage ? resolvePresentationStagePortraits(rootStore, presentationRuntime) : [];
  const portraitLayouts = buildSceneFlowStageLayout(portraits);
  const shellContentClassName = contentClassName
    ? `scene-flow-shell__content ${contentClassName}`
    : 'scene-flow-shell__content';

  return (
    <Box
      className="scene-flow-shell"
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: buildNarrativeBackdropBackground(backdrop),
      }}
    >
      {renderNarrativeBackdropArchitectureLayer(backdrop)}
      {renderNarrativeBackdropEffectLayers(rootStore.sceneFlow.currentBackgroundStyle)}

      <Box
        className="scene-flow-shell__backdrop-veil"
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 12, 0.04) 0%, rgba(5, 7, 12, 0.08) 26%, rgba(5, 7, 12, 0.48) 68%, rgba(5, 7, 12, 0.88) 100%)',
        }}
      />

      <Box className="scene-flow-shell__map-layer" sx={{ position: 'absolute', inset: 0, zIndex: 0.5 }}>
        <ScenePresentationAssetLayer ariaLabel="scene map layer" layer={mapLayer} mode="map" />
      </Box>

      <Box className="scene-flow-shell__cg-layer" sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <ScenePresentationAssetLayer ariaLabel="scene cg layer" layer={cgLayer} mode="cg" />
      </Box>

      {showStage && portraits.length > 0 ? (
        <Box
          className="scene-flow-shell__stage"
          sx={[
            {
              position: 'absolute',
              inset: 0,
              px: { xs: '0.75rem', sm: '1.5rem', md: '2.5rem', xl: '4rem' },
              pt: { xs: '0.75rem', md: '1.25rem' },
              pb: { xs: '2.5rem', md: '3.75rem' },
              pointerEvents: 'none',
              zIndex: 2,
            },
            ...toSxArray(stageSx),
          ]}
        >
          {portraits.map((portrait, index) => (
            <StagePortrait
              key={`${portrait.speakerId}-${index}`}
              index={index}
              layout={portraitLayouts[index] ?? portraitLayouts[portraitLayouts.length - 1]!}
              portrait={portrait}
              total={portraits.length}
            />
          ))}
        </Box>
      ) : null}

      <Box className="scene-flow-shell__overlay-layer" sx={{ position: 'absolute', inset: 0, zIndex: 2.5 }}>
        <ScenePresentationAssetLayer ariaLabel="scene overlay layer" layer={overlayLayer} mode="overlay" />
      </Box>

      <SceneFlowTransitionLayer />

      {header ? (
        <Box
          className="scene-flow-shell__header"
          sx={{
            position: 'absolute',
            top: { xs: 20, md: 28 },
            left: { xs: 20, md: 30 },
            zIndex: 4,
            maxWidth: { xs: 'calc(100% - 40px)', md: 560 },
          }}
        >
          {header}
        </Box>
      ) : null}

      <Box
        className={shellContentClassName}
        sx={[
          {
            position: 'relative',
            zIndex: 4,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
          ...toSxArray(contentSx),
        ]}
      >
        {children}
      </Box>
    </Box>
  );
});
