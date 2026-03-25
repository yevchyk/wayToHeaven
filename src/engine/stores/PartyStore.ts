import { observable, makeAutoObservable } from 'mobx';

import { buildPartyUnitRuntime } from '@engine/formulas/runtimeUnits';
import type { GameRootStore } from '@engine/stores/GameRootStore';
import type {
  CharacterPreviewModel,
  CharacterVisualConfig,
  EquippedItemIds,
  EquipmentSlot,
  ResolvedCharacterEquipment,
} from '@engine/types/appearance';
import type { EffectTargetScope, ResourceKey } from '@engine/types/effects';
import type { StatusEffectInstance } from '@engine/types/status';
import type { TagId } from '@engine/types/tags';
import type { CharacterInstance, CharacterTemplate, PartyUnitRuntime } from '@engine/types/unit';
import { buildCharacterPreviewLayers } from '@engine/utils/buildCharacterPreviewLayers';

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cloneStatusEffect(statusEffect: StatusEffectInstance): StatusEffectInstance {
  return {
    ...statusEffect,
    ...(statusEffect.grantedTags ? { grantedTags: [...statusEffect.grantedTags] } : {}),
    ...(statusEffect.metadata ? { metadata: { ...statusEffect.metadata } } : {}),
  };
}

function clonePartyUnitRuntime(unitState: PartyUnitRuntime): PartyUnitRuntime {
  return {
    ...unitState,
    baseStats: { ...unitState.baseStats },
    derivedStats: { ...unitState.derivedStats },
    tags: [...unitState.tags],
    statuses: unitState.statuses.map(cloneStatusEffect),
    skillIds: [...unitState.skillIds],
  };
}

function cloneCharacterVisuals(visuals: CharacterVisualConfig | undefined): CharacterVisualConfig {
  return {
    ...(visuals?.background ? { background: visuals.background } : {}),
    ...(visuals?.body ? { body: visuals.body } : {}),
    ...(visuals?.costume ? { costume: visuals.costume } : {}),
    ...(visuals?.hair ? { hair: visuals.hair } : {}),
    ...(visuals?.aura ? { aura: visuals.aura } : {}),
  };
}

function cloneEquippedItemIds(equippedItemIds: EquippedItemIds | undefined): EquippedItemIds {
  return {
    ...(equippedItemIds?.costume ? { costume: equippedItemIds.costume } : {}),
    ...(equippedItemIds?.headwear ? { headwear: equippedItemIds.headwear } : {}),
    ...(equippedItemIds?.weapon ? { weapon: equippedItemIds.weapon } : {}),
    ...(equippedItemIds?.aura ? { aura: equippedItemIds.aura } : {}),
  };
}

export class PartyStore {
  readonly rootStore: GameRootStore;

  rosterIds: string[] = [];
  activePartyIds: string[] = [];
  reservePartyIds: string[] = [];
  selectedCharacterId: string | null = null;
  unitStates = observable.map<string, PartyUnitRuntime>();
  equippedItemsByUnitId = observable.map<string, EquippedItemIds>();

  constructor(rootStore: GameRootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, { rootStore: false }, { autoBind: true });
  }

  get activeUnits() {
    return this.activePartyIds
      .map((unitId) => this.unitStates.get(unitId))
      .filter((unit): unit is PartyUnitRuntime => unit !== undefined);
  }

  get members() {
    return this.rosterIds
      .map((unitId) => this.unitStates.get(unitId))
      .filter((unit): unit is PartyUnitRuntime => unit !== undefined);
  }

  get reserveUnits() {
    return this.reservePartyIds
      .map((unitId) => this.unitStates.get(unitId))
      .filter((unit): unit is PartyUnitRuntime => unit !== undefined);
  }

  get livingActiveUnits() {
    return this.activeUnits.filter((unit) => unit.currentHp > 0);
  }

  get playerUnitId() {
    return this.activePartyIds[0] ?? this.rosterIds[0] ?? null;
  }

  get hasReserveMembers() {
    return this.reservePartyIds.length > 0;
  }

  get selectedCharacter() {
    if (!this.selectedCharacterId) {
      return null;
    }

    return this.unitStates.get(this.selectedCharacterId) ?? null;
  }

  get selectedCharacterTemplate() {
    if (!this.selectedCharacter) {
      return null;
    }

    return this.rootStore.getCharacterTemplateById(this.selectedCharacter.templateId) ?? null;
  }

  get selectedCharacterPreviewModel() {
    return this.selectedCharacterId ? this.getCharacterPreviewModel(this.selectedCharacterId) : null;
  }

  loadParty(instanceIds: string[], activePartyIds: string[] = instanceIds) {
    const runtimeUnits = instanceIds.map((instanceId) => this.buildRuntimeFromRegistry(instanceId));

    this.setRoster(runtimeUnits);
    this.setActiveParty(activePartyIds);
  }

  setRoster(unitStates: PartyUnitRuntime[]) {
    this.rosterIds = unitStates.map((unit) => unit.unitId);
    this.unitStates.clear();
    this.equippedItemsByUnitId.clear();

    unitStates.forEach((unitState) => {
      this.unitStates.set(unitState.unitId, clonePartyUnitRuntime(unitState));
      this.equippedItemsByUnitId.set(
        unitState.unitId,
        this.buildInitialEquipmentFromRegistry(unitState.unitId),
      );
    });

    this.activePartyIds = [...this.rosterIds];
    this.reservePartyIds = [];
    this.selectedCharacterId = this.activePartyIds[0] ?? this.rosterIds[0] ?? null;
  }

  setActiveParty(unitIds: string[]) {
    const nextActivePartyIds = uniqueValues(unitIds).filter((unitId) => this.rosterIds.includes(unitId));

    this.activePartyIds = nextActivePartyIds;
    this.reservePartyIds = this.rosterIds.filter((unitId) => !nextActivePartyIds.includes(unitId));

    if (!this.selectedCharacterId || !this.rosterIds.includes(this.selectedCharacterId)) {
      this.selectedCharacterId = this.activePartyIds[0] ?? this.rosterIds[0] ?? null;
    }
  }

  upsertUnitState(unitState: PartyUnitRuntime) {
    if (!this.rosterIds.includes(unitState.unitId)) {
      this.rosterIds.push(unitState.unitId);
      this.reservePartyIds.push(unitState.unitId);
    }

    this.unitStates.set(unitState.unitId, clonePartyUnitRuntime(unitState));

    if (!this.equippedItemsByUnitId.has(unitState.unitId)) {
      this.equippedItemsByUnitId.set(
        unitState.unitId,
        this.buildInitialEquipmentFromRegistry(unitState.unitId),
      );
    }

    if (!this.selectedCharacterId) {
      this.selectedCharacterId = unitState.unitId;
    }
  }

  setSelectedCharacter(unitId: string | null) {
    if (!unitId) {
      this.selectedCharacterId = this.activePartyIds[0] ?? this.rosterIds[0] ?? null;

      return;
    }

    if (!this.rosterIds.includes(unitId)) {
      return;
    }

    this.selectedCharacterId = unitId;
  }

  getUnit(unitId: string) {
    return this.unitStates.get(unitId) ?? null;
  }

  getCharacterTemplate(unitId: string) {
    const unit = this.getUnit(unitId);

    if (!unit) {
      return null;
    }

    return this.rootStore.getCharacterTemplateById(unit.templateId) ?? null;
  }

  getCharacterInstance(unitId: string) {
    return this.rootStore.getCharacterInstanceById(unitId) ?? null;
  }

  getCharacterVisuals(unitId: string): CharacterVisualConfig | null {
    const template = this.getCharacterTemplate(unitId);
    const instance = this.getCharacterInstance(unitId);

    if (!template) {
      return null;
    }

    return {
      ...cloneCharacterVisuals(template.preview),
      ...cloneCharacterVisuals(instance?.previewOverrides),
    };
  }

  getEquippedItemIds(unitId: string): EquippedItemIds {
    return cloneEquippedItemIds(this.equippedItemsByUnitId.get(unitId));
  }

  getEquippedItemId(unitId: string, slot: EquipmentSlot) {
    return this.equippedItemsByUnitId.get(unitId)?.[slot] ?? null;
  }

  getEquippedItem(unitId: string, slot: EquipmentSlot) {
    const itemId = this.getEquippedItemId(unitId, slot);

    return itemId ? this.rootStore.getItemById(itemId) ?? null : null;
  }

  getResolvedEquippedItems(unitId: string): ResolvedCharacterEquipment {
    const equippedItemIds = this.getEquippedItemIds(unitId);

    return {
      ...(equippedItemIds.costume
        ? { costume: this.resolveEquippedItemVisual(equippedItemIds.costume, 'costume') }
        : {}),
      ...(equippedItemIds.headwear
        ? { headwear: this.resolveEquippedItemVisual(equippedItemIds.headwear, 'headwear') }
        : {}),
      ...(equippedItemIds.weapon
        ? { weapon: this.resolveEquippedItemVisual(equippedItemIds.weapon, 'weapon') }
        : {}),
      ...(equippedItemIds.aura
        ? { aura: this.resolveEquippedItemVisual(equippedItemIds.aura, 'aura') }
        : {}),
    };
  }

  getCharacterPreviewModel(unitId: string): CharacterPreviewModel | null {
    const unit = this.getUnit(unitId);
    const visuals = this.getCharacterVisuals(unitId);

    if (!unit || !visuals) {
      return null;
    }

    return {
      unitId: unit.unitId,
      name: unit.name,
      visuals,
      equippedItems: this.getResolvedEquippedItems(unitId),
    };
  }

  getCharacterPreviewLayers(unitId: string) {
    const previewModel = this.getCharacterPreviewModel(unitId);

    return previewModel ? buildCharacterPreviewLayers(previewModel) : [];
  }

  equipItem(unitId: string, itemId: string) {
    const unit = this.getUnit(unitId);
    const item = this.rootStore.getItemById(itemId);

    if (!unit) {
      return {
        equipped: false,
        message: `Character "${unitId}" is not available.`,
      };
    }

    if (!item?.equipment || item.type !== 'equipment') {
      return {
        equipped: false,
        message: `Item "${itemId}" is not equippable.`,
      };
    }

    if (!this.rootStore.inventory.hasItem(itemId)) {
      return {
        equipped: false,
        message: `Item "${item.name}" is not available in the inventory.`,
      };
    }

    const slot = item.equipment.slot;
    const currentEquipment = this.getEquippedItemIds(unitId);
    const replacedItemId = currentEquipment[slot];

    if (replacedItemId === itemId) {
      return {
        equipped: false,
        message: `${item.name} is already equipped.`,
      };
    }

    const removed = this.rootStore.inventory.removeItem(itemId, 1);

    if (!removed) {
      return {
        equipped: false,
        message: `Item "${item.name}" could not be removed from the inventory.`,
      };
    }

    if (replacedItemId) {
      this.rootStore.inventory.addItem(replacedItemId, 1);
    }

    this.equippedItemsByUnitId.set(unitId, {
      ...currentEquipment,
      [slot]: itemId,
    });

    return {
      equipped: true,
      slot,
      replacedItemId: replacedItemId ?? null,
    };
  }

  unequipItem(unitId: string, slot: EquipmentSlot) {
    const currentEquipment = this.getEquippedItemIds(unitId);
    const itemId = currentEquipment[slot];

    if (!itemId) {
      return {
        unequipped: false,
        message: `No item is equipped in ${slot}.`,
      };
    }

    this.rootStore.inventory.addItem(itemId, 1);

    const nextEquipment = {
      ...currentEquipment,
    };

    delete nextEquipment[slot];

    this.equippedItemsByUnitId.set(unitId, nextEquipment);

    return {
      unequipped: true,
      itemId,
    };
  }

  addTag(unitId: string, tag: string) {
    const unitState = this.unitStates.get(unitId);

    if (!unitState || unitState.tags.includes(tag)) {
      return;
    }

    this.unitStates.set(unitId, {
      ...unitState,
      tags: [...unitState.tags, tag],
    });
  }

  removeTag(unitId: string, tag: string) {
    const unitState = this.unitStates.get(unitId);

    if (!unitState || !unitState.tags.includes(tag)) {
      return;
    }

    this.unitStates.set(unitId, {
      ...unitState,
      tags: unitState.tags.filter((entry) => entry !== tag),
    });
  }

  addTagToScope(scope: EffectTargetScope, tag: TagId, targetId?: string) {
    const unitIds = this.resolveScopeUnitIds(scope, targetId);

    unitIds.forEach((unitId) => {
      this.addTag(unitId, tag);
    });

    return unitIds;
  }

  removeTagFromScope(scope: EffectTargetScope, tag: TagId, targetId?: string) {
    const unitIds = this.resolveScopeUnitIds(scope, targetId);

    unitIds.forEach((unitId) => {
      this.removeTag(unitId, tag);
    });

    return unitIds;
  }

  hasTagInScope(scope: EffectTargetScope, tag: TagId, targetId?: string) {
    const unitIds = this.resolveScopeUnitIds(scope, targetId);

    return unitIds.some((unitId) => {
      const unit = this.unitStates.get(unitId);

      return unit ? this.rootStore.statusProcessor.hasTag(unit, tag) : false;
    });
  }

  restoreResource(unitId: string, resource: ResourceKey, amount: number) {
    if (amount <= 0) {
      return false;
    }

    const unitState = this.unitStates.get(unitId);

    if (!unitState) {
      return false;
    }

    if (resource === 'hp') {
      const nextHp = clamp(unitState.currentHp + amount, 0, unitState.derivedStats.maxHp);

      if (nextHp === unitState.currentHp) {
        return false;
      }

      this.unitStates.set(unitId, {
        ...unitState,
        currentHp: nextHp,
      });

      return true;
    }

    const nextMana = clamp(unitState.currentMana + amount, 0, unitState.derivedStats.maxMana);

    if (nextMana === unitState.currentMana) {
      return false;
    }

    this.unitStates.set(unitId, {
      ...unitState,
      currentMana: nextMana,
    });

    return true;
  }

  restoreResourceToScope(
    scope: EffectTargetScope,
    resource: ResourceKey,
    amount: number,
    targetId?: string,
  ) {
    const unitIds = this.resolveScopeUnitIds(scope, targetId);
    const restoredUnitIds = unitIds.filter((unitId) => this.restoreResource(unitId, resource, amount));

    return restoredUnitIds;
  }

  reset() {
    this.rosterIds = [];
    this.activePartyIds = [];
    this.reservePartyIds = [];
    this.selectedCharacterId = null;
    this.unitStates.clear();
    this.equippedItemsByUnitId.clear();
  }

  private buildRuntimeFromRegistry(instanceId: string) {
    const instance = this.rootStore.getCharacterInstanceById(instanceId);

    if (!instance) {
      throw new Error(`Character instance "${instanceId}" was not found.`);
    }

    const template = this.rootStore.getCharacterTemplateById(instance.templateId);

    if (!template) {
      throw new Error(`Character template "${instance.templateId}" was not found.`);
    }

    return buildPartyUnitRuntime(template, instance);
  }

  private buildInitialEquipmentFromRegistry(unitId: string) {
    const template = this.getCharacterTemplate(unitId);
    const instance = this.getCharacterInstance(unitId);

    return {
      ...cloneEquippedItemIds(template?.startingEquipment),
      ...cloneEquippedItemIds(instance?.equippedItemIds),
    };
  }

  private resolveEquippedItemVisual(itemId: string, slot: EquipmentSlot) {
    const item = this.rootStore.getItemById(itemId);

    if (!item?.equipment) {
      return null;
    }

    return {
      itemId: item.id,
      itemName: item.name,
      slot,
      layerId: item.equipment.visual?.layer ?? item.equipment.slot,
      ...(item.equipment.visual?.assetId ? { assetId: item.equipment.visual.assetId } : {}),
      ...(item.equipment.replaceHair ? { replaceHair: true } : {}),
    };
  }

  private resolveScopeUnitIds(scope: EffectTargetScope, targetId?: string) {
    if (scope === 'unit') {
      return targetId && this.unitStates.has(targetId) ? [targetId] : [];
    }

    if (scope === 'player') {
      return this.playerUnitId ? [this.playerUnitId] : [];
    }

    return this.activePartyIds.filter((unitId) => this.unitStates.has(unitId));
  }
}
