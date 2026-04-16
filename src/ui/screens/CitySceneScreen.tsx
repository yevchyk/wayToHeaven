import { useState } from 'react';

import { observer } from 'mobx-react-lite';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { CitySceneAction, CitySceneData } from '@engine/types/city';
import { formatTimeCost } from '@engine/types/time';
import { getNarrativeAccessibleText } from '@engine/utils/narrativeHtml';
import { getCityActionToneStyle } from '@ui/components/city/cityActionToneStyles';
import {
  formatSpeakerLabel,
  resolveNarrativePortraitVisual,
  resolveNarrativeVisualAsset,
  type DialoguePortraitVisual,
  type DialogueVisualAsset,
} from '@ui/components/dialogue/dialoguePresentation';
import {
  buildNarrativeBackdropBackground,
  renderNarrativeBackdropArchitectureLayer,
} from '@ui/components/narrative/narrativeBackdrop';
import { NarrativePortraitFigure } from '@ui/components/narrative/NarrativePortraitFigure';
import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import { SceneFlowPresentationShell } from '@ui/components/scene-flow/SceneFlowPresentationShell';
import { SectionCard } from '@ui/components/SectionCard';

const HEROINE_SPEAKER_ID = 'mirella';
const HEROINE_RUNTIME_UNIT_ID = 'main-hero';
const HIDDEN_PREVIEW_SPEAKER_IDS = new Set(['mirella', 'heroine']);

interface PreviewCharacter {
  id: string;
  name: string;
  portrait: DialoguePortraitVisual;
}

interface ActionPreview {
  kind: 'scene' | 'dialogue' | 'event';
  label: string;
  title: string;
  backdrop: DialogueVisualAsset;
  characters: PreviewCharacter[];
}

interface PreviewEventHandlers {
  onBlur: () => void;
  onFocus: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function buildSceneMetaLine(scene: CitySceneData) {
  return [scene.cityName, scene.districtLabel].filter(Boolean).join(' · ');
}

function buildPanelSx() {
  return {
    borderRadius: 4,
    border: `1px solid ${alpha('#f0cc8b', 0.14)}`,
    background:
      'linear-gradient(180deg, rgba(10, 13, 18, 0.52) 0%, rgba(8, 10, 14, 0.76) 38%, rgba(5, 7, 10, 0.9) 100%)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 54px rgba(0, 0, 0, 0.26)',
  };
}

function getPreviewLabel(action: CitySceneAction) {
  if (action.nextSceneId) {
    return 'Локація';
  }

  if (action.dialogueId) {
    return 'Розмова';
  }

  if (action.travelBoardId) {
    return 'Маршрут';
  }

  if (action.battleTemplateId) {
    return 'Сутичка';
  }

  if (action.effects?.some((effect) => effect.type === 'changeLocation')) {
    return 'Вихід';
  }

  return 'Подія';
}

function resolvePreviewCharacters(rootStore: ReturnType<typeof useGameRootStore>, action: CitySceneAction) {
  if (!action.dialogueId) {
    return [] as PreviewCharacter[];
  }

  const dialogue = rootStore.getDialogueById(action.dialogueId);
  const uniqueSpeakerIds = Array.from(new Set(dialogue?.speakerIds ?? []));
  const prioritizedSpeakerIds = uniqueSpeakerIds.filter((speakerId) => !HIDDEN_PREVIEW_SPEAKER_IDS.has(speakerId));
  const speakerIds = (prioritizedSpeakerIds.length > 0 ? prioritizedSpeakerIds : uniqueSpeakerIds).slice(0, 2);

  return speakerIds.map((speakerId) => {
    const character = rootStore.getNarrativeCharacterById(speakerId);
    const name = character?.displayName ?? formatSpeakerLabel(speakerId) ?? speakerId;

    return {
      id: speakerId,
      name,
      portrait: resolveNarrativePortraitVisual(
        rootStore,
        {
          speakerId,
          emotion: character?.defaultEmotion ?? null,
          portraitId: null,
          outfitId: rootStore.appearance.getCurrentOutfitId(speakerId),
          fallbackLabel: name,
        },
      ),
    };
  });
}

function resolveActionPreview(
  rootStore: ReturnType<typeof useGameRootStore>,
  currentScene: CitySceneData,
  action: CitySceneAction,
): ActionPreview {
  const previewLabel = getPreviewLabel(action);

  if (action.nextSceneId) {
    const targetScene = rootStore.getCitySceneById(action.nextSceneId) ?? null;
    const fallbackText = getNarrativeAccessibleText(action.text) || action.id;

    return {
      kind: 'scene',
      label: previewLabel,
      title: targetScene?.locationName ?? action.text,
      backdrop: resolveNarrativeVisualAsset(
        rootStore,
        targetScene?.backgroundId ?? currentScene.backgroundId ?? null,
        'background',
        targetScene?.locationName ?? fallbackText,
      ),
      characters: [],
    };
  }

  if (action.dialogueId) {
    const dialogue = rootStore.getDialogueById(action.dialogueId);
    const characters = resolvePreviewCharacters(rootStore, action);
    const fallbackText = getNarrativeAccessibleText(action.text) || action.id;

    return {
      kind: 'dialogue',
      label: previewLabel,
      title: characters[0]?.name ?? action.text,
      backdrop: resolveNarrativeVisualAsset(
        rootStore,
        dialogue?.meta?.defaultBackgroundId ?? currentScene.backgroundId ?? null,
        'background',
        fallbackText,
      ),
      characters,
    };
  }

  const fallbackText = getNarrativeAccessibleText(action.text) || action.id;

  return {
    kind: 'event',
    label: previewLabel,
    title: action.text,
    backdrop: resolveNarrativeVisualAsset(
      rootStore,
      currentScene.backgroundId ?? null,
      'background',
      fallbackText,
    ),
    characters: [],
  };
}

export const CitySceneScreen = observer(function CitySceneScreen() {
  const rootStore = useGameRootStore();
  const scene = rootStore.city.currentScene;
  const actions = scene ? rootStore.citySceneController.getVisibleActions() : [];
  const [previewActionId, setPreviewActionId] = useState<string | null>(null);

  if (!scene) {
    return (
      <SectionCard eyebrow="Місто" title="Сцена ще не відкрита">
        <Button onClick={() => rootStore.citySceneController.startScene('chapter-1/city/temple-exit')} variant="contained">
          Увійти в місто
        </Button>
      </SectionCard>
    );
  }

  const sceneMetaLine = buildSceneMetaLine(scene);
  const navigationActions = actions.filter((action) => Boolean(action.nextSceneId));
  const localActions = actions.filter((action) => !action.nextSceneId);
  const previewAction = previewActionId ? actions.find((action) => action.id === previewActionId) ?? null : null;
  const activePreview = previewAction ? resolveActionPreview(rootStore, scene, previewAction) : null;
  const heroineCharacter = rootStore.getNarrativeCharacterById(HEROINE_SPEAKER_ID);
  const heroinePortrait = resolveNarrativePortraitVisual(
    rootStore,
    {
      speakerId: HEROINE_SPEAKER_ID,
      emotion: heroineCharacter?.defaultEmotion ?? null,
      portraitId: null,
      outfitId: rootStore.appearance.getCurrentOutfitId(HEROINE_SPEAKER_ID),
      fallbackLabel: heroineCharacter?.displayName ?? 'Героїня',
    },
  );
  const heroineUnit =
    rootStore.party.getUnit(HEROINE_RUNTIME_UNIT_ID) ??
    (rootStore.party.playerUnitId ? rootStore.party.getUnit(rootStore.party.playerUnitId) : null) ??
    rootStore.party.activeUnits[0] ??
    null;

  const bindPreview = (actionId: string) => ({
    onBlur: () => {
      setPreviewActionId((currentActionId) => (currentActionId === actionId ? null : currentActionId));
    },
    onFocus: () => {
      setPreviewActionId(actionId);
    },
    onMouseEnter: () => {
      setPreviewActionId(actionId);
    },
    onMouseLeave: () => {
      setPreviewActionId((currentActionId) => (currentActionId === actionId ? null : currentActionId));
    },
  });

  return (
    <SceneFlowPresentationShell>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top, rgba(244, 224, 176, 0.18) 0%, rgba(244, 224, 176, 0) 28%), linear-gradient(180deg, rgba(6, 8, 12, 0.06) 0%, rgba(6, 8, 12, 0.26) 34%, rgba(6, 8, 12, 0.72) 68%, rgba(6, 8, 12, 0.94) 100%)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(4, 6, 10, 0.74) 0%, rgba(4, 6, 10, 0.42) 22%, rgba(4, 6, 10, 0.26) 50%, rgba(4, 6, 10, 0.42) 78%, rgba(4, 6, 10, 0.74) 100%)',
        }}
      />

      <Stack
        aria-label={`City background ${scene.locationName}`}
        spacing={{ xs: 2.5, lg: 3 }}
        sx={{
          position: 'relative',
          minHeight: '100%',
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          pt: { xs: 12, md: 14 },
          pb: { xs: 3, md: 4 },
        }}
      >
        <Stack spacing={0.9} sx={{ maxWidth: 760 }}>
          {sceneMetaLine ? (
            <Typography
              sx={{
                color: alpha('#f4ddb0', 0.84),
                fontSize: '0.78rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              {sceneMetaLine}
            </Typography>
          ) : null}

          <Typography
            component="h1"
            sx={{
              color: '#fbf6ea',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: '2.05rem', md: '3.2rem', xl: '3.8rem' },
              lineHeight: 0.94,
              textShadow: '0 12px 30px rgba(0, 0, 0, 0.42)',
            }}
            variant="h1"
          >
            {scene.locationName}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(240px, 280px) minmax(0, 1fr) minmax(280px, 340px)',
            },
            gap: 2,
            alignItems: 'start',
            flex: 1,
          }}
        >
          <HeroinePanel heroinePortrait={heroinePortrait} heroineUnit={heroineUnit} heroineName={heroineCharacter?.displayName ?? 'Героїня'} />

          <Box sx={{ ...buildPanelSx(), p: { xs: 2, md: 2.5 }, minHeight: 420 }}>
            <Stack spacing={1.4}>
              <Stack spacing={0.4}>
                <Typography
                  sx={{ color: alpha('#f4ddb0', 0.82), fontSize: '0.76rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}
                >
                  Події цієї точки
                </Typography>
                <Typography sx={{ color: '#fbf6ea', fontFamily: '"Spectral", Georgia, serif' }} variant="h4">
                  Дії тут і зараз
                </Typography>
              </Stack>

              <Stack spacing={1}>
                {localActions.map((action) => (
                  <LocalActionRow
                    action={action}
                    key={action.id}
                    onChoose={() => rootStore.citySceneController.chooseAction(action.id)}
                    previewHandlers={bindPreview(action.id)}
                  />
                ))}

                {localActions.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Тут поки що тихо.
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Box>

          <ActionPreviewPanel preview={activePreview} />
        </Box>

        {navigationActions.length > 0 ? (
          <Box sx={{ ...buildPanelSx(), p: { xs: 1.5, md: 2 } }}>
            <Stack spacing={1.1}>
              <Typography
                sx={{ color: alpha('#f4ddb0', 0.82), fontSize: '0.76rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}
              >
                Куди йти далі
              </Typography>

              <Box sx={{ overflowX: 'auto', pb: 0.4 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    gridAutoColumns: {
                      xs: 'minmax(220px, 72vw)',
                      sm: 'minmax(240px, 260px)',
                    },
                    gap: 1.25,
                  }}
                >
                  {navigationActions.map((action) => (
                    <DestinationStripCard
                      action={action}
                      currentScene={scene}
                      key={action.id}
                      onChoose={() => rootStore.citySceneController.chooseAction(action.id)}
                      previewHandlers={bindPreview(action.id)}
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </SceneFlowPresentationShell>
  );
});

function HeroinePanel({
  heroinePortrait,
  heroineUnit,
  heroineName,
}: {
  heroinePortrait: DialoguePortraitVisual;
  heroineUnit: { currentHp: number; currentMana: number; derivedStats: { maxHp: number; maxMana: number } } | null;
  heroineName: string;
}) {
  return (
    <Box
      sx={{
        ...buildPanelSx(),
        overflow: 'hidden',
        minHeight: 420,
        position: { lg: 'sticky' },
        top: { lg: 120 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: 320,
          background:
            'linear-gradient(180deg, rgba(9, 11, 17, 0.08) 0%, rgba(9, 11, 17, 0.24) 32%, rgba(9, 11, 17, 0.74) 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 24%, rgba(244, 224, 176, 0.16) 0%, rgba(244, 224, 176, 0) 30%)',
          }}
        />

        <NarrativePortraitFigure
          portrait={heroinePortrait}
          sx={{
            position: 'absolute',
            inset: '6% 4% 0',
            width: '92%',
            height: '94%',
            filter: 'drop-shadow(0 28px 30px rgba(0, 0, 0, 0.38))',
            userSelect: 'none',
          }}
          renderPlaceholder={() => (
            <Box
              sx={{
                position: 'absolute',
                inset: '12% 14% 0',
                borderRadius: '999px 999px 26px 26px',
                background:
                  'linear-gradient(180deg, rgba(255, 229, 179, 0.18) 0%, rgba(132, 144, 165, 0.24) 16%, rgba(22, 27, 34, 0.94) 68%, rgba(7, 9, 12, 1) 100%)',
              }}
            />
          )}
        />
      </Box>

      <Stack spacing={1.1} sx={{ p: 2 }}>
        <Typography sx={{ color: '#fbf6ea', fontFamily: '"Spectral", Georgia, serif' }} variant="h5">
          {heroineName}
        </Typography>
        <ResourceBar
          color="linear-gradient(90deg, rgba(219, 111, 96, 0.96), rgba(255, 172, 147, 0.98))"
          label="HP"
          maxValue={heroineUnit?.derivedStats.maxHp ?? 0}
          value={heroineUnit?.currentHp ?? 0}
        />
        <ResourceBar
          color="linear-gradient(90deg, rgba(90, 132, 234, 0.96), rgba(138, 202, 255, 0.98))"
          label="Mana"
          maxValue={heroineUnit?.derivedStats.maxMana ?? 0}
          value={heroineUnit?.currentMana ?? 0}
        />
      </Stack>
    </Box>
  );
}

function ResourceBar({
  color,
  label,
  maxValue,
  value,
}: {
  color: string;
  label: string;
  maxValue: number;
  value: number;
}) {
  const safeMaxValue = maxValue > 0 ? maxValue : 1;
  const ratio = Math.max(0, Math.min(1, value / safeMaxValue));

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography sx={{ color: alpha('#f4ddb0', 0.88), fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ color: '#f3efe7', fontSize: '0.88rem' }}>
          {value}/{maxValue}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor: alpha('#ffffff', 0.08),
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${ratio * 100}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </Box>
    </Stack>
  );
}

function LocalActionRow({
  action,
  onChoose,
  previewHandlers,
}: {
  action: CitySceneAction;
  onChoose: () => void;
  previewHandlers: PreviewEventHandlers;
}) {
  const toneStyle = getCityActionToneStyle(action.tone ?? 'neutral');

  return (
    <Button
      aria-label={getNarrativeAccessibleText(action.text) || action.id}
      data-testid={`city-action-${action.id}`}
      data-tone={action.tone ?? 'neutral'}
      onClick={onChoose}
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 64,
        px: 1.8,
        py: 1.2,
        borderRadius: 3,
        border: `1px solid ${toneStyle.accent}`,
        backgroundColor: alpha('#07090d', 0.22),
        boxShadow: `inset 0 0 0 1px ${toneStyle.glow}, 0 10px 24px ${alpha('#000000', 0.18)}`,
        color: '#f3efe7',
        textAlign: 'left',
        '&:hover': {
          borderColor: toneStyle.accent,
          backgroundColor: alpha(toneStyle.muted, 0.8),
        },
      }}
      variant="outlined"
      {...previewHandlers}
    >
      <NarrativeRichText
        component="div"
        html={action.text}
        sx={{ color: '#fbf6ea', fontSize: '1rem', fontWeight: 700, pr: 1.25 }}
      />
      {action.timeCost ? (
        <Typography
          sx={{
            color: alpha('#f4ddb0', 0.88),
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            mr: 0.8,
          }}
        >
          {formatTimeCost(action.timeCost)}
        </Typography>
      ) : null}
      <ArrowOutwardRoundedIcon sx={{ color: toneStyle.accent, fontSize: 18, flexShrink: 0 }} />
    </Button>
  );
}

function DestinationStripCard({
  action,
  currentScene,
  onChoose,
  previewHandlers,
}: {
  action: CitySceneAction;
  currentScene: CitySceneData;
  onChoose: () => void;
  previewHandlers: PreviewEventHandlers;
}) {
  const rootStore = useGameRootStore();
  const targetScene = action.nextSceneId ? rootStore.getCitySceneById(action.nextSceneId) ?? null : null;
  const toneStyle = getCityActionToneStyle(action.tone ?? 'neutral');
  const previewBackdrop = resolveNarrativeVisualAsset(
    rootStore,
    targetScene?.backgroundId ?? currentScene.backgroundId ?? null,
    'background',
    targetScene?.locationName ?? action.text,
  );

  return (
    <Button
      aria-label={getNarrativeAccessibleText(action.text) || action.id}
      data-testid={`city-action-${action.id}`}
      data-tone={action.tone ?? 'neutral'}
      onClick={onChoose}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        p: 0,
        minHeight: 150,
        borderRadius: 3,
        border: `1px solid ${toneStyle.accent}`,
        background: buildNarrativeBackdropBackground(previewBackdrop),
        textAlign: 'left',
        boxShadow: '0 18px 36px rgba(0, 0, 0, 0.24)',
        '&:hover': {
          borderColor: toneStyle.accent,
          transform: 'translateY(-2px)',
        },
      }}
      variant="outlined"
      {...previewHandlers}
    >
      {renderNarrativeBackdropArchitectureLayer(previewBackdrop)}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(7, 10, 15, 0.02) 0%, rgba(7, 10, 15, 0.12) 30%, rgba(7, 10, 15, 0.52) 76%, rgba(7, 10, 15, 0.88) 100%)',
        }}
      />

      <Stack
        justifyContent="space-between"
        spacing={1.1}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          p: 1.6,
        }}
      >
        <Typography
          sx={{
            color: alpha('#f4ddb0', 0.84),
            fontSize: '0.74rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {[targetScene?.districtLabel ?? currentScene.cityName, action.timeCost ? formatTimeCost(action.timeCost) : null]
            .filter(Boolean)
            .join(' • ')}
        </Typography>

        <NarrativeRichText
          component="h3"
          html={targetScene?.locationName ?? action.text}
          sx={{
            color: '#fff7ea',
            fontFamily: '"Spectral", Georgia, serif',
            fontSize: '1.35rem',
            lineHeight: 0.98,
          }}
        />
      </Stack>
    </Button>
  );
}

function ActionPreviewPanel({ preview }: { preview: ActionPreview | null }) {
  if (!preview) {
    return (
      <Box
        aria-label="City action preview"
        sx={{
          ...buildPanelSx(),
          minHeight: 420,
          position: { lg: 'sticky' },
          top: { lg: 120 },
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          '&::before': {
            content: '""',
            width: '48%',
            height: '48%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 224, 176, 0.08) 0%, rgba(244, 224, 176, 0) 72%)',
            filter: 'blur(16px)',
          },
        }}
      />
    );
  }

  const mainCharacter = preview.characters[0] ?? null;
  const secondaryCharacters = preview.characters.slice(1);

  return (
    <Box
      aria-label="City action preview"
      sx={{
        ...buildPanelSx(),
        position: { lg: 'sticky' },
        top: { lg: 120 },
        minHeight: 420,
        overflow: 'hidden',
        background: buildNarrativeBackdropBackground(preview.backdrop),
      }}
    >
      {renderNarrativeBackdropArchitectureLayer(preview.backdrop)}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(7, 10, 15, 0.06) 0%, rgba(7, 10, 15, 0.18) 28%, rgba(7, 10, 15, 0.6) 76%, rgba(7, 10, 15, 0.92) 100%)',
        }}
      />

      {mainCharacter ? (
        <NarrativePortraitFigure
          portrait={mainCharacter.portrait}
          sx={{
            position: 'absolute',
            inset: '8% 6% 0',
            width: '88%',
            height: '86%',
            filter: 'drop-shadow(0 24px 28px rgba(0, 0, 0, 0.38))',
            userSelect: 'none',
          }}
        />
      ) : null}

      <Stack
        justifyContent="space-between"
        spacing={1.25}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: 420,
          p: 2,
        }}
      >
        <Typography
          sx={{
            color: alpha('#f4ddb0', 0.88),
            fontSize: '0.76rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {preview.label}
        </Typography>

        <Stack spacing={0.65} sx={{ mt: 'auto', alignItems: 'flex-start' }}>
          <NarrativeRichText
            component="div"
            html={preview.title}
            sx={{
              color: '#fff7ea',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: '1.55rem', md: '1.8rem' },
              lineHeight: 0.98,
            }}
          />

          {secondaryCharacters.map((character) => (
            <Typography key={character.id} sx={{ color: alpha('#f3efe7', 0.88), fontSize: '0.96rem' }} variant="body2">
              {character.name}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
