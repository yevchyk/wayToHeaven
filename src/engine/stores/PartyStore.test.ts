import { GameRootStore } from '@engine/stores/GameRootStore';

describe('PartyStore', () => {
  it('initializes runtime hp and mana from templates and instances', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(rootStore.defaultPartyInstanceIds);

    const hero = rootStore.party.unitStates.get('main-hero');
    const companion = rootStore.party.unitStates.get('road-companion');

    expect(hero?.currentHp).toBe(hero?.derivedStats.maxHp);
    expect(hero?.currentMana).toBe(hero?.derivedStats.maxMana);
    expect(companion?.currentHp).toBe(62);
    expect(companion?.currentMana).toBe(18);
  });

  it('supports tag mutation on runtime units', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(rootStore.defaultPartyInstanceIds);
    rootStore.party.addTag('main-hero', 'blessed');

    expect(rootStore.party.unitStates.get('main-hero')?.tags).toContain('blessed');

    rootStore.party.removeTag('main-hero', 'blessed');

    expect(rootStore.party.unitStates.get('main-hero')?.tags).not.toContain('blessed');
  });

  it('tracks active party and reserve membership', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(rootStore.defaultPartyInstanceIds, ['main-hero']);

    expect(rootStore.party.rosterIds).toEqual(['main-hero', 'road-companion']);
    expect(rootStore.party.activePartyIds).toEqual(['main-hero']);
    expect(rootStore.party.reservePartyIds).toEqual(['road-companion']);
    expect(rootStore.party.activeUnits.map((unit) => unit.unitId)).toEqual(['main-hero']);
    expect(rootStore.party.reserveUnits.map((unit) => unit.unitId)).toEqual(['road-companion']);
    expect(rootStore.party.hasReserveMembers).toBe(true);
  });

  it('supports equipping and unequipping runtime equipment through the inventory', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(rootStore.defaultPartyInstanceIds);
    rootStore.inventory.addItem('iron-helm', 1);

    const equipResult = rootStore.party.equipItem('main-hero', 'iron-helm');

    expect(equipResult.equipped).toBe(true);
    expect(rootStore.party.getEquippedItemId('main-hero', 'headwear')).toBe('iron-helm');
    expect(rootStore.inventory.getItemCount('iron-helm')).toBe(0);

    const unequipResult = rootStore.party.unequipItem('main-hero', 'headwear');

    expect(unequipResult.unequipped).toBe(true);
    expect(rootStore.party.getEquippedItemId('main-hero', 'headwear')).toBeNull();
    expect(rootStore.inventory.getItemCount('iron-helm')).toBe(1);
  });

  it('tracks the selected character for preview and management flows', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(rootStore.defaultPartyInstanceIds);
    rootStore.party.setSelectedCharacter('road-companion');

    expect(rootStore.party.selectedCharacterId).toBe('road-companion');
    expect(rootStore.party.selectedCharacter?.name).toBe('Ash');
    expect(rootStore.party.getCharacterPreviewLayers('road-companion').map((layer) => layer.id)).toContain('headwear');
  });
});
