import type { NarrativeAssetDefinition } from '@engine/types/narrative';

export const chapter1BackgroundIds = {
  introRoom: 'chapter-1/backgrounds/intro-room',
  prisonCell: 'chapter-1/backgrounds/prison-cell',
  cityGate: 'chapter-1/backgrounds/city-gate',
} as const;

export const chapter1PortraitIds = {
  heroine: {
    neutral: 'chapter-1/portraits/heroine/neutral',
    afraid: 'chapter-1/portraits/heroine/afraid',
    determined: 'chapter-1/portraits/heroine/determined',
  },
  oldVoice: {
    calm: 'chapter-1/portraits/old-voice/calm',
    warm: 'chapter-1/portraits/old-voice/warm',
    stern: 'chapter-1/portraits/old-voice/stern',
  },
  gateGuard: {
    stern: 'chapter-1/portraits/gate-guard/stern',
    warm: 'chapter-1/portraits/gate-guard/warm',
    angry: 'chapter-1/portraits/gate-guard/angry',
    neutral: 'chapter-1/portraits/gate-guard/neutral',
  },
} as const;

export const chapter1CgIds = {
  awakeningFlash: 'chapter-1/cg/awakening-flash',
} as const;

export const chapter1OverlayIds = {
  dreamVeil: 'chapter-1/overlays/dream-veil',
} as const;

export const chapter1MapIds = {
  pilgrimRoad: 'chapter-1/maps/pilgrim-road',
} as const;

export const chapter1MusicIds = {
  introTheme: 'chapter-1/music/under-stone',
  whisperMotif: 'chapter-1/music/whisper-motif',
} as const;

export const chapter1SfxIds = {
  heartbeat: 'chapter-1/sfx/heartbeat',
  chainRattle: 'chapter-1/sfx/chain-rattle',
  whisper: 'chapter-1/sfx/whisper',
} as const;

export const chapter1AssetRegistry: Record<string, NarrativeAssetDefinition> = {
  [chapter1BackgroundIds.introRoom]: {
    id: chapter1BackgroundIds.introRoom,
    kind: 'background',
    chapterId: 'chapter-1',
    label: 'Intro Room',
    sourcePath: 'src/content/chapters/chapter-1/images/backgrounds/intro-room.png',
  },
  [chapter1BackgroundIds.prisonCell]: {
    id: chapter1BackgroundIds.prisonCell,
    kind: 'background',
    chapterId: 'chapter-1',
    label: 'Prison Cell',
    sourcePath: 'src/content/chapters/chapter-1/images/backgrounds/prison-cell.png',
  },
  [chapter1BackgroundIds.cityGate]: {
    id: chapter1BackgroundIds.cityGate,
    kind: 'background',
    chapterId: 'chapter-1',
    label: 'City Gate',
    sourcePath: 'src/content/chapters/chapter-1/images/backgrounds/city-gate.png',
  },
  [chapter1PortraitIds.heroine.neutral]: {
    id: chapter1PortraitIds.heroine.neutral,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Heroine Neutral',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/heroine/neutral.png',
  },
  [chapter1PortraitIds.heroine.afraid]: {
    id: chapter1PortraitIds.heroine.afraid,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Heroine Afraid',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/heroine/afraid.png',
  },
  [chapter1PortraitIds.heroine.determined]: {
    id: chapter1PortraitIds.heroine.determined,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Heroine Determined',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/heroine/determined.png',
  },
  [chapter1PortraitIds.oldVoice.calm]: {
    id: chapter1PortraitIds.oldVoice.calm,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Old Voice Calm',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/old-voice/calm.png',
  },
  [chapter1PortraitIds.oldVoice.warm]: {
    id: chapter1PortraitIds.oldVoice.warm,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Old Voice Warm',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/old-voice/warm.png',
  },
  [chapter1PortraitIds.oldVoice.stern]: {
    id: chapter1PortraitIds.oldVoice.stern,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Old Voice Stern',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/old-voice/stern.png',
  },
  [chapter1PortraitIds.gateGuard.stern]: {
    id: chapter1PortraitIds.gateGuard.stern,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Gate Guard Stern',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/gate-guard/stern.png',
  },
  [chapter1PortraitIds.gateGuard.warm]: {
    id: chapter1PortraitIds.gateGuard.warm,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Gate Guard Warm',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/gate-guard/warm.png',
  },
  [chapter1PortraitIds.gateGuard.angry]: {
    id: chapter1PortraitIds.gateGuard.angry,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Gate Guard Angry',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/gate-guard/angry.png',
  },
  [chapter1PortraitIds.gateGuard.neutral]: {
    id: chapter1PortraitIds.gateGuard.neutral,
    kind: 'portrait',
    chapterId: 'chapter-1',
    label: 'Gate Guard Neutral',
    sourcePath: 'src/content/chapters/chapter-1/images/portraits/gate-guard/neutral.png',
  },
  [chapter1CgIds.awakeningFlash]: {
    id: chapter1CgIds.awakeningFlash,
    kind: 'cg',
    chapterId: 'chapter-1',
    label: 'Awakening Flash',
    sourcePath: 'src/content/chapters/chapter-1/images/cg/awakening-flash.png',
  },
  [chapter1OverlayIds.dreamVeil]: {
    id: chapter1OverlayIds.dreamVeil,
    kind: 'overlay',
    chapterId: 'chapter-1',
    label: 'Dream Veil',
    sourcePath: 'src/content/chapters/chapter-1/images/overlays/dream-veil.png',
  },
  [chapter1MapIds.pilgrimRoad]: {
    id: chapter1MapIds.pilgrimRoad,
    kind: 'map',
    chapterId: 'chapter-1',
    label: 'Pilgrim Road Map',
    sourcePath: 'src/content/chapters/chapter-1/images/maps/pilgrim-road.png',
  },
  [chapter1MusicIds.introTheme]: {
    id: chapter1MusicIds.introTheme,
    kind: 'music',
    chapterId: 'chapter-1',
    label: 'Under Stone',
    sourcePath: 'src/content/chapters/chapter-1/music/under-stone.ogg',
  },
  [chapter1MusicIds.whisperMotif]: {
    id: chapter1MusicIds.whisperMotif,
    kind: 'music',
    chapterId: 'chapter-1',
    label: 'Whisper Motif',
    sourcePath: 'src/content/chapters/chapter-1/music/whisper-motif.ogg',
  },
  [chapter1SfxIds.heartbeat]: {
    id: chapter1SfxIds.heartbeat,
    kind: 'sfx',
    chapterId: 'chapter-1',
    label: 'Heartbeat',
    sourcePath: 'src/content/chapters/chapter-1/sfx/heartbeat.ogg',
  },
  [chapter1SfxIds.chainRattle]: {
    id: chapter1SfxIds.chainRattle,
    kind: 'sfx',
    chapterId: 'chapter-1',
    label: 'Chain Rattle',
    sourcePath: 'src/content/chapters/chapter-1/sfx/chain-rattle.ogg',
  },
  [chapter1SfxIds.whisper]: {
    id: chapter1SfxIds.whisper,
    kind: 'sfx',
    chapterId: 'chapter-1',
    label: 'Whisper',
    sourcePath: 'src/content/chapters/chapter-1/sfx/whisper.ogg',
  },
};
