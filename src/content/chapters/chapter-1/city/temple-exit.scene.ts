import type { CitySceneData } from '@engine/types/city';

export const chapter1TempleExitScene: CitySceneData = {
  id: 'chapter-1/city/temple-exit',
  chapterId: 'chapter-1',
  cityId: 'ashen-reach',
  cityName: 'Ashen Reach',
  locationName: 'Temple Exit Plaza',
  districtLabel: 'Temple Quarter',
  statusLabel: 'neutral district',
  description: 'A soot-lit plaza where pilgrims, merchants, and wardens cross paths at the edge of the city.',
  backgroundId: 'chapter-1/backgrounds/temple-exit-plaza.webp',
  onEnterEffects: [
    {
      type: 'setFlag',
      flagId: 'chapter1.city.templeExitSeen',
      value: true,
    },
  ],
  actions: [
    {
      id: 'to-market',
      text: 'Піти на ринок',
      description: 'Тісні ряди лавок, де за харчі сперечаються голосніше, ніж моляться.',
      tone: 'reward',
      nextSceneId: 'chapter-1/city/market-lane',
    },
    {
      id: 'to-bar',
      text: 'Піти в бар',
      description: 'Напівтемний закуток для втомлених охоронців, курʼєрів і тих, хто не любить питань.',
      tone: 'social',
      nextSceneId: 'chapter-1/city/silt-bar',
    },
    {
      id: 'to-shrine',
      text: 'Відпочити біля святині',
      description: 'Трохи тиші й тепло ламп перед тим, як знову зануритися в шум кварталу.',
      tone: 'recovery',
      nextSceneId: 'chapter-1/city/shrine-court',
    },
    {
      id: 'talk-warden',
      text: 'Поговорити з охоронцем біля брами',
      description: 'Звичний guard check і кілька зайвих запитань про ваші наміри.',
      tone: 'info',
      dialogueId: 'intro-dialogue',
    },
    {
      id: 'survey-square',
      text: 'Оглянути площу',
      description: 'Побачити, хто торгує, хто стежить і хто надто уважно дивиться у відповідь.',
      tone: 'info',
      once: true,
      effects: [
        {
          type: 'setFlag',
          flagId: 'chapter1.city.templeExitSurveyed',
          value: true,
        },
        {
          type: 'changeMeta',
          key: 'reputation',
          delta: 1,
        },
      ],
    },
    {
      id: 'leave-city',
      text: 'Покинути місто через північну браму',
      description: 'Вийти на міську околицю й повернутися до зовнішніх маршрутів.',
      tone: 'travel',
      effects: [
        {
          type: 'changeLocation',
          locationId: 'pilgrim-road',
          nodeId: 'city-gate',
        },
      ],
    },
    {
      id: 'descend-underpass',
      text: 'Спуститися в підземний маршрут',
      description: 'Небезпечний шлях під кварталом, де місто закінчується й починається ризик.',
      tone: 'cult',
      travelBoardId: 'chapter-1/travel/underground-route',
    },
  ],
};
