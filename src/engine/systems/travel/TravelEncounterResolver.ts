import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { TravelEncounterResolution, TravelNode } from '@engine/types/travel';

export class TravelEncounterResolver {
  readonly rootStore: GameRootStore;

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;
  }

  resolve(node: TravelNode): TravelEncounterResolution {
    switch (node.type) {
      case 'battle':
      case 'eliteBattle':
      case 'boss':
        return this.resolveBattleNode(node);
      case 'story':
        return this.resolveStoryNode(node);
      case 'loot':
        return this.resolveLootNode(node);
      case 'question':
        return this.resolveQuestionNode(node);
      case 'trap':
      case 'heal':
      case 'rest':
      case 'empty':
      case 'shop':
        return this.resolveEffectNode(node);
      case 'exit':
        return this.resolveExitNode(node);
      default:
        return {
          message: `${node.title ?? node.id} is quiet for now.`,
        };
    }
  }

  private resolveBattleNode(node: TravelNode): TravelEncounterResolution {
    const battleTemplateId = node.battleTemplateId ?? node.encounterRefId;

    if (!battleTemplateId) {
      return {
        message: `${node.title ?? node.id} has no configured battle.`,
      };
    }

    this.rootStore.executeEffect({
      type: 'startBattle',
      battleTemplateId,
    });

    return {
      message: `${node.title ?? node.id} erupts into battle.`,
    };
  }

  private resolveStoryNode(node: TravelNode): TravelEncounterResolution {
    const dialogueId = node.dialogueId ?? node.eventRefId;

    if (!dialogueId) {
      return {
        message: `${node.title ?? node.id} has no story event configured.`,
      };
    }

    this.rootStore.dialogue.startDialogue(dialogueId);

    if (node.onResolveEffects?.length) {
      this.rootStore.executeEffects(node.onResolveEffects);
    }

    return {
      message: `${node.title ?? node.id} opens a story scene.`,
    };
  }

  private resolveLootNode(node: TravelNode): TravelEncounterResolution {
    if (node.itemId) {
      this.rootStore.inventory.addItem(node.itemId, node.itemQuantity ?? 1);
    }

    if (node.onResolveEffects?.length) {
      this.rootStore.executeEffects(node.onResolveEffects);
    }

    return {
      message: `${node.title ?? node.id} yields a cache worth claiming.`,
    };
  }

  private resolveQuestionNode(node: TravelNode): TravelEncounterResolution {
    if (node.eventRefId) {
      this.rootStore.executeEffect({
        type: 'runScript',
        scriptId: node.eventRefId,
      });
    }

    if (node.onResolveEffects?.length) {
      this.rootStore.executeEffects(node.onResolveEffects);
    }

    return {
      message: `${node.title ?? node.id} reveals an uncertain omen.`,
    };
  }

  private resolveEffectNode(node: TravelNode): TravelEncounterResolution {
    if (node.onResolveEffects?.length) {
      this.rootStore.executeEffects(node.onResolveEffects);
    }

    const messageByType: Record<string, string> = {
      empty: `${node.title ?? node.id} passes without incident.`,
      trap: `${node.title ?? node.id} springs shut around the party.`,
      heal: `${node.title ?? node.id} offers a brief recovery.`,
      rest: `${node.title ?? node.id} becomes a temporary refuge.`,
      shop: `${node.title ?? node.id} stands ready for future merchants.`,
    };

    return {
      message: messageByType[node.type] ?? `${node.title ?? node.id} changes the state of the route.`,
    };
  }

  private resolveExitNode(node: TravelNode): TravelEncounterResolution {
    if (node.onResolveEffects?.length) {
      this.rootStore.executeEffects(node.onResolveEffects);
    }

    return {
      message: `${node.title ?? node.id} leads out of the route.`,
      completed: true,
    };
  }
}
