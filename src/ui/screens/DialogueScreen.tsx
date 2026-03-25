import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import {
  formatSpeakerLabel,
  resolveDialogueBackdrop,
  resolveDialoguePortraitSlots,
  type DialoguePortraitSlot,
} from '@ui/components/dialogue/dialoguePresentation';
import {
  buildNarrativeBackdropBackground,
  renderNarrativeBackdropArchitectureLayer,
} from '@ui/components/narrative/narrativeBackdrop';
import { SectionCard } from '@ui/components/SectionCard';

const ACTIVE_ACCENT = '#f0cc8b';

function DialoguePortraitPlaceholder({ slot }: { slot: DialoguePortraitSlot }) {
  const accentColor = slot.isActive ? alpha(ACTIVE_ACCENT, 0.68) : alpha('#d4dde9', 0.18);
  const shoulderOffset = slot.side === 'left' ? { right: '8%' } : { left: '8%' };

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
          inset: '18% 12% 0',
          clipPath: 'polygon(50% 0, 68% 7%, 81% 17%, 90% 33%, 96% 61%, 100% 100%, 0 100%, 4% 61%, 10% 33%, 19% 17%, 32% 7%)',
          background:
            'linear-gradient(180deg, rgba(255, 230, 183, 0.14) 0%, rgba(94, 105, 125, 0.32) 8%, rgba(33, 39, 48, 0.98) 42%, rgba(8, 10, 14, 1) 100%)',
          border: `1px solid ${accentColor}`,
          boxShadow: slot.isActive
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
      <Box
        sx={{
          position: 'absolute',
          inset: '38% 34% 30%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, rgba(245, 220, 164, 0.44) 0%, rgba(245, 220, 164, 0.02) 100%)',
          filter: 'blur(12px)',
          opacity: slot.isActive ? 0.3 : 0.16,
        }}
      />
    </Box>
  );
}

function DialoguePortrait({ slot }: { slot: DialoguePortraitSlot }) {
  const hasPortraitSubject = Boolean(slot.displayName || slot.portrait.url);

  if (!hasPortraitSubject) {
    return null;
  }

  return (
    <Box
      aria-label={`${slot.side} portrait`}
      sx={{
        position: 'relative',
        width: { xs: 'min(42vw, 220px)', sm: 260, md: 320, xl: 360 },
        height: { xs: '37svh', sm: '46svh', md: '68svh' },
        maxHeight: 760,
        justifySelf: slot.side === 'left' ? 'start' : 'end',
        alignSelf: 'end',
        pointerEvents: 'none',
        opacity: slot.isActive ? 1 : 0.62,
        transform: slot.isActive ? 'translateY(-10px) scale(1.015)' : 'translateY(18px) scale(0.985)',
        transition: 'opacity 180ms ease, transform 180ms ease, filter 180ms ease',
        filter: slot.isActive
          ? 'drop-shadow(0 30px 40px rgba(0, 0, 0, 0.46)) drop-shadow(0 0 20px rgba(240, 204, 139, 0.14))'
          : 'drop-shadow(0 18px 28px rgba(0, 0, 0, 0.34))',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 78%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, black 0%, black 78%, transparent 100%)',
        }}
      >
        {slot.portrait.url ? (
          <Box
            alt=""
            component="img"
            src={slot.portrait.url}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: slot.side === 'left' ? 'left bottom' : 'right bottom',
              userSelect: 'none',
            }}
          />
        ) : (
          <DialoguePortraitPlaceholder slot={slot} />
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 16 },
          [slot.side === 'left' ? 'left' : 'right']: { xs: 4, md: 10 },
          width: '72%',
          height: 20,
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0) 72%)',
          filter: 'blur(10px)',
        }}
      />

      <Stack
        alignItems={slot.side === 'left' ? 'flex-start' : 'flex-end'}
        spacing={1}
        sx={{
          position: 'absolute',
          inset: 0,
          px: { xs: 0.5, md: 0.75 },
          py: { xs: 1, md: 1.5 },
        }}
      >
        {slot.portrait.isPlaceholder && slot.displayName ? (
          <Box
            sx={{
              mt: 'auto',
              px: 1.15,
              py: 0.75,
              borderRadius: '12px',
              backgroundColor: alpha('#090b10', 0.48),
              border: `1px solid ${alpha('#e5c78d', 0.14)}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Typography sx={{ color: '#f7f1e5', fontFamily: '"Spectral", Georgia, serif', fontSize: '1rem' }}>
              {slot.displayName}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

export const DialogueScreen = observer(function DialogueScreen() {
  const rootStore = useGameRootStore();
  const { dialogue } = rootStore;
  const currentNode = dialogue.currentNode;
  const visibleChoices = dialogue.getVisibleChoices();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      dialogue.endDialogue();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogue]);

  if (!currentNode) {
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
  const backdrop = resolveDialogueBackdrop(rootStore, dialogue);
  const portraits = resolveDialoguePortraitSlots(rootStore, dialogue);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: buildNarrativeBackdropBackground(backdrop),
      }}
    >
      {renderNarrativeBackdropArchitectureLayer(backdrop)}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 7, 12, 0.04) 0%, rgba(5, 7, 12, 0.08) 26%, rgba(5, 7, 12, 0.48) 68%, rgba(5, 7, 12, 0.88) 100%)',
        }}
      />

      <Stack
        spacing={0.55}
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 28 },
          left: { xs: 20, md: 30 },
          zIndex: 2,
          maxWidth: { xs: 'calc(100% - 40px)', md: 560 },
        }}
      >
        {sceneTitle ? (
          <Typography
            component="h1"
            sx={{
              color: '#fbf6ea',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: '1.5rem', md: '2.15rem' },
              lineHeight: 1.1,
              textShadow: '0 10px 28px rgba(0, 0, 0, 0.48)',
            }}
            variant="h4"
          >
            {sceneTitle}
          </Typography>
        ) : null}
      </Stack>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          px: { xs: '0.75rem', sm: '1.5rem', md: '2.5rem', xl: '4rem' },
          pb: { xs: '2.5rem', md: '3.75rem' },
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <DialoguePortrait slot={portraits.left} />
        <DialoguePortrait slot={portraits.right} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          insetInline: 0,
          bottom: { xs: 16, md: 24 },
          zIndex: 3,
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
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
              'linear-gradient(180deg, rgba(10, 13, 18, 0.64) 0%, rgba(8, 10, 14, 0.84) 30%, rgba(5, 7, 10, 0.94) 100%)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 26px 70px rgba(0, 0, 0, 0.42)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 1,
              background: 'linear-gradient(90deg, rgba(240, 204, 139, 0) 0%, rgba(240, 204, 139, 0.52) 50%, rgba(240, 204, 139, 0) 100%)',
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
              rowGap: { xs: 1.6, md: 2 },
            }}
          >
            <Stack
              alignItems={{ xs: 'flex-start', md: 'center' }}
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={1.2}
            >
              <Stack spacing={0.35}>
                <Typography
                  component="h2"
                  sx={{
                    color: '#fbf6ea',
                    fontFamily: '"Spectral", Georgia, serif',
                    fontSize: { xs: '1.45rem', md: '1.9rem' },
                    lineHeight: 1.05,
                  }}
                  variant="h4"
                >
                  {speakerName}
                </Typography>
              </Stack>

              <Button
                onClick={() => dialogue.endDialogue()}
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  px: 2.2,
                  py: 1.05,
                  borderRadius: '12px',
                  color: '#d7dceb',
                  borderColor: alpha('#d7dceb', 0.18),
                  alignSelf: { xs: 'stretch', md: 'center' },
                }}
                variant="outlined"
              >
                Покинути діалог
              </Button>
            </Stack>

            <Stack
              spacing={1.3}
              sx={{
                minHeight: 0,
                overflowY: 'auto',
                pr: { xs: 0.25, sm: 0.75 },
                mr: { xs: -0.25, sm: -0.5 },
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
                  fontSize: { xs: '1.02rem', md: '1.18rem' },
                  lineHeight: { xs: 1.72, md: 1.82 },
                  textWrap: 'pretty',
                }}
                variant="body1"
              >
                {dialogue.currentText}
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
                      <Typography component="span" sx={{ color: 'inherit', fontSize: { xs: '0.98rem', md: '1.08rem' } }}>
                        {choice.text}
                      </Typography>
                    </Stack>
                  </Button>
                ))
                : null}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1}>
              {!visibleChoices.length ? (
                <Button
                  onClick={() => dialogue.next()}
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
                  {currentNode.nextNodeId ? 'Далі' : 'Закрити діалог'}
                </Button>
              ) : (
                <Typography
                  sx={{
                    color: alpha('#d7dceb', 0.7),
                    fontSize: '0.88rem',
                    alignSelf: 'center',
                  }}
                >
                  Натисни `Esc`, якщо хочеш вийти без вибору відповіді.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
