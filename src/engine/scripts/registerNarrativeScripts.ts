import { ScriptRegistry } from '@engine/registries/scriptRegistry';

export function registerNarrativeScripts(scriptRegistry: ScriptRegistry) {
  scriptRegistry.register('chapter1.goToUndergroundAwakening', () => [
    {
      type: 'setFlag',
      flagId: 'chapter1.undergroundAwakeningQueued',
      value: true,
    },
    {
      type: 'startTravelBoard',
      boardId: 'chapter-1/travel/underground-route',
    },
  ]);

  scriptRegistry.register('chapter1.travel.forkedWhisper', () => [
    {
      type: 'setFlag',
      flagId: 'chapter1.travel.forkedWhisperHeard',
      value: true,
    },
    {
      type: 'changeProfile',
      key: 'pragmatism',
      delta: 1,
    },
  ]);
}
