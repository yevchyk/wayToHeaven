import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { BattleNodeInteraction, DialogueNodeInteraction, LocationNode } from '@engine/types/world';

export class WorldController {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  loadLocation(locationId: string, startNodeId?: string) {
    const location = this.requireLocation(locationId);

    this.rootStore.locationGraphValidator.assertValid(location);

    const targetNodeId = startNodeId ?? location.startNodeId;
    const targetNode = location.nodes[targetNodeId];

    if (!targetNode) {
      throw new Error(`Location "${locationId}" does not contain node "${targetNodeId}".`);
    }

    this.rootStore.world.loadLocation(locationId, targetNodeId, targetNode.connectedNodeIds);
    this.rootStore.ui.setScreen('world');

    if (location.onEnterEffects && location.onEnterEffects.length > 0) {
      this.rootStore.executeEffects(location.onEnterEffects);
    }

    this.applyOnEnterEffects(targetNodeId);
  }

  setCurrentNode(nodeId: string) {
    const node = this.getNode(nodeId);

    this.rootStore.world.setCurrentNode(nodeId, node.connectedNodeIds);
    this.applyOnEnterEffects(nodeId);
  }

  moveToNode(nodeId: string) {
    const currentNode = this.requireCurrentNode();

    if (!currentNode.connectedNodeIds.includes(nodeId)) {
      return false;
    }

    const targetNode = this.getNode(nodeId);
    const moved = this.rootStore.world.moveToNode(nodeId, targetNode.connectedNodeIds);

    if (!moved) {
      return false;
    }

    this.applyOnEnterEffects(nodeId);

    return true;
  }

  getAvailableConnectedNodes() {
    const currentNode = this.requireCurrentNode();
    const location = this.requireCurrentLocation();

    return currentNode.connectedNodeIds
      .map((nodeId) => location.nodes[nodeId])
      .filter((node): node is LocationNode => node !== undefined);
  }

  triggerNodeInteraction(nodeId?: string) {
    const node = nodeId ? this.getNode(nodeId) : this.requireCurrentNode();
    const interaction = node.interaction ?? { type: 'none' as const };

    if (interaction.type === 'none') {
      return false;
    }

    if (interaction.once && this.rootStore.world.hasTriggeredInteraction(node.id)) {
      return false;
    }

    if (interaction.type === 'dialogue') {
      this.triggerDialogueInteraction(interaction);
    } else {
      this.triggerBattleInteraction(interaction);
    }

    if (interaction.once) {
      this.rootStore.world.markInteractionTriggered(node.id);
    }

    return true;
  }

  applyOnEnterEffects(nodeId?: string) {
    const node = nodeId ? this.getNode(nodeId) : this.requireCurrentNode();

    if (!node.onEnterEffects || node.onEnterEffects.length === 0) {
      return null;
    }

    return this.rootStore.executeEffects(node.onEnterEffects);
  }

  private triggerDialogueInteraction(interaction: DialogueNodeInteraction) {
    this.rootStore.dialogue.startDialogue(interaction.dialogueId);
  }

  private triggerBattleInteraction(interaction: BattleNodeInteraction) {
    this.rootStore.executeEffect({
      type: 'startBattle',
      battleTemplateId: interaction.battleTemplateId,
    });
  }

  private requireLocation(locationId: string) {
    const location = this.rootStore.getLocationById(locationId);

    if (!location) {
      throw new Error(`Location "${locationId}" was not found.`);
    }

    return location;
  }

  private requireCurrentLocation() {
    if (!this.rootStore.world.currentLocationId) {
      throw new Error('No location is currently loaded.');
    }

    return this.requireLocation(this.rootStore.world.currentLocationId);
  }

  private requireCurrentNode() {
    if (!this.rootStore.world.currentNodeId) {
      throw new Error('No current node is selected.');
    }

    return this.getNode(this.rootStore.world.currentNodeId);
  }

  private getNode(nodeId: string) {
    const location = this.requireCurrentLocation();
    const node = location.nodes[nodeId];

    if (!node) {
      throw new Error(`Node "${nodeId}" does not exist in location "${location.id}".`);
    }

    return node;
  }
}
