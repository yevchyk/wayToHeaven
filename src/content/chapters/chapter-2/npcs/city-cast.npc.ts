import type { NarrativeCharacterData } from '@engine/types/narrative';

import { chapter2PortraitIds } from '../assets';

const chapterId = 'chapter-2';

export const chapter2CityCastRegistry: Record<string, NarrativeCharacterData> = {
  'registrar-vey': {
    id: 'registrar-vey',
    chapterId,
    displayName: 'Реєстратор Вей',
    defaultEmotion: 'stern',
    defaultPortraitId: chapter2PortraitIds.registrarVey.stern,
    defaultSide: 'right',
    portraitRefs: {
      stern: chapter2PortraitIds.registrarVey.stern,
      professional: chapter2PortraitIds.registrarVey.professional,
    },
    description: 'Міський службовець, який перетворює людей на записи швидше, ніж на свідків.',
  },
  'broker-nena': {
    id: 'broker-nena',
    chapterId,
    displayName: 'Нена',
    defaultEmotion: 'sharp',
    defaultPortraitId: chapter2PortraitIds.brokerNena.sharp,
    defaultSide: 'left',
    portraitRefs: {
      sharp: chapter2PortraitIds.brokerNena.sharp,
      soft: chapter2PortraitIds.brokerNena.soft,
      mocking: chapter2PortraitIds.brokerNena.mocking,
    },
    description: 'Брокерка дрібних боргів, марок і незаписаних послуг біля сортувального двору.',
  },
  'matron-ioma': {
    id: 'matron-ioma',
    chapterId,
    displayName: 'Іома',
    defaultEmotion: 'tired',
    defaultPortraitId: chapter2PortraitIds.matronIoma.tired,
    defaultSide: 'left',
    portraitRefs: {
      tired: chapter2PortraitIds.matronIoma.tired,
      calm: chapter2PortraitIds.matronIoma.calm,
      hard: chapter2PortraitIds.matronIoma.hard,
    },
    description: 'Жінка, що керує першим притулком і знає ціну кожному додатковому місцю для сну.',
  },
  'tail-keeper-rusk': {
    id: 'tail-keeper-rusk',
    chapterId,
    displayName: 'Руск',
    defaultEmotion: 'grim',
    defaultPortraitId: chapter2PortraitIds.tailKeeperRusk.grim,
    defaultSide: 'right',
    portraitRefs: {
      grim: chapter2PortraitIds.tailKeeperRusk.grim,
      neutral: chapter2PortraitIds.tailKeeperRusk.neutral,
    },
    description: 'Провідник нижчого кварталу, який читає в людях не походження, а витривалість.',
  },
};
