import { useEffect, useMemo, useState } from 'react';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type {
  BackgroundPromptSelection,
  BackgroundPromptWorkbenchData,
  BackgroundRoomProfile,
  BackgroundSceneEffectProfile,
  BackgroundScenePreset,
} from '@engine/types/backgroundAuthoring';
import {
  buildBackgroundPromptRecipe,
  resolveBackgroundPromptSelection,
} from '@engine/utils/buildBackgroundPromptRecipe';
import {
  getSuggestedContentImagePaths,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';
import {
  buildNarrativeBackdropBackground,
  renderNarrativeBackdropArchitectureLayer,
} from '@ui/components/narrative/narrativeBackdrop';
import {
  buildNarrativeBackdropStyleToken,
  renderNarrativeBackdropEffectLayers,
} from '@ui/components/narrative/narrativeBackdropEffects';

type CopyState = 'idle' | 'copied' | 'failed';

function selectDefaultPreset(data: BackgroundPromptWorkbenchData) {
  return data.scenePresets[0] ?? null;
}

function buildSelectionFromPreset(preset: BackgroundScenePreset): BackgroundPromptSelection {
  return {
    locationId: preset.locationId,
    roomId: preset.roomId,
    vibeId: preset.vibeId,
    situationId: preset.situationId,
    stylePackId: preset.stylePackId,
    variantId: preset.variantId,
    effectIds: [...preset.effectIds],
  };
}

function buildProfilesIndex<T extends { id: string }>(entries: readonly T[]) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry])) as Record<string, T>;
}

function matchesLocation(entry: { compatibleLocationIds?: readonly string[] }, locationId: string) {
  return !entry.compatibleLocationIds || entry.compatibleLocationIds.includes(locationId);
}

function matchesRoom(entry: { compatibleRoomIds?: readonly string[] }, roomId: string) {
  return !entry.compatibleRoomIds || entry.compatibleRoomIds.includes(roomId);
}

function sameStringArray(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function buildBackdropPreview(backgroundId: string | null, label: string) {
  const url = resolveContentImageUrl(backgroundId);

  return {
    type: 'asset' as const,
    assetId: backgroundId,
    kind: 'background' as const,
    label,
    url,
    isPlaceholder: !url,
  };
}

function getPreferredAssetPath(backgroundId: string | null) {
  const suggestedPaths = getSuggestedContentImagePaths(backgroundId);

  return suggestedPaths.find((path) => path.endsWith('.webp')) ?? suggestedPaths[0] ?? null;
}

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (copyState === 'idle') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle');
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <Stack alignItems="flex-start" spacing={0.5}>
      <Button
        onClick={() => {
          void handleCopy();
        }}
        size="small"
        startIcon={<ContentCopyRoundedIcon fontSize="small" />}
        variant="outlined"
      >
        {copyState === 'copied' ? 'Copied' : label}
      </Button>
      {copyState === 'failed' ? (
        <Typography color="error.main" variant="caption">
          Clipboard blocked. Copy manually from the block below.
        </Typography>
      ) : null}
    </Stack>
  );
}

function PromptBlock({
  title,
  text,
  copyLabel,
}: {
  title: string;
  text: string;
  copyLabel: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Stack spacing={1}>
        <Stack
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            {title}
          </Typography>
          <CopyButton label={copyLabel} text={text} />
        </Stack>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.25,
            maxHeight: 220,
            overflowX: 'auto',
            overflowY: 'auto',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(7, 10, 16, 0.42)',
            color: 'text.secondary',
            fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
            fontSize: 12,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </Box>
      </Stack>
    </Paper>
  );
}

function RuntimeReferenceList({
  room,
  preset,
}: {
  room: BackgroundRoomProfile;
  preset: BackgroundScenePreset | null;
}) {
  const activeReferences = preset
    ? room.runtimeReferences.filter((reference) => reference.backgroundId === preset.referenceBackgroundId)
    : room.runtimeReferences;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Stack spacing={1}>
        <Typography sx={{ fontWeight: 700 }} variant="body2">
          Runtime References
        </Typography>
        {activeReferences.map((reference) => (
          <Stack
            key={reference.id}
            spacing={0.35}
            sx={{
              p: 1,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography variant="body2">{reference.title}</Typography>
            <Typography color="text.secondary" variant="caption">
              scene: {reference.sceneId}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              background: {reference.backgroundId ?? 'none'}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              asset path: {getPreferredAssetPath(reference.backgroundId) ?? 'no conventional path'}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              file: {reference.contentFilePath}
            </Typography>
            {reference.note ? (
              <Typography color="text.secondary" variant="caption">
                {reference.note}
              </Typography>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function SceneEffectsComposer({
  activeSceneEffects,
  availableEffects,
  onToggle,
}: {
  activeSceneEffects: readonly BackgroundSceneEffectProfile[];
  availableEffects: readonly BackgroundSceneEffectProfile[];
  onToggle: (effectId: string) => void;
}) {
  if (availableEffects.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No canonical scene effects are mapped to this room yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {availableEffects.map((sceneEffect) => {
          const isSelected = activeSceneEffects.some((entry) => entry.id === sceneEffect.id);

          return (
            <Chip
              clickable
              color={isSelected ? 'primary' : 'default'}
              key={sceneEffect.id}
              label={sceneEffect.title}
              onClick={() => {
                onToggle(sceneEffect.id);
              }}
              variant={isSelected ? 'filled' : 'outlined'}
            />
          );
        })}
      </Stack>

      {activeSceneEffects.length > 0 ? (
        <Stack spacing={0.5}>
          {activeSceneEffects.map((sceneEffect) => (
            <Typography color="text.secondary" key={sceneEffect.id} variant="body2">
              {sceneEffect.title}: {sceneEffect.summary}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary" variant="body2">
          Leave effects empty if the background should stay clean and rely only on the painted asset.
        </Typography>
      )}
    </Stack>
  );
}

export function BackgroundPromptWorkbench({
  data,
}: {
  data: BackgroundPromptWorkbenchData;
}) {
  const initialPreset = selectDefaultPreset(data);
  const [activePresetId, setActivePresetId] = useState<string>(initialPreset?.id ?? 'custom');
  const [showAdvancedOverrides, setShowAdvancedOverrides] = useState(false);
  const [selection, setSelection] = useState<BackgroundPromptSelection>(
    initialPreset
      ? buildSelectionFromPreset(initialPreset)
      : {
          locationId: data.locations[0]?.id ?? '',
          roomId: data.rooms[0]?.id ?? '',
          vibeId: data.generalVibes[0]?.id ?? '',
          situationId: data.situations[0]?.id ?? '',
          stylePackId: data.stylePacks[0]?.id ?? '',
          variantId: data.variants[0]?.id ?? '',
          effectIds: [],
        },
  );

  const profiles = useMemo(
    () => ({
      locations: buildProfilesIndex(data.locations),
      rooms: buildProfilesIndex(data.rooms),
      generalVibes: buildProfilesIndex(data.generalVibes),
      sceneEffects: buildProfilesIndex(data.sceneEffects),
      situations: buildProfilesIndex(data.situations),
      stylePacks: buildProfilesIndex(data.stylePacks),
      variants: buildProfilesIndex(data.variants),
      presets: buildProfilesIndex(data.scenePresets),
    }),
    [data],
  );

  const availableRooms = data.rooms.filter((room) => room.locationId === selection.locationId);
  const effectiveRoomId =
    availableRooms.find((room) => room.id === selection.roomId)?.id ?? availableRooms[0]?.id ?? '';
  const availableVibes = data.generalVibes.filter((vibe) => matchesLocation(vibe, selection.locationId));
  const effectiveVibeId =
    availableVibes.find((vibe) => vibe.id === selection.vibeId)?.id ??
    availableVibes.find((vibe) => vibe.id === profiles.locations[selection.locationId]?.defaultVibeId)?.id ??
    availableVibes[0]?.id ??
    '';
  const availableSituations = data.situations.filter(
    (situation) =>
      matchesLocation(situation, selection.locationId) &&
      matchesRoom(situation, effectiveRoomId),
  );
  const effectiveSituationId =
    availableSituations.find((situation) => situation.id === selection.situationId)?.id ??
    availableSituations[0]?.id ??
    '';
  const availableVariants = data.variants.filter((variant) => matchesRoom(variant, effectiveRoomId));
  const effectiveVariantId =
    availableVariants.find((variant) => variant.id === selection.variantId)?.id ??
    availableVariants.find((variant) => variant.id === profiles.rooms[effectiveRoomId]?.defaultVariantId)?.id ??
    availableVariants[0]?.id ??
    '';
  const availableEffects = data.sceneEffects.filter(
    (sceneEffect) =>
      matchesLocation(sceneEffect, selection.locationId) &&
      matchesRoom(sceneEffect, effectiveRoomId),
  );
  const effectiveEffectIds = selection.effectIds.filter((effectId) =>
    availableEffects.some((sceneEffect) => sceneEffect.id === effectId),
  );
  const currentLocationPresets = data.scenePresets.filter((preset) => preset.locationId === selection.locationId);
  const roomFocusedPresets = currentLocationPresets.filter((preset) => preset.roomId === effectiveRoomId);
  const presetChips = roomFocusedPresets.length > 0 ? roomFocusedPresets : currentLocationPresets;
  const effectiveSelection: BackgroundPromptSelection = {
    ...selection,
    roomId: effectiveRoomId,
    vibeId: effectiveVibeId,
    situationId: effectiveSituationId,
    variantId: effectiveVariantId,
    effectIds: effectiveEffectIds,
  };

  useEffect(() => {
    if (!availableRooms.some((room) => room.id === selection.roomId)) {
      setSelection((current) => ({
        ...current,
        roomId: availableRooms[0]?.id ?? '',
      }));
    }
  }, [availableRooms, selection.roomId]);

  useEffect(() => {
    if (!availableVibes.some((vibe) => vibe.id === selection.vibeId)) {
      const location = profiles.locations[selection.locationId];
      setSelection((current) => ({
        ...current,
        vibeId: availableVibes.find((vibe) => vibe.id === location?.defaultVibeId)?.id ?? availableVibes[0]?.id ?? '',
      }));
    }
  }, [availableVibes, profiles.locations, selection.locationId, selection.vibeId]);

  useEffect(() => {
    if (!availableSituations.some((situation) => situation.id === selection.situationId)) {
      setSelection((current) => ({
        ...current,
        situationId: availableSituations[0]?.id ?? '',
      }));
    }
  }, [availableSituations, selection.situationId]);

  useEffect(() => {
    if (!availableVariants.some((variant) => variant.id === selection.variantId)) {
      const room = profiles.rooms[effectiveRoomId];
      setSelection((current) => ({
        ...current,
        variantId: availableVariants.find((variant) => variant.id === room?.defaultVariantId)?.id ?? availableVariants[0]?.id ?? '',
      }));
    }
  }, [availableVariants, effectiveRoomId, profiles.rooms, selection.variantId]);

  useEffect(() => {
    if (!sameStringArray(selection.effectIds, effectiveEffectIds)) {
      setSelection((current) => ({
        ...current,
        effectIds: effectiveEffectIds,
      }));
    }
  }, [effectiveEffectIds, selection.effectIds]);

  const resolvedSelection = resolveBackgroundPromptSelection(effectiveSelection, profiles);
  const activePreset =
    activePresetId !== 'custom' ? profiles.presets[activePresetId] ?? null : null;
  const {
    location,
    room,
    generalVibe,
    situation,
    stylePack,
    variant,
  } = resolvedSelection;
  const activeSceneEffects = effectiveEffectIds
    .map((effectId) => profiles.sceneEffects[effectId])
    .filter((sceneEffect): sceneEffect is BackgroundSceneEffectProfile => Boolean(sceneEffect));

  if (!location || !room || !generalVibe || !situation || !stylePack || !variant) {
    return null;
  }

  const recipe = buildBackgroundPromptRecipe({
    location,
    room,
    generalVibe,
    sceneEffects: activeSceneEffects,
    situation,
    stylePack,
    variant,
  });
  const previewBackgroundId =
    activePreset?.referenceBackgroundId ??
    room.referenceBackgroundId;
  const previewAssetPath = getPreferredAssetPath(previewBackgroundId);
  const preview = buildBackdropPreview(
    previewBackgroundId,
    `${location.title} · ${room.title}`,
  );
  const previewStyleToken = buildNarrativeBackdropStyleToken(
    activeSceneEffects.map((sceneEffect) => sceneEffect.styleToken),
  );
  const runtimeTargetReferences = activePreset
    ? room.runtimeReferences.filter((reference) => reference.backgroundId === activePreset.referenceBackgroundId)
    : room.runtimeReferences;

  const handleSelectionChange = <K extends keyof BackgroundPromptSelection>(
    key: K,
    value: BackgroundPromptSelection[K],
  ) => {
    setActivePresetId('custom');
    setSelection((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handlePresetChange = (presetId: string) => {
    if (presetId === 'custom') {
      setActivePresetId('custom');

      return;
    }

    const preset = profiles.presets[presetId];

    if (!preset) {
      return;
    }

    setActivePresetId(preset.id);
    setSelection(buildSelectionFromPreset(preset));
  };

  const handleEffectToggle = (effectId: string) => {
    setActivePresetId('custom');
    setSelection((current) => ({
      ...current,
      effectIds: current.effectIds.includes(effectId)
        ? current.effectIds.filter((entry) => entry !== effectId)
        : [...current.effectIds, effectId],
    }));
  };

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        }}
      >
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4">Location State Composer</Typography>
            <Typography color="text.secondary" variant="body2">
              Start from a room or a canonical scene beat, then layer actual scene effects on top of the same place
              instead of rebuilding the whole prompt from scratch every time.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.25,
            }}
          >
            <TextField
              fullWidth
              label="Master Location"
              onChange={(event) => {
                handleSelectionChange('locationId', event.target.value);
              }}
              select
              value={selection.locationId}
            >
              {data.locations.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Room / Zone"
              onChange={(event) => {
                handleSelectionChange('roomId', event.target.value);
              }}
              select
              value={effectiveRoomId}
            >
              {availableRooms.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.title}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Canonical Scene Anchors
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Pick a real chapter beat, then bend the same room into a new state instead of starting from zero.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip
                  clickable
                  color={activePresetId === 'custom' ? 'primary' : 'default'}
                  label="Custom state"
                  onClick={() => {
                    handlePresetChange('custom');
                  }}
                  variant={activePresetId === 'custom' ? 'filled' : 'outlined'}
                />
                {presetChips.map((preset) => (
                  <Chip
                    clickable
                    color={activePresetId === preset.id ? 'primary' : 'default'}
                    key={preset.id}
                    label={preset.title}
                    onClick={() => {
                      handlePresetChange(preset.id);
                    }}
                    variant={activePresetId === preset.id ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
              {activePreset ? (
                <Typography color="text.secondary" variant="body2">
                  {activePreset.summary}
                </Typography>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  Use custom state when the room is right but you need a new atmosphere or damage treatment.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Scene Effects
              </Typography>
              <Typography color="text.secondary" variant="body2">
                This is the fast authoring layer for states like `Thorn Estate / Dining Hall / blood border + shadow`.
              </Typography>
              <SceneEffectsComposer
                activeSceneEffects={activeSceneEffects}
                availableEffects={availableEffects}
                onToggle={handleEffectToggle}
              />
              <Divider flexItem />
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography color="text.secondary" variant="body2">
                  Runtime style token: {previewStyleToken ?? 'none'}
                </Typography>
                <Button
                  onClick={() => {
                    setShowAdvancedOverrides((current) => !current);
                  }}
                  size="small"
                  variant="outlined"
                >
                  {showAdvancedOverrides ? 'Hide advanced overrides' : 'Show advanced overrides'}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {showAdvancedOverrides ? (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <Stack spacing={1.25}>
                <Typography sx={{ fontWeight: 700 }} variant="body2">
                  Advanced Authoring Overrides
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  These are still useful, but they are secondary to room continuity and scene effects.
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.25,
                  }}
                >
                  <TextField
                    fullWidth
                    label="General Vibe"
                    onChange={(event) => {
                      handleSelectionChange('vibeId', event.target.value);
                    }}
                    select
                    value={effectiveVibeId}
                  >
                    {availableVibes.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Situation"
                    onChange={(event) => {
                      handleSelectionChange('situationId', event.target.value);
                    }}
                    select
                    value={effectiveSituationId}
                  >
                    {availableSituations.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Style Pack"
                    onChange={(event) => {
                      handleSelectionChange('stylePackId', event.target.value);
                    }}
                    select
                    value={selection.stylePackId}
                  >
                    {data.stylePacks.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Variant"
                    onChange={(event) => {
                      handleSelectionChange('variantId', event.target.value);
                    }}
                    select
                    value={effectiveVariantId}
                  >
                    {availableVariants.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                minHeight: 360,
                background: buildNarrativeBackdropBackground(preview),
              }}
            >
              {renderNarrativeBackdropArchitectureLayer(preview)}
              {renderNarrativeBackdropEffectLayers(previewStyleToken)}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(6, 8, 12, 0.08) 0%, rgba(6, 8, 12, 0.18) 28%, rgba(6, 8, 12, 0.62) 72%, rgba(6, 8, 12, 0.9) 100%)',
                }}
              />
              <Stack
                spacing={0.9}
                sx={{
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  bottom: 18,
                }}
              >
                <Typography variant="h4">{location.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {room.title}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  <Chip label={generalVibe.title} size="small" />
                  <Chip label={situation.title} size="small" />
                  <Chip label={stylePack.title} size="small" />
                  <Chip label={variant.title} size="small" />
                  {activeSceneEffects.map((sceneEffect) => (
                    <Chip key={sceneEffect.id} label={sceneEffect.title} size="small" />
                  ))}
                </Stack>
                {activePreset ? (
                  <Typography sx={{ maxWidth: 720 }} variant="body2">
                    Preset: {activePreset.title}. {activePreset.summary}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Continuity Notes
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {location.summary}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {room.summary}
              </Typography>
              <Divider flexItem />
              {location.continuityNotes.map((note) => (
                <Typography color="text.secondary" key={`${location.id}-${note}`} variant="body2">
                  {note}
                </Typography>
              ))}
              {room.continuityNotes.map((note) => (
                <Typography color="text.secondary" key={`${room.id}-${note}`} variant="body2">
                  {note}
                </Typography>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Runtime Target
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {activePreset
                  ? 'This preset is mapped to a real runtime scene. Use the target below if you are replacing the existing shot.'
                  : 'This is a custom variation on the selected room. Wire it by changing or adding the target background and, if needed, a background style token.'}
              </Typography>
              <Typography variant="body2">
                backgroundId: {previewBackgroundId ?? 'none'}
              </Typography>
              <Typography variant="body2">
                asset path: {previewAssetPath ?? 'no conventional path available'}
              </Typography>
              <Typography variant="body2">
                background style: {previewStyleToken ?? 'none'}
              </Typography>
              {activePreset ? (
                <>
                  <Typography variant="body2">
                    preset file: {activePreset.contentFilePath}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    scene preset: {activePreset.title}
                  </Typography>
                </>
              ) : null}
              {!activePreset && runtimeTargetReferences.length > 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Nearest canonical targets in this room: {runtimeTargetReferences.map((reference) => reference.title).join(', ')}
                </Typography>
              ) : null}
              <Divider flexItem />
              <Typography color="text.secondary" variant="body2">
                Initial scene state: use `scene.backgroundStyle` or `meta.defaultBackgroundStyle`.
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Beat-level swap: use `sceneChange.background.style`.
              </Typography>
            </Stack>
          </Paper>

          <RuntimeReferenceList preset={activePreset} room={room} />
        </Stack>

        <Stack spacing={2}>
          <PromptBlock copyLabel="Copy full prompt" text={recipe.fullPrompt} title="Full Prompt" />
          <PromptBlock copyLabel="Copy short prompt" text={recipe.shortPrompt} title="Short Prompt" />
          <PromptBlock copyLabel="Copy negative prompt" text={recipe.negativePrompt} title="Negative Prompt" />

          {previewStyleToken ? (
            <PromptBlock copyLabel="Copy runtime style token" text={previewStyleToken} title="Runtime Style Token" />
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <PromptBlock copyLabel="Copy vibe block" text={recipe.blocks.generalVibe} title="General Vibe" />
            <PromptBlock copyLabel="Copy location block" text={recipe.blocks.location} title="Location Block" />
            {recipe.blocks.sceneEffects ? (
              <PromptBlock copyLabel="Copy scene effects block" text={recipe.blocks.sceneEffects} title="Scene Effects" />
            ) : null}
            <PromptBlock copyLabel="Copy situation block" text={recipe.blocks.situation} title="Situation Block" />
            <PromptBlock copyLabel="Copy style block" text={recipe.blocks.style} title="Style Pack" />
            <PromptBlock copyLabel="Copy variant block" text={recipe.blocks.variant} title="Variant" />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
