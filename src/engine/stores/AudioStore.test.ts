import { describe, expect, it, vi } from 'vitest';

import { chapter1MusicIds, chapter1SfxIds } from '@content/chapters/chapter-1/assets';
import type { AudioElementLike } from '@engine/stores/AudioStore';
import { GameRootStore } from '@engine/stores/GameRootStore';

interface MockAudioElement extends AudioElementLike {
  pauseSpy: ReturnType<typeof vi.fn>;
  playSpy: ReturnType<typeof vi.fn>;
}

function createAudioHarness() {
  const elements: MockAudioElement[] = [];

  return {
    elements,
    createAudioElement: () => {
      const playSpy = vi.fn().mockResolvedValue(undefined);
      const pauseSpy = vi.fn();
      const element: MockAudioElement = {
        currentTime: 0,
        loop: false,
        paused: true,
        src: '',
        volume: 1,
        pause: pauseSpy,
        play: playSpy,
        pauseSpy,
        playSpy,
      };

      elements.push(element);

      return element;
    },
  };
}

describe('AudioStore', () => {
  it('plays scene-flow default music and applies node music/sfx updates at runtime', () => {
    const audioHarness = createAudioHarness();
    const rootStore = new GameRootStore({
      createAudioElement: audioHarness.createAudioElement,
      resolveAudioUrl: (assetId) => (assetId ? `/audio/${assetId}.ogg` : null),
    });

    rootStore.sceneFlowRegistry['tests/audio/runtime'] = {
      id: 'tests/audio/runtime',
      title: 'Audio Runtime',
      mode: 'sequence',
      startNodeId: 'intro',
      nodes: {
        intro: {
          id: 'intro',
          kind: 'line',
          sourceNodeType: 'narration',
          text: 'Music starts from defaults.',
          transitions: [
            {
              id: 'to-patch',
              nextNodeId: 'patch',
            },
          ],
        },
        patch: {
          id: 'patch',
          kind: 'line',
          sourceNodeType: 'narration',
          text: 'Music switches and SFX plays.',
          music: {
            action: 'switch',
            musicId: chapter1MusicIds.whisperMotif,
          },
          sfx: {
            sfxId: chapter1SfxIds.heartbeat,
          },
          transitions: [],
        },
      },
      source: {
        type: 'sceneGeneration',
        id: 'tests/scene-generation/audio-runtime',
      },
      defaultMusicId: chapter1MusicIds.introTheme,
    };

    rootStore.sceneFlowController.startSceneFlow('tests/audio/runtime');

    expect(rootStore.audio.musicAssetId).toBe(chapter1MusicIds.introTheme);
    expect(rootStore.audio.musicStatus).toBe('playing');
    expect(audioHarness.elements).toHaveLength(1);
    expect(audioHarness.elements[0]?.src).toContain(chapter1MusicIds.introTheme);

    rootStore.dialogue.next();

    expect(rootStore.audio.musicAssetId).toBe(chapter1MusicIds.whisperMotif);
    expect(rootStore.audio.lastSfxId).toBe(chapter1SfxIds.heartbeat);
    expect(rootStore.audio.sfxPlayCount).toBe(1);
    expect(audioHarness.elements).toHaveLength(3);
    expect(audioHarness.elements[1]?.src).toContain(chapter1MusicIds.whisperMotif);
    expect(audioHarness.elements[2]?.src).toContain(chapter1SfxIds.heartbeat);
  });

  it('replays the same sfx id on consecutive requests', () => {
    const audioHarness = createAudioHarness();
    const rootStore = new GameRootStore({
      createAudioElement: audioHarness.createAudioElement,
      resolveAudioUrl: (assetId) => (assetId ? `/audio/${assetId}.ogg` : null),
    });

    rootStore.sceneFlowController.playSfx(chapter1SfxIds.heartbeat);
    rootStore.sceneFlowController.playSfx(chapter1SfxIds.heartbeat);

    expect(rootStore.audio.lastSfxId).toBe(chapter1SfxIds.heartbeat);
    expect(rootStore.audio.sfxPlayCount).toBe(2);
    expect(audioHarness.elements).toHaveLength(2);
  });
});
