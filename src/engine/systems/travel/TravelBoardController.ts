import type { GameRootStore } from '@engine/stores/GameRootStore';

type RandomSource = () => number;

export class TravelBoardController {
  readonly rootStore: GameRootStore;

  private readonly random: RandomSource;

  constructor(rootStore: GameRootStore, random: RandomSource = Math.random) {
    this.rootStore = rootStore;
    this.random = random;
  }

  startBoard(boardId: string, startNodeId?: string) {
    return this.rootStore.sceneFlowController.startTravelBoard(boardId, startNodeId);
  }

  rollDice() {
    return this.rootStore.sceneFlowController.rollDice();
  }

  chooseDirection(nodeId: string) {
    return this.rootStore.sceneFlowController.chooseDirection(nodeId);
  }

  useScout(depth = this.rootStore.travelBoard.scoutDepth) {
    return this.rootStore.sceneFlowController.useScout(depth);
  }

  getAvailableDirections() {
    return this.rootStore.sceneFlowController.getAvailableRouteNodes().flatMap((node) => {
      const currentBoard = this.rootStore.travelBoard.currentBoard;

      if (!currentBoard) {
        return [];
      }

      const travelNode = currentBoard.nodes[node.id];

      return travelNode ? [travelNode] : [];
    });
  }
}
