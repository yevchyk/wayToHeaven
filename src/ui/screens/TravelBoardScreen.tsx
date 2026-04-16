import { observer } from 'mobx-react-lite';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Box, Button, Chip, List, ListItem, Stack, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { TravelNode } from '@engine/types/travel';
import { formatTimeCost } from '@engine/types/time';
import { SceneFlowPresentationShell } from '@ui/components/scene-flow/SceneFlowPresentationShell';
import { SectionCard } from '@ui/components/SectionCard';

function getNodeLabel(node: TravelNode, isRevealed: boolean) {
  if (!isRevealed && node.hidden) {
    return 'Unknown';
  }

  return node.title ?? node.id;
}

function getNodeSubtitle(node: TravelNode, isRevealed: boolean) {
  if (!isRevealed && node.hidden) {
    return 'Unrevealed';
  }

  return node.type;
}

export const TravelBoardScreen = observer(function TravelBoardScreen() {
  const rootStore = useGameRootStore();
  const { travelBoard } = rootStore;
  const board = travelBoard.currentBoard;
  const currentNode = travelBoard.currentNode;
  const availableDirections = rootStore.travelBoardController.getAvailableDirections();

  if (!board || !currentNode) {
    return (
      <SectionCard eyebrow="Travel Board" title="No Active Route">
        <Button onClick={() => rootStore.startTravelBoardDemo()} variant="contained">
          Start Travel Board Demo
        </Button>
      </SectionCard>
    );
  }

  const nodes = Object.values(board.nodes);
  const stepTimeCostLabel = formatTimeCost(board.stepTimeCost);
  const mapAssetId =
    board.backgroundId && rootStore.getNarrativeAssetById(board.backgroundId)?.kind === 'map'
      ? board.backgroundId
      : null;

  return (
    <SceneFlowPresentationShell mapAssetId={mapAssetId}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5, 8, 12, 0.16) 0%, rgba(5, 8, 12, 0.34) 32%, rgba(5, 8, 12, 0.82) 100%)',
        }}
      />

      <Stack
        spacing={3}
        sx={{
          position: 'relative',
          minHeight: '100%',
          px: { xs: 2, sm: 3, md: 4, xl: 6 },
          py: { xs: 3, md: 4 },
        }}
      >
        <SectionCard
          eyebrow="Travel Board"
          subtitle={board.description ?? null}
          title={board.title}
        >
          <Box
            sx={{
              position: 'relative',
              height: { xs: 340, lg: 420 },
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              background:
                'radial-gradient(circle at 18% 22%, rgba(52, 108, 120, 0.28), transparent 26%), radial-gradient(circle at 82% 76%, rgba(201, 164, 92, 0.18), transparent 24%), linear-gradient(180deg, rgba(10, 15, 26, 0.96), rgba(13, 10, 18, 0.98))',
            }}
          >
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
                node.nextNodeIds.map((nextNodeId) => {
                  const nextNode = board.nodes[nextNodeId];

                  if (!nextNode) {
                    return null;
                  }

                  const isVisitedPath =
                    travelBoard.visitedNodeIds.includes(node.id) &&
                    travelBoard.visitedNodeIds.includes(nextNodeId);

                  return (
                    <line
                      key={`${node.id}-${nextNodeId}`}
                      stroke={isVisitedPath ? 'rgba(201, 164, 92, 0.9)' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isVisitedPath ? 1.4 : 0.8}
                      x1={node.x}
                      x2={nextNode.x}
                      y1={node.y}
                      y2={nextNode.y}
                    />
                  );
                }),
              )}
            </Box>

            {nodes.map((node) => {
              const isCurrent = node.id === currentNode.id;
              const isVisited = travelBoard.visitedNodeIds.includes(node.id);
              const isRevealed = travelBoard.revealedNodeIds.includes(node.id) || !node.hidden;
              const isSelectable = travelBoard.isAwaitingDirection && availableDirections.some((entry) => entry.id === node.id);

              return (
                <Button
                  key={node.id}
                  aria-label={`Travel node ${getNodeLabel(node, isRevealed)}`}
                  data-testid={`travel-node-${node.id}`}
                  disabled={!isSelectable}
                  onClick={() => rootStore.travelBoardController.chooseDirection(node.id)}
                  sx={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                    minWidth: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'text.primary',
                    border: isCurrent
                      ? '2px solid rgba(201, 164, 92, 0.95)'
                      : isSelectable
                        ? '1px solid rgba(111, 179, 210, 0.8)'
                        : '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: isCurrent
                      ? 'rgba(201, 164, 92, 0.12)'
                      : isVisited
                        ? 'rgba(111, 179, 210, 0.16)'
                        : isRevealed
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(255,255,255,0.025)',
                    boxShadow: isCurrent ? '0 0 0 10px rgba(201, 164, 92, 0.12)' : 'none',
                  }}
                  variant="outlined"
                >
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.05 }} variant="caption">
                    {getNodeLabel(node, isRevealed)}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.62rem', lineHeight: 1 }} variant="caption">
                    {getNodeSubtitle(node, isRevealed)}
                  </Typography>
                </Button>
              );
            })}
          </Box>
        </SectionCard>

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3}>
        <SectionCard
          eyebrow="State"
          subtitle={currentNode.description ?? null}
          title={currentNode.title ?? currentNode.id}
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip label={`Day ${rootStore.time.day}`} variant="outlined" />
            <Chip label={rootStore.time.segmentLabel} variant="outlined" />
            <Chip label={`Phase ${travelBoard.phase}`} variant="outlined" />
            <Chip label={`Roll ${travelBoard.lastRoll ?? '-'}`} variant="outlined" />
            <Chip label={`Steps ${travelBoard.remainingSteps}`} variant="outlined" />
            <Chip label={`Scout ${travelBoard.scoutCharges}`} variant="outlined" />
            {stepTimeCostLabel ? <Chip label={`Step ${stepTimeCostLabel}`} variant="outlined" /> : null}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
            <Button
              disabled={!travelBoard.isAwaitingRoll}
              onClick={() => rootStore.travelBoardController.rollDice()}
              startIcon={<ExploreRoundedIcon />}
              variant="contained"
            >
              Roll
            </Button>
            <Button
              disabled={!travelBoard.hasActiveBoard || travelBoard.scoutCharges <= 0}
              onClick={() => rootStore.travelBoardController.useScout()}
              startIcon={<VisibilityRoundedIcon />}
              variant="outlined"
            >
              Scout
            </Button>
          </Stack>

          {travelBoard.isAwaitingDirection ? (
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2">Choose a direction</Typography>
              {availableDirections.map((node) => {
                const isRevealed = travelBoard.revealedNodeIds.includes(node.id) || !node.hidden;

                return (
                  <Button
                    key={node.id}
                    fullWidth
                    onClick={() => rootStore.travelBoardController.chooseDirection(node.id)}
                    sx={{ justifyContent: 'space-between' }}
                    variant="outlined"
                  >
                    <span>{getNodeLabel(node, isRevealed)}</span>
                    <Typography color="text.secondary" variant="caption">
                      {getNodeSubtitle(node, isRevealed)}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>
          ) : null}
        </SectionCard>

        <SectionCard eyebrow="Route Log" title="Recent Events">
          <List dense disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {travelBoard.eventLog.slice(-10).map((entry) => (
              <ListItem key={entry.id} disableGutters sx={{ py: 0.75 }}>
                <Stack spacing={0.25}>
                  <Typography variant="body2">{entry.message}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    {entry.type}
                  </Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </SectionCard>
        </Stack>
      </Stack>
    </SceneFlowPresentationShell>
  );
});
