import { ScriptRegistry } from '@engine/registries/scriptRegistry';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  EffectBatchResult,
  EffectExecutionResult,
  GameEffect,
} from '@engine/types/effects';

type EffectType = GameEffect['type'];

type EffectHandler<TType extends EffectType> = (
  effect: Extract<GameEffect, { type: TType }>,
) => EffectExecutionResult<Extract<GameEffect, { type: TType }>>;

type EffectHandlerMap = {
  [TType in EffectType]: EffectHandler<TType>;
};

function asEffectArray(result: ReturnType<ScriptRegistry['execute']>) {
  if (!result) {
    return [];
  }

  return Array.isArray(result) ? result : [result];
}

export class EffectRunner {
  readonly rootStore: GameRootStore;
  readonly scriptRegistry: ScriptRegistry;

  private handlers: EffectHandlerMap;

  constructor(rootStore: GameRootStore, scriptRegistry: ScriptRegistry) {
    this.rootStore = rootStore;
    this.scriptRegistry = scriptRegistry;
    this.handlers = this.createHandlerMap();
  }

  registerHandler<TType extends EffectType>(type: TType, handler: EffectHandler<TType>) {
    this.handlers = {
      ...this.handlers,
      [type]: handler,
    };
  }

  run(effect: GameEffect): EffectExecutionResult {
    const handler = this.handlers[effect.type] as EffectHandler<typeof effect.type>;

    return handler(effect as Extract<GameEffect, { type: typeof effect.type }>);
  }

  runMany(effects: readonly GameEffect[]): EffectBatchResult {
    const results = effects.map((effect) => this.run(effect));

    return {
      results,
      appliedCount: results.filter((result) => result.status === 'applied').length,
      skippedCount: results.filter((result) => result.status === 'skipped').length,
      missingScriptCount: results.filter((result) => result.status === 'missingScript').length,
    };
  }

  private createHandlerMap(): EffectHandlerMap {
    return {
      setFlag: (effect) => {
        const flagId = effect.flagId ?? effect.key;

        if (!flagId) {
          return {
            effect,
            status: 'skipped',
            details: 'setFlag effect is missing both flagId and key.',
          };
        }

        this.rootStore.flags.setFlag(flagId, effect.value);

        return {
          effect,
          status: 'applied',
        };
      },
      setCharacterOutfit: (effect) => {
        this.rootStore.appearance.setCharacterOutfit(effect.characterId, effect.outfitId);

        return {
          effect,
          status: 'applied',
        };
      },
      changeMeta: (effect) => {
        this.rootStore.meta.changeMeta(effect.key, effect.delta);

        return {
          effect,
          status: 'applied',
        };
      },
      changeStat: (effect) => {
        this.rootStore.stats.changeStat(effect.key, effect.delta);

        return {
          effect,
          status: 'applied',
        };
      },
      setStat: (effect) => {
        this.rootStore.stats.setStat(effect.key, effect.value);

        return {
          effect,
          status: 'applied',
        };
      },
      unlockStat: (effect) => {
        this.rootStore.stats.unlockStat(effect.key);

        return {
          effect,
          status: 'applied',
        };
      },
      addTag: (effect) => {
        const affectedUnits = this.rootStore.party.addTagToScope(
          effect.targetScope,
          effect.tag,
          effect.targetId,
        );

        return affectedUnits.length > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching party units were found for addTag.',
            };
      },
      removeTag: (effect) => {
        const affectedUnits = this.rootStore.party.removeTagFromScope(
          effect.targetScope,
          effect.tag,
          effect.targetId,
        );

        return affectedUnits.length > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching party units were found for removeTag.',
            };
      },
      giveItem: (effect) => {
        this.rootStore.inventory.addItem(effect.itemId, effect.quantity);

        return {
          effect,
          status: 'applied',
        };
      },
      removeItem: (effect) => {
        const removed = this.rootStore.inventory.removeItem(effect.itemId, effect.quantity);

        return removed
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'Inventory does not contain enough items to remove.',
            };
      },
      restoreResource: (effect) => {
        const restoredInBattle = this.rootStore.battle.hasActiveBattle
          ? this.rootStore.battle.restoreResourceToScope(
              effect.targetScope,
              effect.resource,
              effect.amount,
              effect.targetId,
            )
          : [];
        const restoredUnitIds =
          restoredInBattle.length > 0
            ? restoredInBattle
            : this.rootStore.party.restoreResourceToScope(
                effect.targetScope,
                effect.resource,
                effect.amount,
                effect.targetId,
              );

        return restoredUnitIds.length > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching units could receive the resource restore effect.',
            };
      },
      startBattle: (effect) => {
        this.rootStore.battle.startBattle(effect.battleTemplateId);

        return {
          effect,
          status: 'applied',
        };
      },
      startTravelBoard: (effect) => {
        this.rootStore.travelBoardController.startBoard(effect.boardId, effect.startNodeId);

        return {
          effect,
          status: 'applied',
        };
      },
      changeLocation: (effect) => {
        this.rootStore.worldController.loadLocation(effect.locationId, effect.nodeId);

        return {
          effect,
          status: 'applied',
        };
      },
      setBackground: (effect) => {
        this.rootStore.dialogue.setBackground(effect.backgroundId);

        return {
          effect,
          status: 'applied',
        };
      },
      playMusic: (effect) => {
        this.rootStore.dialogue.playMusic(effect.musicId);

        return {
          effect,
          status: 'applied',
        };
      },
      stopMusic: (effect) => {
        this.rootStore.dialogue.stopMusic();

        return {
          effect,
          status: 'applied',
        };
      },
      playSfx: (effect) => {
        this.rootStore.dialogue.playSfx(effect.sfxId);

        return {
          effect,
          status: 'applied',
        };
      },
      showCG: (effect) => {
        this.rootStore.dialogue.showCg(effect.cgId);

        return {
          effect,
          status: 'applied',
        };
      },
      hideCG: (effect) => {
        this.rootStore.dialogue.hideCg();

        return {
          effect,
          status: 'applied',
        };
      },
      setOverlay: (effect) => {
        this.rootStore.dialogue.setOverlay(effect.overlayId);

        return {
          effect,
          status: 'applied',
        };
      },
      clearOverlay: (effect) => {
        this.rootStore.dialogue.setOverlay(null);

        return {
          effect,
          status: 'applied',
        };
      },
      openScreen: (effect) => {
        this.rootStore.ui.setScreen(effect.screenId);

        return {
          effect,
          status: 'applied',
        };
      },
      openModal: (effect) => {
        this.rootStore.ui.openModal(effect.modalId, effect.payload);

        return {
          effect,
          status: 'applied',
        };
      },
      runScript: (effect) => {
        const scriptResult = this.scriptRegistry.execute(effect.scriptId, {
          rootStore: this.rootStore,
          scriptId: effect.scriptId,
          args: effect.args ?? {},
        });

        if (scriptResult === undefined) {
          return {
            effect,
            status: 'missingScript',
            details: `Unknown script: ${effect.scriptId}`,
          };
        }

        const childEffects = asEffectArray(scriptResult);
        const childResults = childEffects.length > 0 ? this.runMany(childEffects).results : undefined;

        return childResults
          ? {
              effect,
              status: 'applied',
              childResults,
            }
          : {
              effect,
              status: 'applied',
            };
      },
      jumpToNode: (effect) => {
        if (!this.rootStore.dialogue.isActive) {
          return {
            effect,
            status: 'skipped',
            details: 'jumpToNode can only run while a dialogue is active.',
          };
        }

        this.rootStore.dialogue.queueJumpToNode(effect.nodeId);

        return {
          effect,
          status: 'applied',
        };
      },
    };
  }
}
