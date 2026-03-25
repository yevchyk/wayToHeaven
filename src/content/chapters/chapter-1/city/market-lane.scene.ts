import type { CitySceneData } from '@engine/types/city';

export const chapter1MarketLaneScene: CitySceneData = {
  id: 'chapter-1/city/market-lane',
  chapterId: 'chapter-1',
  cityId: 'ashen-reach',
  cityName: 'Ashen Reach',
  locationName: 'Market Lane',
  districtLabel: 'Market Zone',
  statusLabel: 'crowded quarter',
  description: 'A corridor of lanterns, ration stalls, relic hawkers, and sharp-eyed fixers.',
  backgroundId: 'chapter-1/backgrounds/market-lane.webp',
  actions: [
    {
      id: 'buy-rations',
      text: 'Виторгувати дорожній пайок',
      description: 'Сухо, дешево й досить добре, щоб не впасти в дорозі.',
      tone: 'reward',
      once: true,
      effects: [
        {
          type: 'giveItem',
          itemId: 'travel-ration',
          quantity: 1,
        },
      ],
    },
    {
      id: 'listen-rumors',
      text: 'Прислухатися до чуток',
      description: 'Торговці завжди знають, де дорога стає небезпечною раніше за охорону.',
      tone: 'info',
      once: true,
      effects: [
        {
          type: 'setFlag',
          flagId: 'chapter1.city.marketRumorsHeard',
          value: true,
        },
      ],
    },
    {
      id: 'return-plaza',
      text: 'Повернутися на площу',
      description: 'Назад до храмового виходу й основних доріг кварталу.',
      tone: 'neutral',
      nextSceneId: 'chapter-1/city/temple-exit',
    },
  ],
};
