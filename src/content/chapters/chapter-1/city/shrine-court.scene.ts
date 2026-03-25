import type { CitySceneData } from '@engine/types/city';

export const chapter1ShrineCourtScene: CitySceneData = {
  id: 'chapter-1/city/shrine-court',
  chapterId: 'chapter-1',
  cityId: 'ashen-reach',
  cityName: 'Ashen Reach',
  locationName: 'Shrine Court',
  districtLabel: 'Temple Quarter',
  statusLabel: 'recovery point',
  description: 'A dim court of brass bowls and pale incense where people come to steady themselves.',
  backgroundId: 'chapter-1/backgrounds/shrine-court.webp',
  actions: [
    {
      id: 'rest-briefly',
      text: 'Затриматися біля теплого світла',
      description: 'Зібрати думки, перевести подих і трохи відновитися.',
      tone: 'recovery',
      once: true,
      effects: [
        {
          type: 'restoreResource',
          resource: 'hp',
          amount: 10,
          targetScope: 'party',
        },
        {
          type: 'restoreResource',
          resource: 'mana',
          amount: 6,
          targetScope: 'party',
        },
        {
          type: 'changeMeta',
          key: 'morale',
          delta: 1,
        },
      ],
    },
    {
      id: 'study-icons',
      text: 'Роздивитися ікони й знаки',
      description: 'Старі культи тут ще відчуваються, навіть якщо місто робить вигляд, що ні.',
      tone: 'cult',
      once: true,
      effects: [
        {
          type: 'setFlag',
          flagId: 'chapter1.city.shrineIconsStudied',
          value: true,
        },
      ],
    },
    {
      id: 'return-plaza',
      text: 'Повернутися на площу',
      description: 'Знову вийти до брами й міського руху.',
      tone: 'neutral',
      nextSceneId: 'chapter-1/city/temple-exit',
    },
  ],
};
