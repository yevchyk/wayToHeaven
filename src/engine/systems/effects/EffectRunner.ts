import { ScriptRegistry } from '@engine/registries/scriptRegistry';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  EffectBatchResult,
  EffectExecutionResult,
  GameEffect,
} from '@engine/types/effects';
import type { NarrativeProfileKey } from '@engine/types/profile';
import { buildSceneReplayLibraryEntryId } from '@engine/systems/library/libraryDiscovery';

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

function resolveRelationshipTarget(effect: Extract<GameEffect, { type: 'changeRelationship' }>) {
  return {
    relationshipId: effect.relationshipId ?? effect.key ?? null,
    axis: effect.axis ?? 'affinity',
  };
}

function shouldSyncReactiveQuests(effect: GameEffect) {
  switch (effect.type) {
    case 'setFlag':
    case 'changeMeta':
    case 'changeStat':
    case 'changeProfile':
    case 'setStat':
    case 'setProfile':
    case 'unlockStat':
    case 'unlockProfile':
    case 'changeRelationship':
    case 'addTag':
    case 'removeTag':
    case 'giveItem':
    case 'removeItem':
      return true;
    default:
      return false;
  }
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
    const result = handler(effect as Extract<GameEffect, { type: typeof effect.type }>);

    if (result.status === 'applied' && shouldSyncReactiveQuests(effect)) {
      this.rootStore.quests.syncReactiveQuests();
    }

    this.rootStore.debug.recordEffect(result);

    return result;
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
      unlockSceneReplay: (effect) => {
        this.rootStore.seenContent.markSceneEntryDiscovered(
          buildSceneReplayLibraryEntryId(effect.sceneId),
        );

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
      addQuest: (effect) => {
        this.rootStore.quests.addQuest(effect.questId);

        return {
          effect,
          status: 'applied',
        };
      },
      advanceQuest: (effect) => {
        this.rootStore.quests.advanceQuest(effect.questId, effect.delta ?? 1, effect.objectiveId);

        return {
          effect,
          status: 'applied',
        };
      },
      completeQuest: (effect) => {
        this.rootStore.quests.completeQuest(effect.questId);

        return {
          effect,
          status: 'applied',
        };
      },
      changeStat: (effect) => {
        this.applyProfileChange(effect.key, 'changeStat', () => {
          this.rootStore.profile.changeProfileValue(effect.key, effect.delta);
        });

        return {
          effect,
          status: 'applied',
        };
      },
      changeProfile: (effect) => {
        this.applyProfileChange(effect.key, 'changeProfile', () => {
          this.rootStore.profile.changeProfileValue(effect.key, effect.delta);
        });

        return {
          effect,
          status: 'applied',
        };
      },
      changeRelationship: (effect) => {
        const target = resolveRelationshipTarget(effect);

        if (!target.relationshipId) {
          return {
            effect,
            status: 'skipped',
            details: 'changeRelationship effect is missing both relationshipId and key.',
          };
        }

        this.rootStore.relationships.changeRelationshipValue(
          target.relationshipId,
          target.axis,
          effect.delta,
        );

        return {
          effect,
          status: 'applied',
        };
      },
      setStat: (effect) => {
        this.applyProfileChange(effect.key, 'setStat', () => {
          this.rootStore.profile.setProfileValue(effect.key, effect.value);
        });

        return {
          effect,
          status: 'applied',
        };
      },
      setProfile: (effect) => {
        this.applyProfileChange(effect.key, 'setProfile', () => {
          this.rootStore.profile.setProfileValue(effect.key, effect.value);
        });

        return {
          effect,
          status: 'applied',
        };
      },
      unlockStat: (effect) => {
        this.applyProfileChange(effect.key, 'unlockStat', () => {
          this.rootStore.profile.unlockProfile(effect.key);
        });

        return {
          effect,
          status: 'applied',
        };
      },
      unlockProfile: (effect) => {
        this.applyProfileChange(effect.key, 'unlockProfile', () => {
          this.rootStore.profile.unlockProfile(effect.key);
        });

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
      dealDamage: (effect) => {
        const damagedInBattle = this.rootStore.battle.hasActiveBattle
          ? this.rootStore.battle.dealDamageToScope(effect.targetScope, effect.amount, {
              ...(effect.damageKind !== undefined ? { damageKind: effect.damageKind } : {}),
              ...(effect.sourceUnitId !== undefined ? { sourceUnitId: effect.sourceUnitId } : {}),
              ...(effect.targetId !== undefined ? { targetId: effect.targetId } : {}),
            }).damagedUnitIds
          : [];
        const damagedUnitIds =
          damagedInBattle.length > 0
            ? damagedInBattle
            : this.rootStore.party.dealDamageToScope(effect.targetScope, effect.amount, {
                ...(effect.damageKind !== undefined ? { damageKind: effect.damageKind } : {}),
                ...(effect.targetId !== undefined ? { targetId: effect.targetId } : {}),
              }).damagedUnitIds;

        return damagedUnitIds.length > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching units could receive the damage effect.',
            };
      },
      removeStatus: (effect) => {
        const removedInBattle = this.rootStore.battle.hasActiveBattle
          ? this.rootStore.battle.removeStatusFromScope(
              effect.targetScope,
              effect.statusType,
              effect.targetId,
            )
          : 0;
        const removedCount =
          removedInBattle > 0
            ? removedInBattle
            : this.rootStore.party.removeStatusFromScope(
                effect.targetScope,
                effect.statusType,
                effect.targetId,
              );

        return removedCount > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching status instances were removed.',
            };
      },
      cleanseStatuses: (effect) => {
        const removedInBattle = this.rootStore.battle.hasActiveBattle
          ? this.rootStore.battle.cleanseStatusesFromScope(effect.targetScope, {
              ...(effect.targetId !== undefined ? { targetId: effect.targetId } : {}),
              ...(effect.onlyNegative !== undefined ? { onlyNegative: effect.onlyNegative } : {}),
              ...(effect.category !== undefined ? { category: effect.category } : {}),
              ...(effect.limit !== undefined ? { limit: effect.limit } : {}),
            })
          : 0;
        const removedCount =
          removedInBattle > 0
            ? removedInBattle
            : this.rootStore.party.cleanseStatusesFromScope(effect.targetScope, {
                ...(effect.targetId !== undefined ? { targetId: effect.targetId } : {}),
                ...(effect.onlyNegative !== undefined ? { onlyNegative: effect.onlyNegative } : {}),
                ...(effect.category !== undefined ? { category: effect.category } : {}),
                ...(effect.limit !== undefined ? { limit: effect.limit } : {}),
              });

        return removedCount > 0
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'No matching statuses were cleansed.',
            };
      },
      advanceTime: (effect) => {
        if (effect.setDay !== undefined) {
          this.rootStore.time.setStoryDay(effect.setDay);
        }

        if (effect.setHour !== undefined) {
          this.rootStore.time.setTime(
            effect.setDay ?? this.rootStore.time.day,
            effect.setHour,
          );
        } else if (effect.setSegment !== undefined) {
          this.rootStore.time.setStorySegment(effect.setSegment);
        }

        const advancedHours = this.rootStore.time.advanceByCost(effect, {
          ...(effect.applyDefaultConsequences !== undefined
            ? { applyDefaultConsequences: effect.applyDefaultConsequences }
            : {}),
        });

        return advancedHours > 0 ||
          effect.setDay !== undefined ||
          effect.setHour !== undefined ||
          effect.setSegment !== undefined
          ? {
              effect,
              status: 'applied',
            }
          : {
              effect,
              status: 'skipped',
              details: 'advanceTime effect did not change the runtime clock.',
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
      startMinigame: (effect) => {
        this.rootStore.miniGameController.startMinigame(effect.minigameId);

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

  private applyProfileChange(
    key: NarrativeProfileKey,
    source: string,
    apply: () => void,
  ) {
    const previousValue = this.rootStore.profile.getProfileValue(key);
    const previousUnlocked = this.rootStore.profile.isUnlocked(key);

    apply();

    this.rootStore.debug.recordStatChange({
      key,
      source,
      previousValue,
      nextValue: this.rootStore.profile.getProfileValue(key),
      previousUnlocked,
      nextUnlocked: this.rootStore.profile.isUnlocked(key),
    });
  }
}
