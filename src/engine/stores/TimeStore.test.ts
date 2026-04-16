import { GameRootStore } from '@engine/stores/GameRootStore';

describe('TimeStore', () => {
  it('advances hours, rolls into the next day, and mirrors story flags', () => {
    const rootStore = new GameRootStore();

    rootStore.time.setTime(1, 18);
    rootStore.time.advanceHours(8);

    expect(rootStore.time.snapshot).toEqual({
      day: 2,
      hour: 2,
    });
    expect(rootStore.time.segment).toBe('night');
    expect(rootStore.flags.getNumericFlag('story.day')).toBe(2);
    expect(rootStore.flags.getStringFlag('story.timeSegment')).toBe('night');
  });

  it('tracks base hunger pressure when visible time is spent', () => {
    const rootStore = new GameRootStore();

    rootStore.meta.setMetaValue('hunger', 0);
    rootStore.time.advanceHours(7);

    expect(rootStore.meta.hunger).toBe(2);
  });

  it('accepts legacy story flags as time input without desyncing the clock', () => {
    const rootStore = new GameRootStore();

    rootStore.flags.setNumericFlag('story.day', 3);
    rootStore.flags.setStringFlag('story.timeSegment', 'evening');

    expect(rootStore.time.day).toBe(3);
    expect(rootStore.time.segment).toBe('evening');
    expect(rootStore.time.hour).toBe(18);
  });
});
