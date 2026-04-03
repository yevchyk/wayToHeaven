import type { NarrativeAssetDefinition } from '@engine/types/narrative';

export const chapter2BackgroundIds = {
  arrivalGate: 'chapter-2/backgrounds/hugen-um/arrival-gate',
  sortingYard: 'chapter-2/backgrounds/hugen-um/sorting-yard',
  firstShelter: 'chapter-2/backgrounds/hugen-um/first-shelter',
  marketRibs: 'chapter-2/backgrounds/hugen-um/market-ribs',
  tailQuarter: 'chapter-2/backgrounds/hugen-um/tail-quarter',
  courtAntechamber: 'chapter-2/backgrounds/hugen-um/court-antechamber',
  brokerStall: 'chapter-2/backgrounds/hugen-um/broker-stall',
} as const;

export const chapter2PortraitIds = {
  registrarVey: {
    stern: 'chapter-2/portraits/registrar-vey/stern',
    professional: 'chapter-2/portraits/registrar-vey/professional',
  },
  brokerNena: {
    sharp: 'chapter-2/portraits/broker-nena/sharp',
    soft: 'chapter-2/portraits/broker-nena/soft',
    mocking: 'chapter-2/portraits/broker-nena/mocking',
  },
  matronIoma: {
    tired: 'chapter-2/portraits/matron-ioma/tired',
    calm: 'chapter-2/portraits/matron-ioma/calm',
    hard: 'chapter-2/portraits/matron-ioma/hard',
  },
  tailKeeperRusk: {
    grim: 'chapter-2/portraits/tail-keeper-rusk/grim',
    neutral: 'chapter-2/portraits/tail-keeper-rusk/neutral',
  },
} as const;

export const chapter2MusicIds = {
  cityPressure: 'chapter-2/music/city-pressure',
  ledgerBreath: 'chapter-2/music/ledger-breath',
} as const;

export const chapter2SfxIds = {
  registryStamp: 'chapter-2/sfx/registry-stamp',
  chainGate: 'chapter-2/sfx/chain-gate',
} as const;

export const chapter2AssetRegistry: Record<string, NarrativeAssetDefinition> = {
  [chapter2BackgroundIds.arrivalGate]: {
    id: chapter2BackgroundIds.arrivalGate,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Hugen-Um Arrival Gate',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/arrival-gate.png',
  },
  [chapter2BackgroundIds.sortingYard]: {
    id: chapter2BackgroundIds.sortingYard,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Hugen-Um Sorting Yard',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/sorting-yard.png',
  },
  [chapter2BackgroundIds.firstShelter]: {
    id: chapter2BackgroundIds.firstShelter,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'First Shelter',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/first-shelter.png',
  },
  [chapter2BackgroundIds.marketRibs]: {
    id: chapter2BackgroundIds.marketRibs,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Market Ribs',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/market-ribs.png',
  },
  [chapter2BackgroundIds.tailQuarter]: {
    id: chapter2BackgroundIds.tailQuarter,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Tail Quarter',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/tail-quarter.png',
  },
  [chapter2BackgroundIds.courtAntechamber]: {
    id: chapter2BackgroundIds.courtAntechamber,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Court Antechamber',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/court-antechamber.png',
  },
  [chapter2BackgroundIds.brokerStall]: {
    id: chapter2BackgroundIds.brokerStall,
    kind: 'background',
    chapterId: 'chapter-2',
    label: 'Broker Stall',
    sourcePath: 'src/content/chapters/chapter-2/images/backgrounds/hugen-um/broker-stall.png',
  },
  [chapter2PortraitIds.registrarVey.stern]: {
    id: chapter2PortraitIds.registrarVey.stern,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Registrar Vey Stern',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/registrar-vey/stern.png',
  },
  [chapter2PortraitIds.registrarVey.professional]: {
    id: chapter2PortraitIds.registrarVey.professional,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Registrar Vey Professional',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/registrar-vey/professional.png',
  },
  [chapter2PortraitIds.brokerNena.sharp]: {
    id: chapter2PortraitIds.brokerNena.sharp,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Broker Nena Sharp',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/broker-nena/sharp.png',
  },
  [chapter2PortraitIds.brokerNena.soft]: {
    id: chapter2PortraitIds.brokerNena.soft,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Broker Nena Soft',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/broker-nena/soft.png',
  },
  [chapter2PortraitIds.brokerNena.mocking]: {
    id: chapter2PortraitIds.brokerNena.mocking,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Broker Nena Mocking',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/broker-nena/mocking.png',
  },
  [chapter2PortraitIds.matronIoma.tired]: {
    id: chapter2PortraitIds.matronIoma.tired,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Matron Ioma Tired',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/matron-ioma/tired.png',
  },
  [chapter2PortraitIds.matronIoma.calm]: {
    id: chapter2PortraitIds.matronIoma.calm,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Matron Ioma Calm',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/matron-ioma/calm.png',
  },
  [chapter2PortraitIds.matronIoma.hard]: {
    id: chapter2PortraitIds.matronIoma.hard,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Matron Ioma Hard',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/matron-ioma/hard.png',
  },
  [chapter2PortraitIds.tailKeeperRusk.grim]: {
    id: chapter2PortraitIds.tailKeeperRusk.grim,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Tail Keeper Rusk Grim',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/tail-keeper-rusk/grim.png',
  },
  [chapter2PortraitIds.tailKeeperRusk.neutral]: {
    id: chapter2PortraitIds.tailKeeperRusk.neutral,
    kind: 'portrait',
    chapterId: 'chapter-2',
    label: 'Tail Keeper Rusk Neutral',
    sourcePath: 'src/content/chapters/chapter-2/images/portraits/tail-keeper-rusk/neutral.png',
  },
  [chapter2MusicIds.cityPressure]: {
    id: chapter2MusicIds.cityPressure,
    kind: 'music',
    chapterId: 'chapter-2',
    label: 'City Pressure',
    sourcePath: 'src/content/chapters/chapter-2/music/city-pressure.ogg',
  },
  [chapter2MusicIds.ledgerBreath]: {
    id: chapter2MusicIds.ledgerBreath,
    kind: 'music',
    chapterId: 'chapter-2',
    label: 'Ledger Breath',
    sourcePath: 'src/content/chapters/chapter-2/music/ledger-breath.ogg',
  },
  [chapter2SfxIds.registryStamp]: {
    id: chapter2SfxIds.registryStamp,
    kind: 'sfx',
    chapterId: 'chapter-2',
    label: 'Registry Stamp',
    sourcePath: 'src/content/chapters/chapter-2/sfx/registry-stamp.ogg',
  },
  [chapter2SfxIds.chainGate]: {
    id: chapter2SfxIds.chainGate,
    kind: 'sfx',
    chapterId: 'chapter-2',
    label: 'Chain Gate',
    sourcePath: 'src/content/chapters/chapter-2/sfx/chain-gate.ogg',
  },
};
