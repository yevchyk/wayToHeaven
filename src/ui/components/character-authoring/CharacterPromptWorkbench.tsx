import { useEffect, useMemo, useState } from 'react';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type {
  CharacterPromptSelection,
  CharacterPromptTargetReference,
  CharacterPromptWorkbenchData,
} from '@engine/types/characterAuthoring';
import {
  buildCharacterPromptRecipe,
  matchesRenderMode,
  resolveCharacterPromptSelection,
} from '@engine/utils/buildCharacterPromptRecipe';
import {
  getSuggestedContentImagePaths,
  resolveContentImageUrl,
} from '@ui/components/character-composite/characterCompositeAssetResolver';

type CopyState = 'idle' | 'copied' | 'failed';

function buildProfilesIndex<T extends { id: string }>(entries: readonly T[]) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry])) as Record<string, T>;
}

function getPreferredTarget(subjectId: string, data: CharacterPromptWorkbenchData) {
  const subject = data.subjects.find((entry) => entry.id === subjectId);
  const targets = data.targetReferences.filter((entry) => entry.subjectId === subjectId);

  return (
    targets.find((entry) => entry.renderMode === subject?.primaryRenderMode) ??
    targets[0] ??
    null
  );
}

function getPreferredTargetPath(targetReference: CharacterPromptTargetReference) {
  const paths = getSuggestedContentImagePaths(targetReference.assetId, targetReference.sourcePath);

  return paths.find((path) => path.endsWith('.webp')) ?? paths[0] ?? targetReference.assetId ?? 'missing-asset-id';
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

function SubjectPolicyCard({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <Stack
      spacing={0.75}
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}
    >
      <Typography sx={{ fontWeight: 700 }} variant="body2">
        {label}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
    </Stack>
  );
}

export function CharacterPromptWorkbench({
  data,
}: {
  data: CharacterPromptWorkbenchData;
}) {
  const initialSubjectId = data.subjects[0]?.id ?? '';
  const initialTarget = getPreferredTarget(initialSubjectId, data);
  const [selection, setSelection] = useState<CharacterPromptSelection>({
    subjectId: initialSubjectId,
    targetReferenceId: initialTarget?.id ?? '',
    stylePackId: data.subjects[0]?.defaultStylePackId ?? data.stylePacks[0]?.id ?? '',
    shotId: data.shotProfiles[0]?.id ?? '',
  });

  const profiles = useMemo(
    () => ({
      subjects: buildProfilesIndex(data.subjects),
      targets: buildProfilesIndex(data.targetReferences),
      stylePacks: buildProfilesIndex(data.stylePacks),
      shotProfiles: buildProfilesIndex(data.shotProfiles),
      emotionNotes: buildProfilesIndex(data.emotionNotes),
    }),
    [data],
  );

  const subject = profiles.subjects[selection.subjectId];
  const subjectTargets = data.targetReferences.filter((entry) => entry.subjectId === selection.subjectId);
  const resolvedTarget =
    profiles.targets[selection.targetReferenceId] ??
    getPreferredTarget(selection.subjectId, data);
  const renderMode = resolvedTarget?.renderMode ?? subject?.primaryRenderMode ?? 'flat-portrait';
  const availableStylePacks = data.stylePacks.filter((entry) => matchesRenderMode(entry, renderMode));
  const availableShotProfiles = data.shotProfiles.filter((entry) => matchesRenderMode(entry, renderMode));

  useEffect(() => {
    const currentTargetIsValid = subjectTargets.some((entry) => entry.id === selection.targetReferenceId);

    if (!currentTargetIsValid) {
      const preferredTarget = getPreferredTarget(selection.subjectId, data);

      setSelection((current) => ({
        ...current,
        targetReferenceId: preferredTarget?.id ?? '',
      }));
    }
  }, [data, selection.subjectId, selection.targetReferenceId, subjectTargets]);

  useEffect(() => {
    if (!availableStylePacks.some((entry) => entry.id === selection.stylePackId)) {
      setSelection((current) => ({
        ...current,
        stylePackId: subject?.defaultStylePackId ?? availableStylePacks[0]?.id ?? '',
      }));
    }
  }, [availableStylePacks, selection.stylePackId, subject?.defaultStylePackId]);

  useEffect(() => {
    if (!availableShotProfiles.some((entry) => entry.id === selection.shotId)) {
      setSelection((current) => ({
        ...current,
        shotId: availableShotProfiles[0]?.id ?? '',
      }));
    }
  }, [availableShotProfiles, selection.shotId]);

  const resolvedSelection = resolveCharacterPromptSelection(selection, profiles);
  const {
    subject: activeSubject,
    targetReference,
    stylePack,
    shotProfile,
    emotionNote,
  } = resolvedSelection;

  if (!activeSubject || !targetReference || !stylePack || !shotProfile) {
    return null;
  }

  const recipe = buildCharacterPromptRecipe({
    subject: activeSubject,
    targetReference,
    stylePack,
    shotProfile,
    emotionNote,
  });
  const imageUrl = resolveContentImageUrl(targetReference.assetId, targetReference.sourcePath);
  const targetPath = getPreferredTargetPath(targetReference);

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
            <Typography variant="h4">Character Prompt Composer</Typography>
            <Typography color="text.secondary" variant="body2">
              NPCs stay on full flat emotion portraits. Mirella is the only approved composite subject, so her
              primary prompt workflow targets head overlays and isolated rig layers instead of repainting the whole
              body for every state.
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
              label="Character"
              onChange={(event) => {
                const nextSubjectId = event.target.value;
                const nextSubject = profiles.subjects[nextSubjectId];
                const nextTarget = getPreferredTarget(nextSubjectId, data);

                setSelection((current) => ({
                  ...current,
                  subjectId: nextSubjectId,
                  targetReferenceId: nextTarget?.id ?? '',
                  stylePackId: nextSubject?.defaultStylePackId ?? current.stylePackId,
                }));
              }}
              select
              value={selection.subjectId}
            >
              {data.subjects.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.displayName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Runtime Target"
              onChange={(event) => {
                setSelection((current) => ({
                  ...current,
                  targetReferenceId: event.target.value,
                }));
              }}
              select
              value={targetReference.id}
            >
              {subjectTargets.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Style Pack"
              onChange={(event) => {
                setSelection((current) => ({
                  ...current,
                  stylePackId: event.target.value,
                }));
              }}
              select
              value={stylePack.id}
            >
              {availableStylePacks.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Framing"
              onChange={(event) => {
                setSelection((current) => ({
                  ...current,
                  shotId: event.target.value,
                }));
              }}
              select
              value={shotProfile.id}
            >
              {availableShotProfiles.map((entry) => (
                <MenuItem key={entry.id} value={entry.id}>
                  {entry.title}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 1.25,
            }}
          >
            <SubjectPolicyCard
              description={activeSubject.summary}
              label={
                activeSubject.primaryRenderMode === 'flat-portrait'
                  ? 'Primary mode: flat portrait'
                  : 'Primary mode: composite heroine'
              }
            />
            <SubjectPolicyCard
              description={targetReference.summary}
              label={`Target mode: ${targetReference.renderMode}`}
            />
            <SubjectPolicyCard
              description={stylePack.summary}
              label={`Style pack: ${stylePack.title}`}
            />
            <SubjectPolicyCard
              description={shotProfile.summary}
              label={`Framing: ${shotProfile.title}`}
            />
          </Box>
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
                minHeight: 420,
                background:
                  'radial-gradient(circle at 18% 16%, rgba(198, 161, 92, 0.18) 0%, transparent 28%), linear-gradient(180deg, rgba(15, 13, 18, 0.96), rgba(9, 9, 12, 0.98))',
              }}
            >
              {imageUrl ? (
                <Box
                  alt={targetReference.title}
                  component="img"
                  src={imageUrl}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: targetReference.renderMode === 'flat-portrait' ? 'contain' : 'scale-down',
                    objectPosition: 'center bottom',
                    userSelect: 'none',
                  }}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, px: 2 }}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
                    No image is wired to this target yet. The prompt below is meant to create or replace the first
                    runtime asset.
                  </Typography>
                </Stack>
              )}

              <Box
                sx={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  p: 2,
                  background: 'linear-gradient(180deg, rgba(8,10,14,0) 0%, rgba(8,10,14,0.86) 100%)',
                }}
              >
                <Stack spacing={0.9}>
                  <Typography variant="h4">{activeSubject.displayName}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {targetReference.title}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    <Chip label={targetReference.renderMode} size="small" />
                    <Chip label={stylePack.title} size="small" />
                    <Chip label={shotProfile.title} size="small" />
                    {targetReference.emotionId ? <Chip label={targetReference.emotionId} size="small" /> : null}
                    {targetReference.layerId ? <Chip label={targetReference.layerId} size="small" /> : null}
                  </Stack>
                </Stack>
              </Box>
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
                Runtime Target
              </Typography>
              <Typography variant="body2">
                asset id: {targetReference.assetId ?? 'not assigned yet'}
              </Typography>
              <Typography variant="body2">
                image file: {targetPath}
              </Typography>
              <Typography variant="body2">
                content file: {targetReference.contentFilePath}
              </Typography>
              <Typography variant="body2">
                asset field: {targetReference.assetFieldPath}
              </Typography>
              {targetReference.note ? (
                <Typography color="text.secondary" variant="body2">
                  {targetReference.note}
                </Typography>
              ) : null}
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
                Continuity Notes
              </Typography>
              {activeSubject.continuityNotes.map((note) => (
                <Typography color="text.secondary" key={`${activeSubject.id}-${note}`} variant="body2">
                  {note}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Stack>

        <Stack spacing={2}>
          <PromptBlock copyLabel="Copy full prompt" text={recipe.fullPrompt} title="Full Prompt" />
          <PromptBlock copyLabel="Copy short prompt" text={recipe.shortPrompt} title="Short Prompt" />
          <PromptBlock copyLabel="Copy negative prompt" text={recipe.negativePrompt} title="Negative Prompt" />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <PromptBlock copyLabel="Copy identity block" text={recipe.blocks.identity} title="Identity Block" />
            <PromptBlock copyLabel="Copy render target block" text={recipe.blocks.renderTarget} title="Render Target" />
            <PromptBlock copyLabel="Copy emotion block" text={recipe.blocks.emotion} title="Emotion / Layer Goal" />
            <PromptBlock copyLabel="Copy style block" text={recipe.blocks.style} title="Style Pack" />
            <PromptBlock copyLabel="Copy framing block" text={recipe.blocks.shot} title="Framing" />
            <PromptBlock copyLabel="Copy continuity block" text={recipe.blocks.continuity} title="Continuity" />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
