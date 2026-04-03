import { observer } from 'mobx-react-lite';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { NodeInteraction } from '@engine/types/world';
import { SectionCard } from '@ui/components/SectionCard';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';

function normalize(value: number, min: number, max: number) {
  if (max === min) {
    return 50;
  }

  return 10 + ((value - min) / (max - min)) * 80;
}

function getInteractionOrNone(interaction: NodeInteraction | undefined) {
  return interaction ?? { type: 'none' as const };
}

function getInteractionLabel(
  interaction: NonNullable<ReturnType<typeof getInteractionOrNone>>,
  getSceneFlowMode: (sceneFlowId: string) => string | null,
) {
  switch (interaction.type) {
    case 'battle':
      return 'Trigger battle';
    case 'dialogue':
      return 'Trigger dialogue';
    case 'sceneFlow': {
      const mode = getSceneFlowMode(interaction.sceneFlowId);

      if (mode === 'sequence') {
        return 'Trigger dialogue';
      }

      if (mode === 'hub') {
        return 'Open hub';
      }

      if (mode === 'route') {
        return 'Open route';
      }

      return 'Open scene';
    }
    case 'none':
    default:
      return 'No interaction';
  }
}

function getInteractionTone(interaction: ReturnType<typeof getInteractionOrNone>) {
  switch (interaction.type) {
    case 'battle':
      return alpha('#d9c5a1', 0.22);
    case 'dialogue':
      return alpha('#aac6d8', 0.22);
    case 'sceneFlow':
      return alpha('#eef5fb', 0.16);
    case 'none':
    default:
      return alpha('#eef5fb', 0.08);
  }
}

export const WorldScreen = observer(function WorldScreen() {
  const rootStore = useGameRootStore();
  const location = rootStore.world.currentLocationId
    ? rootStore.getLocationById(rootStore.world.currentLocationId)
    : null;

  if (!location || !rootStore.world.currentNodeId) {
    return (
      <SectionCard eyebrow="World" title="No Location Loaded">
        <Button onClick={() => rootStore.startNewGame()} variant="contained">
          Start Vertical Slice
        </Button>
      </SectionCard>
    );
  }

  const nodes = Object.values(location.nodes);
  const currentNode = location.nodes[rootStore.world.currentNodeId];

  if (!currentNode) {
    return null;
  }

  const minX = Math.min(...nodes.map((node) => node.x));
  const maxX = Math.max(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxY = Math.max(...nodes.map((node) => node.y));
  const currentInteraction = getInteractionOrNone(currentNode.interaction);
  const interactionLabel = getInteractionLabel(
    currentInteraction,
    (sceneFlowId) => rootStore.getSceneFlowById(sceneFlowId)?.mode ?? null,
  );
  const availableNodes = rootStore.worldController.getAvailableConnectedNodes();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top, rgba(242, 247, 252, 0.08) 0%, rgba(242, 247, 252, 0) 18%), linear-gradient(180deg, rgba(10, 14, 20, 0.08) 0%, rgba(10, 14, 20, 0.12) 36%, rgba(10, 14, 20, 0.34) 100%)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        spacing={1.2}
        sx={{
          position: 'relative',
          px: { xs: 1, md: 1.4 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        <SectionCard
          action={
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              <Chip label={`${nodes.length} nodes`} size="small" variant="outlined" />
              <Chip label={`${availableNodes.length} open paths`} size="small" variant="outlined" />
            </Stack>
          }
          eyebrow="World"
          subtitle={location.description ?? null}
          title={location.title}
        >
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 360, lg: 430 },
              overflow: 'hidden',
              borderRadius: shellTokens.radius.md,
              border: `1px solid ${shellTokens.border.subtle}`,
              background:
                'radial-gradient(circle at 18% 24%, rgba(153, 188, 210, 0.18) 0%, rgba(153, 188, 210, 0) 28%), radial-gradient(circle at 80% 18%, rgba(236, 242, 248, 0.18) 0%, rgba(236, 242, 248, 0) 22%), linear-gradient(180deg, rgba(21, 29, 38, 0.88) 0%, rgba(13, 18, 25, 0.92) 46%, rgba(9, 13, 19, 0.98) 100%)',
              boxShadow: shellTokens.shadow.inset,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(5, 8, 12, 0.46) 0%, rgba(5, 8, 12, 0.18) 22%, rgba(5, 8, 12, 0.12) 50%, rgba(5, 8, 12, 0.18) 78%, rgba(5, 8, 12, 0.46) 100%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: '8% 10%',
                borderRadius: shellTokens.radius.md,
                border: `1px dashed ${alpha('#eef5fb', 0.08)}`,
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
              }}
            />

            <Box
              component="svg"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox="0 0 100 100"
            >
              {nodes.flatMap((node) =>
                node.connectedNodeIds.map((connectedNodeId) => {
                  const connectedNode = location.nodes[connectedNodeId];

                  if (!connectedNode || connectedNode.id < node.id) {
                    return null;
                  }

                  const isActiveRoute =
                    rootStore.world.availableTransitionNodeIds.includes(connectedNode.id) ||
                    rootStore.world.availableTransitionNodeIds.includes(node.id);

                  return (
                    <line
                      key={`${node.id}-${connectedNode.id}`}
                      stroke={isActiveRoute ? 'rgba(230, 239, 247, 0.34)' : 'rgba(230, 239, 247, 0.12)'}
                      strokeWidth={isActiveRoute ? 0.8 : 0.45}
                      x1={normalize(node.x, minX, maxX)}
                      x2={normalize(connectedNode.x, minX, maxX)}
                      y1={normalize(node.y, minY, maxY)}
                      y2={normalize(connectedNode.y, minY, maxY)}
                    />
                  );
                }),
              )}
            </Box>

            <Stack
              spacing={0.4}
              sx={{
                position: 'absolute',
                top: { xs: 12, md: 14 },
                left: { xs: 12, md: 14 },
                zIndex: 2,
              }}
            >
              <Typography
                sx={{
                  color: alpha('#eef5fb', 0.6),
                  fontSize: '0.68rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Traverse Layer
              </Typography>
              <Typography
                sx={{
                  color: shellTokens.text.primary,
                  fontFamily: '"Spectral", Georgia, serif',
                  fontSize: { xs: '1.02rem', md: '1.14rem' },
                }}
              >
                Route topology and scene entry points
              </Typography>
            </Stack>

            {nodes.map((node) => {
              const isCurrent = node.id === currentNode.id;
              const isReachable = rootStore.world.availableTransitionNodeIds.includes(node.id);
              const canMove = isReachable && !isCurrent;

              return (
                <Button
                  key={node.id}
                  aria-label={`Move to ${node.label}`}
                  data-testid={`world-node-${node.id}`}
                  disabled={!canMove}
                  onClick={() => rootStore.worldController.moveToNode(node.id)}
                  sx={{
                    position: 'absolute',
                    left: `${normalize(node.x, minX, maxX)}%`,
                    top: `${normalize(node.y, minY, maxY)}%`,
                    transform: 'translate(-50%, -50%)',
                    minWidth: 0,
                    width: { xs: 104, md: 116 },
                    minHeight: { xs: 54, md: 60 },
                    px: 1,
                    py: 0.75,
                    borderRadius: shellTokens.radius.sm,
                    border: isCurrent
                      ? `1px solid ${alpha('#eef5fb', 0.34)}`
                      : isReachable
                        ? `1px solid ${alpha('#eef5fb', 0.24)}`
                        : `1px solid ${alpha('#eef5fb', 0.08)}`,
                    background: isCurrent
                      ? 'linear-gradient(180deg, rgba(234, 241, 248, 0.16) 0%, rgba(94, 129, 152, 0.18) 100%)'
                      : isReachable
                        ? 'linear-gradient(180deg, rgba(18, 25, 34, 0.82) 0%, rgba(11, 16, 23, 0.88) 100%)'
                        : 'linear-gradient(180deg, rgba(10, 14, 20, 0.42) 0%, rgba(10, 14, 20, 0.58) 100%)',
                    color: shellTokens.text.primary,
                    textAlign: 'left',
                    alignItems: 'stretch',
                    boxShadow: isCurrent ? '0 0 0 8px rgba(238, 245, 251, 0.06)' : 'none',
                  }}
                  variant="outlined"
                >
                  <Stack spacing={0.2} sx={{ width: '100%' }}>
                    <Typography sx={{ fontSize: '0.76rem', lineHeight: 1.1 }}>
                      {node.label}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: '0.64rem', lineHeight: 1.1 }}>
                      {node.type}
                    </Typography>
                  </Stack>
                </Button>
              );
            })}

            <Box
              sx={{
                position: 'absolute',
                right: { xs: 12, md: 16 },
                bottom: { xs: 12, md: 16 },
                width: { xs: 'calc(100% - 24px)', sm: 290 },
              }}
            >
              <PanelSection
                action={<Chip label={interactionLabel} size="small" variant="outlined" />}
                description={currentNode.description ?? 'This node is ready to continue the route.'}
                eyebrow="Current Focus"
                title={currentNode.label}
                tone="overlay"
              >
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  <Chip icon={<PlaceOutlinedIcon />} label={currentNode.type} size="small" variant="outlined" />
                  <Chip label={currentNode.id} size="small" variant="outlined" />
                </Stack>
              </PanelSection>
            </Box>
          </Box>
        </SectionCard>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.2}>
          <SectionCard
            action={<Chip icon={<PlaceOutlinedIcon />} label={currentNode.type} size="small" variant="outlined" />}
            eyebrow="Current Node"
            subtitle={currentNode.description ?? null}
            title={currentNode.label}
          >
            <Stack spacing={1.1}>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                <Chip label={interactionLabel} size="small" variant="outlined" />
                <Chip label={`Links ${currentNode.connectedNodeIds.length}`} size="small" variant="outlined" />
                <Chip
                  label={rootStore.world.availableTransitionNodeIds.includes(currentNode.id) ? 'On route' : 'Locked'}
                  size="small"
                  sx={{ backgroundColor: getInteractionTone(currentInteraction) }}
                  variant="outlined"
                />
              </Stack>

              <Typography color="text.secondary" variant="body2">
                Use this node as the current scene anchor. Movement remains constrained by the authored graph, and interaction flow stays separate from travel itself.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  disabled={currentInteraction.type === 'none'}
                  onClick={() => rootStore.worldController.triggerNodeInteraction()}
                  startIcon={<TravelExploreRoundedIcon />}
                  variant="contained"
                >
                  {interactionLabel}
                </Button>
                <Button onClick={() => rootStore.openCharacterMenu()} variant="outlined">
                  Open Character Menu
                </Button>
              </Stack>
            </Stack>
          </SectionCard>

          <SectionCard eyebrow="Routes" title="Available Paths">
            <Stack spacing={0.9}>
              {availableNodes.length > 0 ? (
                availableNodes.map((node) => (
                  <Button
                    key={node.id}
                    fullWidth
                    onClick={() => rootStore.worldController.moveToNode(node.id)}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'stretch',
                      px: 1.1,
                      py: 0.95,
                      borderRadius: shellTokens.radius.sm,
                      border: `1px solid ${alpha('#eef5fb', 0.12)}`,
                      backgroundColor: alpha('#0d131a', 0.24),
                    }}
                    variant="outlined"
                  >
                    <Stack alignItems="flex-start" spacing={0.15}>
                      <Typography sx={{ color: shellTokens.text.primary, fontSize: '0.84rem' }}>
                        {node.label}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      >
                        {node.type}
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.25}>
                      <EastRoundedIcon sx={{ color: alpha('#eef5fb', 0.62), fontSize: 18 }} />
                      <Typography color="text.secondary" sx={{ fontSize: '0.66rem' }}>
                        Move
                      </Typography>
                    </Stack>
                  </Button>
                ))
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No connected nodes are currently reachable from this position.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Stack>
      </Stack>
    </Box>
  );
});
