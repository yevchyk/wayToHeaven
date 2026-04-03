import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import ArrowCircleDownRoundedIcon from '@mui/icons-material/ArrowCircleDownRounded';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { getDanceHitWindowMs, getFishingZoneWidth } from '@engine/formulas/minigame';
import type { DanceArrowDirection } from '@engine/types/minigame';
import { SectionCard } from '@ui/components/SectionCard';

const arrowIcons: Record<DanceArrowDirection, typeof ArrowCircleUpRoundedIcon> = {
  up: ArrowCircleUpRoundedIcon,
  right: ArrowCircleRightRoundedIcon,
  down: ArrowCircleDownRoundedIcon,
  left: ArrowCircleLeftRoundedIcon,
};

const arrowKeyMap: Record<string, DanceArrowDirection> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  w: 'up',
  d: 'right',
  s: 'down',
  a: 'left',
};

function formatSeconds(ms: number) {
  return (ms / 1000).toFixed(1);
}

export const MiniGameScreen = observer(function MiniGameScreen() {
  const rootStore = useGameRootStore();
  const { miniGame, miniGameController } = rootStore;
  const session = miniGame.activeSession;

  useEffect(() => {
    if (!session || session.result) {
      return;
    }

    let animationFrameId = 0;
    let previousTime = performance.now();

    const step = (currentTime: number) => {
      const deltaMs = currentTime - previousTime;

      previousTime = currentTime;
      miniGameController.tick(deltaMs);
      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [miniGameController, session?.minigameId, session?.result]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (session.kind === 'fishing' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        miniGameController.setFishingHolding(true);

        return;
      }

      if (session.kind === 'dance') {
        const direction = arrowKeyMap[event.key] ?? arrowKeyMap[event.key.toLowerCase()];

        if (direction) {
          event.preventDefault();
          miniGameController.pressDanceDirection(direction);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (session.kind === 'fishing' && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        miniGameController.setFishingHolding(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [miniGameController, session]);

  if (!session) {
    return (
      <SectionCard eyebrow="Mini-game" title="Немає активної мініігри">
        <Typography color="text.secondary" variant="body2">
          Runtime мініігор зараз неактивний.
        </Typography>
      </SectionCard>
    );
  }

  const skillLevel = miniGame.getSkillLevel(session.skillId);
  const resultTone =
    session.result?.outcome === 'success'
      ? 'rgba(124, 196, 132, 0.18)'
      : 'rgba(220, 106, 92, 0.16)';

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 4 },
        background:
          'radial-gradient(circle at 18% 18%, rgba(33, 101, 112, 0.26), transparent 28%), radial-gradient(circle at 82% 18%, rgba(208, 176, 109, 0.24), transparent 24%), linear-gradient(180deg, #061016 0%, #09141c 36%, #070b10 100%)',
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 1180, mx: 'auto' }}>
        <SectionCard
          eyebrow="Mini-game"
          subtitle={session.description}
          title={session.title}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1}>
            <Chip label={`Skill ${session.skillId}: ${skillLevel}`} variant="outlined" />
            <Chip label={`Layer ${rootStore.activeRuntimeLayer}`} variant="outlined" />
            {session.result ? <Chip label={session.result.outcome} color="primary" variant="outlined" /> : null}
          </Stack>
        </SectionCard>

        {session.kind === 'fishing' ? (
          <FishingPanel />
        ) : (
          <DancePanel />
        )}

        {session.result ? (
          <SectionCard eyebrow="Result" title={session.result.outcome === 'success' ? 'Успіх' : 'Промах'}>
            <Stack
              spacing={2}
              sx={{
                p: 2.4,
                borderRadius: 3,
                border: `1px solid ${alpha('#f3efe7', 0.12)}`,
                backgroundColor: resultTone,
              }}
            >
              <Typography variant="body1">{session.result.summary}</Typography>
              <Typography color="text.secondary" variant="body2">
                Score: {session.result.score}
              </Typography>
              <Button onClick={() => miniGameController.finishSession()} variant="contained">
                Повернутись у гру
              </Button>
            </Stack>
          </SectionCard>
        ) : null}
      </Stack>
    </Box>
  );
});

const FishingPanel = observer(function FishingPanel() {
  const rootStore = useGameRootStore();
  const session = rootStore.miniGame.fishingSession;

  if (!session) {
    return null;
  }

  const definition = rootStore.getMinigameById(session.minigameId);

  if (!definition || definition.kind !== 'fishing') {
    return null;
  }

  const skillLevel = rootStore.miniGame.getSkillLevel(definition.skillId);
  const zoneWidth = getFishingZoneWidth(definition, skillLevel);

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
      <SectionCard eyebrow="Fishing" title="Натяг волосіні">
        <Stack spacing={2.5}>
          <Box
            sx={{
              position: 'relative',
              height: 240,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              background:
                'linear-gradient(180deg, rgba(9, 28, 35, 0.95), rgba(8, 17, 23, 0.98))',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 12,
                borderRadius: 2.5,
                background:
                  'linear-gradient(180deg, rgba(84, 145, 162, 0.16), rgba(39, 76, 88, 0.28))',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: `${(1 - (session.zoneCenter + zoneWidth / 2)) * 100}%`,
                left: '20%',
                width: '60%',
                height: `${zoneWidth * 100}%`,
                borderRadius: 999,
                border: '1px solid rgba(123, 225, 160, 0.38)',
                backgroundColor: 'rgba(67, 176, 107, 0.2)',
                boxShadow: '0 0 22px rgba(67, 176, 107, 0.18)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: `${(1 - session.tension) * 100}%`,
                transform: 'translate(-50%, -50%)',
                color: '#f4d18a',
                filter: 'drop-shadow(0 0 16px rgba(244, 209, 138, 0.35))',
              }}
            >
              <RadioButtonCheckedRoundedIcon sx={{ fontSize: 34 }} />
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1}>
            <Chip label={`Catch ${Math.round(session.catchProgress)} / ${definition.goal}`} variant="outlined" />
            <Chip label={`Time ${formatSeconds(session.remainingMs)}s`} variant="outlined" />
            <Chip label={session.isHolding ? 'Тягнеш' : 'Відпускаєш'} color="primary" variant="outlined" />
          </Stack>

          <Typography color="text.secondary" variant="body2">
            Тримай `Space` або кнопку нижче, щоб піднімати натяг. Відпусти, коли маркер виходить із зеленої зони.
          </Typography>

          <Button
            onMouseDown={() => rootStore.miniGameController.setFishingHolding(true)}
            onMouseLeave={() => rootStore.miniGameController.setFishingHolding(false)}
            onMouseUp={() => rootStore.miniGameController.setFishingHolding(false)}
            onTouchEnd={() => rootStore.miniGameController.setFishingHolding(false)}
            onTouchStart={() => rootStore.miniGameController.setFishingHolding(true)}
            size="large"
            variant="contained"
          >
            Тримати натяг
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard eyebrow="Progression" title="Навик рибалки">
        <Stack spacing={1.4}>
          <Typography variant="body1">
            Поточний рівень: {rootStore.miniGame.getSkillLevel('fishing')}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Кожен успіх піднімає навик рибалки на 1. Навик розширює зелену зону й трохи зменшує втрату прогресу поза нею.
          </Typography>
          <Button
            onClick={() => rootStore.miniGameController.finishSession()}
            sx={{ alignSelf: 'flex-start' }}
            variant="outlined"
          >
            Вийти з мініігри
          </Button>
        </Stack>
      </SectionCard>
    </Stack>
  );
});

const DancePanel = observer(function DancePanel() {
  const rootStore = useGameRootStore();
  const session = rootStore.miniGame.activeSession;

  if (!session || session.kind !== 'dance') {
    return null;
  }

  const definition = rootStore.getMinigameById(session.minigameId);

  if (!definition || definition.kind !== 'dance') {
    return null;
  }

  const skillLevel = rootStore.miniGame.getSkillLevel(definition.skillId);
  const windowMs = getDanceHitWindowMs(definition, skillLevel);
  const activePrompt = session.prompts.find((prompt) => prompt.status === 'pending') ?? null;
  const resolvedHits = session.prompts.filter((prompt) => prompt.status === 'hit').length;

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
      <SectionCard eyebrow="Dance" title="Стрілки ритму">
        <Stack spacing={2.5}>
          <Stack direction="row" flexWrap="wrap" gap={1.1}>
            {session.prompts.map((prompt) => {
              const Icon = arrowIcons[prompt.direction];
              const isActive =
                activePrompt?.id === prompt.id &&
                Math.abs(prompt.scheduledTimeMs - session.elapsedMs) <= definition.previewWindowMs;
              const opacity = isActive ? 0.55 + ((Math.sin(session.elapsedMs / 110) + 1) / 2) * 0.45 : 1;
              const borderColor =
                prompt.status === 'hit'
                  ? 'rgba(121, 208, 141, 0.8)'
                  : prompt.status === 'miss'
                    ? 'rgba(222, 102, 86, 0.74)'
                    : isActive
                      ? 'rgba(244, 209, 138, 0.9)'
                      : 'rgba(255,255,255,0.12)';
              const backgroundColor =
                prompt.status === 'hit'
                  ? 'rgba(121, 208, 141, 0.14)'
                  : prompt.status === 'miss'
                    ? 'rgba(222, 102, 86, 0.12)'
                    : isActive
                      ? 'rgba(244, 209, 138, 0.14)'
                      : 'rgba(255,255,255,0.04)';

              return (
                <Box
                  key={prompt.id}
                  sx={{
                    width: 88,
                    height: 88,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    backgroundColor,
                    opacity,
                    transition: 'opacity 80ms linear, transform 80ms linear',
                    transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                >
                  <Icon sx={{ fontSize: 42 }} />
                </Box>
              );
            })}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1}>
            <Chip label={`Hits ${resolvedHits} / ${definition.requiredHits}`} variant="outlined" />
            <Chip label={`Window ${windowMs}ms`} variant="outlined" />
            <Chip label={`Streak ${session.streak}`} variant="outlined" />
            <Chip label={`Best ${session.bestStreak}`} variant="outlined" />
          </Stack>

          <Typography color="text.secondary" variant="body2">
            Тисни `Arrow Keys` або `WASD`, коли активна стрілка блимає перед ударом.
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {(['left', 'up', 'down', 'right'] as const).map((direction) => {
              const Icon = arrowIcons[direction];
              const isFlash = session.flashDirection === direction && session.flashRemainingMs > 0;

              return (
                <Button
                  key={direction}
                  onClick={() => rootStore.miniGameController.pressDanceDirection(direction)}
                  startIcon={<Icon />}
                  sx={{
                    minWidth: 120,
                    boxShadow: isFlash ? '0 0 0 6px rgba(244, 209, 138, 0.16)' : 'none',
                  }}
                  variant={isFlash ? 'contained' : 'outlined'}
                >
                  {direction}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard eyebrow="Progression" title="Навик танцю">
        <Stack spacing={1.4}>
          <Typography variant="body1">
            Поточний рівень: {rootStore.miniGame.getSkillLevel('dance')}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Вдалі проходження розширюють вікно попадання. Базова механіка вже готова під фестивалі, ритуальні танці й соціальні сцени.
          </Typography>
          <Button
            onClick={() => rootStore.miniGameController.finishSession()}
            sx={{ alignSelf: 'flex-start' }}
            variant="outlined"
          >
            Вийти з мініігри
          </Button>
        </Stack>
      </SectionCard>
    </Stack>
  );
});
