import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { formatSpeakerLabel } from '@ui/components/dialogue/dialoguePresentation';
import { SectionCard } from '@ui/components/SectionCard';
import { SceneFlowPresentationShell } from '@ui/components/scene-flow/SceneFlowPresentationShell';

export const DialogueScreen = observer(function DialogueScreen() {
  const rootStore = useGameRootStore();
  const { dialogue } = rootStore;
  const visibleChoices = dialogue.getVisibleChoices();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !dialogue.isActive) {
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        dialogue.advanceOrReveal();

        return;
      }

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        dialogue.toggleAutoMode();

        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        dialogue.toggleSkipMode();

        return;
      }

      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        rootStore.preferences.setHideUi(!dialogue.isUiHidden);

        return;
      }

      if (event.key.toLowerCase() === 'b') {
        event.preventDefault();
        rootStore.ui.openModal('backlog');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogue, rootStore.preferences, rootStore.ui]);

  if (!dialogue.currentNodeId) {
    return (
      <SectionCard title="Немає активного діалогу">
        <Typography color="text.secondary" variant="body2">
          Діалоговий runtime зараз неактивний.
        </Typography>
      </SectionCard>
    );
  }

  const sceneTitle = dialogue.currentSceneTitle ?? dialogue.activeDialogue?.title ?? null;
  const speakerName =
    dialogue.currentSpeakerName ??
    formatSpeakerLabel(dialogue.currentSpeakerId) ??
    'Оповідь';
  const fontScale = dialogue.currentFontScale;

  return (
    <SceneFlowPresentationShell
      header={
        sceneTitle ? (
          <Typography
            component="h1"
            sx={{
              color: '#fbf6ea',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: `${1.5 * fontScale}rem`, md: `${2.15 * fontScale}rem` },
              lineHeight: 1.1,
              textShadow: '0 10px 28px rgba(0, 0, 0, 0.48)',
            }}
            variant="h4"
          >
            {sceneTitle}
          </Typography>
        ) : null
      }
    >
      {dialogue.isUiHidden ? (
        <Box
          onClick={() => dialogue.advanceOrReveal()}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: { xs: 16, md: 24 },
              bottom: { xs: 16, md: 24 },
              px: 1.3,
              py: 0.7,
              borderRadius: '999px',
              border: `1px solid ${alpha('#f0cc8b', 0.18)}`,
              backgroundColor: alpha('#080a10', 0.48),
              color: alpha('#f7f1e5', 0.82),
              backdropFilter: 'blur(12px)',
            }}
          >
            <Typography sx={{ fontSize: '0.86rem' }}>
              Натисни, щоб повернути UI
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Box
        sx={{
          position: 'absolute',
          insetInline: 0,
          bottom: { xs: 16, md: 24 },
          zIndex: 4,
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          opacity: dialogue.isUiHidden ? 0 : 1,
          transition: 'opacity 180ms ease',
          pointerEvents: dialogue.isUiHidden ? 'none' : 'auto',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 1260,
            mx: 'auto',
            p: { xs: '1rem', sm: '1.35rem', md: '1.6rem' },
            height: { xs: 'clamp(320px, 56svh, 520px)', md: 'clamp(360px, 44svh, 500px)' },
            border: `1px solid ${alpha('#f0cc8b', 0.18)}`,
            borderRadius: '18px',
            background:
              'linear-gradient(180deg, rgba(10, 13, 18, 0.46) 0%, rgba(8, 10, 14, 0.68) 30%, rgba(5, 7, 10, 0.82) 100%)',
            backdropFilter: 'blur(22px)',
            boxShadow: '0 26px 70px rgba(0, 0, 0, 0.42)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 1,
              background:
                'linear-gradient(90deg, rgba(240, 204, 139, 0) 0%, rgba(240, 204, 139, 0.52) 50%, rgba(240, 204, 139, 0) 100%)',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateRows: 'auto minmax(0, 1fr) auto',
              height: '100%',
              rowGap: { xs: 1.2, md: 1.6 },
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
              <Stack spacing={0.35}>
                <Typography
                  component="h2"
                  sx={{
                    color: '#fbf6ea',
                    fontFamily: '"Spectral", Georgia, serif',
                    fontSize: { xs: `${1.45 * fontScale}rem`, md: `${1.9 * fontScale}rem` },
                    lineHeight: 1.05,
                  }}
                  variant="h4"
                >
                  {speakerName}
                </Typography>
                <Typography
                  sx={{
                    color: alpha('#f4ddb0', 0.84),
                    fontSize: '0.78rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {dialogue.isCurrentNodeSeen ? 'Seen' : 'Unread'}
                </Typography>
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={0.8} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button
                  onClick={() => dialogue.toggleAutoMode()}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                  variant={dialogue.autoModeEnabled ? 'contained' : 'outlined'}
                >
                  Auto
                </Button>
                <Button
                  onClick={() => dialogue.toggleSkipMode()}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                  variant={dialogue.skipMode !== 'off' ? 'contained' : 'outlined'}
                >
                  {rootStore.preferences.skipUnread ? 'Skip All' : 'Skip Seen'}
                </Button>
                <Button
                  onClick={() => rootStore.ui.openModal('backlog')}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                  variant="outlined"
                >
                  Backlog
                </Button>
                <Button
                  onClick={() => rootStore.ui.openModal('preferences')}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                  variant="outlined"
                >
                  Shell
                </Button>
                <Button
                  onClick={() => rootStore.preferences.setHideUi(true)}
                  size="small"
                  sx={{ borderRadius: '999px' }}
                  variant="outlined"
                >
                  Hide UI
                </Button>
              </Stack>
            </Stack>

            <Stack
              onClick={!visibleChoices.length ? () => dialogue.advanceOrReveal() : undefined}
              spacing={1.3}
              sx={{
                minHeight: 0,
                overflowY: 'auto',
                pr: { xs: 0.25, sm: 0.75 },
                mr: { xs: -0.25, sm: -0.5 },
                cursor: !visibleChoices.length ? 'pointer' : 'default',
                '&::-webkit-scrollbar': {
                  width: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 999,
                  backgroundColor: alpha('#f0cc8b', 0.22),
                },
              }}
            >
              <Typography
                sx={{
                  color: '#f3efe7',
                  fontSize: { xs: `${1.02 * fontScale}rem`, md: `${1.18 * fontScale}rem` },
                  lineHeight: { xs: 1.72, md: 1.82 },
                  textWrap: 'pretty',
                  minHeight: '4lh',
                }}
                variant="body1"
              >
                {dialogue.displayedText}
              </Typography>

              {visibleChoices.length > 0
                ? visibleChoices.map((choice) => (
                  <Button
                    key={choice.id}
                    fullWidth
                    onClick={() => dialogue.chooseChoice(choice.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      alignItems: 'stretch',
                      px: { xs: 1.4, sm: 1.8 },
                      py: { xs: 1.2, sm: 1.35 },
                      borderRadius: '14px',
                      border: `1px solid ${alpha('#f0cc8b', 0.34)}`,
                      backgroundColor: alpha('#9a6a2b', 0.16),
                      color: '#fff2d8',
                      textAlign: 'left',
                      '&:hover': {
                        borderColor: alpha('#f0cc8b', 0.56),
                        backgroundColor: alpha('#9a6a2b', 0.24),
                      },
                    }}
                    variant="outlined"
                  >
                    <Stack alignItems="flex-start" spacing={0.45} sx={{ width: '100%' }}>
                      <Typography component="span" sx={{ color: 'inherit', fontSize: { xs: `${0.98 * fontScale}rem`, md: `${1.08 * fontScale}rem` } }}>
                        {choice.text}
                      </Typography>
                    </Stack>
                  </Button>
                ))
                : null}
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.1}>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Typography sx={{ color: alpha('#d7dceb', 0.72), fontSize: '0.84rem' }}>
                  Text {rootStore.preferences.textSpeed}
                </Typography>
                <Typography sx={{ color: alpha('#d7dceb', 0.72), fontSize: '0.84rem' }}>
                  Auto {rootStore.preferences.autoDelayMs}ms
                </Typography>
              </Stack>

              {!visibleChoices.length ? (
                <Button
                  onClick={() => dialogue.advanceOrReveal()}
                  sx={{
                    minWidth: 164,
                    px: 2.8,
                    py: 1.25,
                    borderRadius: '12px',
                    backgroundColor: alpha('#7db0db', 0.18),
                    border: `1px solid ${alpha('#7db0db', 0.32)}`,
                    color: '#e9f4ff',
                    '&:hover': {
                      backgroundColor: alpha('#7db0db', 0.26),
                    },
                  }}
                  variant="contained"
                >
                  {dialogue.isTextFullyRevealed ? 'Далі' : 'Показати все'}
                </Button>
              ) : (
                <Typography sx={{ color: alpha('#d7dceb', 0.7), fontSize: '0.88rem', alignSelf: 'center' }}>
                  Auto і skip зупиняються на виборах.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </SceneFlowPresentationShell>
  );
});
