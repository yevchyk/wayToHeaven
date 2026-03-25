import type { CitySceneData } from '@engine/types/city';

export const chapter1SiltBarScene: CitySceneData = {
  id: 'chapter-1/city/silt-bar',
  chapterId: 'chapter-1',
  cityId: 'ashen-reach',
  cityName: 'Ashen Reach',
  locationName: 'Silt Bar',
  districtLabel: 'Riverside Quarter',
  statusLabel: 'social den',
  description: 'A low bar where river soot clings to coats and every table bargains for something.',
  backgroundId: 'chapter-1/backgrounds/silt-bar.webp',
  actions: [
    {
      id: 'take-breath',
      text: 'Перепочити за тихим столом',
      description: 'Ненадовго скинути напругу, поки місто гуде за стінами.',
      tone: 'social',
      once: true,
      effects: [
        {
          type: 'changeMeta',
          key: 'morale',
          delta: 1,
        },
      ],
    },
    {
      id: 'watch-room',
      text: 'Придивитися до залу',
      description: 'Оцінити, хто тут просто пʼє, а хто вміє продавати інформацію.',
      tone: 'info',
      once: true,
      effects: [
        {
          type: 'setFlag',
          flagId: 'chapter1.city.siltBarWatched',
          value: true,
        },
      ],
    },
    {
      id: 'return-plaza',
      text: 'Повернутися на площу',
      description: 'Вийти назад у храмовий квартал.',
      tone: 'neutral',
      nextSceneId: 'chapter-1/city/temple-exit',
    },
  ],
};
