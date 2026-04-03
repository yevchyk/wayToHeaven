import { GameRootStore } from '@engine/stores/GameRootStore';

describe('InventoryStore runtime', () => {
  it('supports stacked item add and remove', () => {
    const rootStore = new GameRootStore();

    rootStore.inventory.addItem('basic-potion', 2);
    rootStore.inventory.addItem('basic-potion', 1);
    rootStore.inventory.addItem('travel-ration', 3);

    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(3);
    expect(rootStore.inventory.getItemCount('travel-ration')).toBe(3);
    expect(rootStore.inventory.totalItemKinds).toBe(2);

    expect(rootStore.inventory.removeItem('basic-potion', 2)).toBe(true);
    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(1);
  });

  it('inspects item data from the item registry', () => {
    const rootStore = new GameRootStore();

    rootStore.inventory.addItem('basic-potion', 1);

    expect(rootStore.inventory.inspectItem('basic-potion')).toMatchObject({
      id: 'basic-potion',
      name: 'Basic Potion',
      type: 'consumable',
    });
    expect(rootStore.inventory.detailedEntries[0]).toMatchObject({
      itemId: 'basic-potion',
      quantity: 1,
    });
  });

  it('uses a potion, consumes one item, and restores player hp', () => {
    const rootStore = new GameRootStore();

    rootStore.party.loadParty(['main-hero']);

    const hero = rootStore.party.activeUnits[0];

    if (!hero) {
      throw new Error('Expected the party to have a main hero.');
    }

    rootStore.party.upsertUnitState({
      ...hero,
      currentHp: 80,
    });
    rootStore.inventory.addItem('basic-potion', 2);

    const result = rootStore.inventory.useItem('basic-potion');

    expect(result.consumed).toBe(true);
    expect(rootStore.inventory.getItemCount('basic-potion')).toBe(1);
    expect(rootStore.party.activeUnits[0]?.currentHp).toBe(100);
  });

  it('routes ration item effects into meta systems', () => {
    const rootStore = new GameRootStore();

    rootStore.meta.setMetaValue('hunger', 6);
    rootStore.meta.setMetaValue('morale', 0);
    rootStore.inventory.addItem('travel-ration', 1);

    const result = rootStore.inventory.useItem('travel-ration');

    expect(result.consumed).toBe(true);
    expect(rootStore.inventory.getItemCount('travel-ration')).toBe(0);
    expect(rootStore.meta.snapshot).toEqual({
      hunger: 3,
      safety: 0,
      morale: 1,
      reputation: 0,
      badReputation: 0,
    });
  });
});
