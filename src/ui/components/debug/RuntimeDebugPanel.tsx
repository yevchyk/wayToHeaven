import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { alpha } from '@mui/material/styles';
import { Box, Button, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';

function formatJsonLine(label: string, value: unknown) {
  return `${label}: ${JSON.stringify(value)}`;
}

export const RuntimeDebugPanel = observer(function RuntimeDebugPanel() {
  const rootStore = useGameRootStore();
  const { debug, sceneFlow, battle, ui } = rootStore;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== '`') {
        return;
      }

      event.preventDefault();
      debug.toggleEnabled();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debug]);

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1500,
        width: debug.enabled ? 'min(440px, calc(100vw - 32px))' : 'auto',
      }}
    >
      {!debug.enabled ? (
        <Button
          onClick={() => debug.toggleEnabled()}
          size="small"
          sx={{
            borderRadius: '999px',
            backdropFilter: 'blur(10px)',
          }}
          variant="contained"
        >
          Debug
        </Button>
      ) : (
        <Stack
          spacing={1.25}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha('#8fb3ff', 0.35)}`,
            backgroundColor: alpha('#050812', 0.9),
            color: '#edf4ff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.42)',
          }}
        >
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '0.92rem', fontWeight: 700 }}>Runtime Debug</Typography>
            <Stack direction="row" gap={1}>
              <Button color="inherit" onClick={() => debug.runValidation()} size="small" variant="outlined">
                Validate
              </Button>
              <Button color="inherit" onClick={() => debug.toggleEnabled()} size="small" variant="text">
                Close
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={0.35}>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('screen', ui.activeScreen)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('layer', rootStore.activeRuntimeLayer)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('sceneId', sceneFlow.activeSceneId)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('flowId', sceneFlow.activeFlowId)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('nodeId', sceneFlow.currentNodeId)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('transitions', sceneFlow.visibleTransitionIds)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('pendingJump', sceneFlow.pendingJumpNodeId)}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('presentation', {
                backgroundId: sceneFlow.currentBackgroundId,
                musicId: sceneFlow.currentMusicId,
                cgId: sceneFlow.currentCgId,
                overlayId: sceneFlow.currentOverlayId,
                stageFocus: sceneFlow.currentStage?.focusCharacterId ?? null,
                transition: sceneFlow.activeSession?.presentation.activeTransition?.type ?? null,
              })}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
              {formatJsonLine('battle', {
                activeBattleId: battle.activeBattleId,
                phase: battle.phase,
                currentUnitId: battle.currentUnit?.unitId ?? null,
              })}
            </Typography>
          </Stack>

          <Stack spacing={0.45}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Validation Issues: {debug.validationIssues.length}
            </Typography>
            {debug.validationIssues.slice(0, 6).map((issue) => (
              <Typography key={`${issue.sourceType}:${issue.sourceId}:${issue.code}:${issue.path ?? ''}`} sx={{ fontSize: '0.76rem' }}>
                {issue.sourceType}:{issue.sourceId} [{issue.code}] {issue.path ?? issue.message}
              </Typography>
            ))}
          </Stack>

          <Stack spacing={0.45}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>Effect Log</Typography>
            {debug.effectLog.slice(0, 6).map((entry) => (
              <Typography key={entry.id} sx={{ fontSize: '0.76rem', fontFamily: 'monospace' }}>
                {entry.type} • {entry.status}
                {entry.details ? ` • ${entry.details}` : ''}
              </Typography>
            ))}
          </Stack>

          <Stack spacing={0.45}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>Presentation Log</Typography>
            {debug.presentationLog.slice(0, 6).map((entry) => (
              <Typography key={entry.id} sx={{ fontSize: '0.76rem', fontFamily: 'monospace' }}>
                {entry.source} • {entry.flowId ?? 'ambient'} • {entry.nodeId ?? 'n/a'}
              </Typography>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
});
