import { observer } from 'mobx-react-lite';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { NodeInteraction } from '@engine/types/world';
import { SectionCard } from '@ui/components/SectionCard';

function normalize(value: number, min: number, max: number) {
  if (max === min) {
    return 50;
  }

  return 10 + ((value - min) / (max - min)) * 80;
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
      return 'No Interaction';
  }
}

function getInteractionOrNone(
  interaction: NodeInteraction | undefined,
) {
  return interaction ?? { type: 'none' as const };
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

  return (
    <Stack spacing={3}>
      <SectionCard
        eyebrow="World"
        subtitle={location.description ?? null}
        title={location.title}
      >
        <Box
          sx={{
            position: 'relative',
            height: { xs: 280, md: 340 },
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'radial-gradient(circle at 25% 25%, rgba(111, 179, 210, 0.18), transparent 28%), radial-gradient(circle at 75% 20%, rgba(201, 164, 92, 0.18), transparent 22%), linear-gradient(180deg, rgba(18, 29, 41, 0.96), rgba(12, 15, 22, 0.96))',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: '10% 12%',
              borderRadius: 3,
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          />
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
                  minWidth: 0,
                  width: 22,
                  height: 22,
                  p: 0,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: isCurrent
                    ? '3px solid rgba(201, 164, 92, 0.95)'
                    : '2px solid rgba(255,255,255,0.65)',
                  backgroundColor: isReachable || isCurrent ? 'rgba(111, 179, 210, 0.3)' : 'rgba(255,255,255,0.08)',
                  boxShadow: isCurrent ? '0 0 0 10px rgba(201, 164, 92, 0.12)' : 'none',
                }}
              />
            );
          })}
        </Box>
      </SectionCard>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <SectionCard
          action={<Chip icon={<PlaceOutlinedIcon />} label={currentNode.type} size="small" variant="outlined" />}
          eyebrow="Current Node"
          subtitle={currentNode.description ?? null}
          title={currentNode.label}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
        </SectionCard>

        <SectionCard eyebrow="Routes" title="Available Paths">
          <Stack spacing={1.25}>
            {rootStore.worldController.getAvailableConnectedNodes().map((node) => (
              <Button
                key={node.id}
                fullWidth
                onClick={() => rootStore.worldController.moveToNode(node.id)}
                sx={{ justifyContent: 'space-between', px: 2, py: 1.25 }}
                variant="outlined"
              >
                <span>{node.label}</span>
                <Typography color="text.secondary" variant="caption">
                  {node.type}
                </Typography>
              </Button>
            ))}
          </Stack>
        </SectionCard>
      </Stack>
    </Stack>
  );
});
