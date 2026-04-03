import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1CityHubsSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/city-hubs',
  schemaVersion: 1,
  title: 'Ashen Reach City Hubs',
  meta: {
    chapterId: 'chapter-1',
  },
  scenes: {
    'chapter-1/city/temple-exit': {
      id: 'chapter-1/city/temple-exit',
      mode: 'hub',
      title: 'Temple Exit Plaza',
      description: 'A soot-lit plaza where pilgrims, merchants, and wardens cross paths at the edge of the city.',
      cityId: 'ashen-reach',
      cityName: 'Ashen Reach',
      locationName: 'Temple Exit Plaza',
      districtLabel: 'Temple Quarter',
      statusLabel: 'neutral district',
      backgroundId: 'chapter-1/backgrounds/temple-exit-plaza.webp',
      startNodeId: 'temple-exit',
      nodes: {
        'temple-exit': {
          id: 'temple-exit',
          type: 'choice',
          title: 'Temple Exit Plaza',
          text: 'A soot-lit plaza where pilgrims, merchants, and wardens cross paths at the edge of the city.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.city.templeExitSeen',
              value: true,
            },
          ],
          choices: [
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
              id: 'to-wayfarer-shelter',
              text: 'Піти за тихим знаком до паломницького сховку',
              description: 'Материн слід веде до вузького прихистку за святинею, де ще пам’ятають, як ховати тих, хто впав із видимого світу.',
              tone: 'social',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'chapter1.aftermath.motherThreadRemembered',
                  value: true,
                },
              ],
              nextSceneId: 'chapter-1/city/wayfarer-shelter',
            },
            {
              id: 'talk-warden',
              text: 'Поговорити з охоронцем біля брами',
              description: 'Звичний guard check і кілька зайвих запитань про ваші наміри.',
              tone: 'info',
              openSceneFlowId: 'chapter-1/scene/city-gate',
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
              openSceneFlowId: 'chapter-1/travel/underground-route',
            },
          ],
        },
      },
    },
    'chapter-1/city/wayfarer-shelter': {
      id: 'chapter-1/city/wayfarer-shelter',
      mode: 'hub',
      title: 'Wayfarer Shelter',
      description: 'A narrow shelter behind the shrine where temple servants keep blankets, road scraps, and favors that are never written down.',
      cityId: 'ashen-reach',
      cityName: 'Ashen Reach',
      locationName: 'Wayfarer Shelter',
      districtLabel: 'Temple Quarter',
      statusLabel: 'quiet refuge',
      backgroundId: 'chapter-1/backgrounds/shrine-court.webp',
      startNodeId: 'wayfarer-shelter',
      nodes: {
        'wayfarer-shelter': {
          id: 'wayfarer-shelter',
          type: 'choice',
          title: 'Wayfarer Shelter',
          text: 'A narrow shelter behind the shrine where the right knock still buys silence.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.city.wayfarerShelterSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'claim-pilgrim-seal',
              text: 'Попросити тиху печать проходу',
              description: 'Служка не ставить питань, тільки передає знак, який відкриває браму без зайвих слів.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'hasGatePass',
                  value: true,
                },
                {
                  type: 'giveItem',
                  itemId: 'pilgrim-seal',
                  quantity: 1,
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter1.city.wayfarerSealGranted',
                  value: true,
                },
              ],
            },
            {
              id: 'accept-road-bundle',
              text: 'Забрати дорожній згорток',
              description: 'Трохи сухої їжі й тиша, яка відчувається дорожчою за їжу.',
              tone: 'reward',
              once: true,
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'travel-ration',
                  quantity: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'morale',
                  delta: 1,
                },
              ],
            },
            {
              id: 'return-plaza',
              text: 'Повернутися на площу',
              description: 'Вийти назад до храмового виходу, уже маючи хоч трохи опори.',
              tone: 'neutral',
              nextSceneId: 'chapter-1/city/temple-exit',
            },
          ],
        },
      },
    },
    'chapter-1/city/market-lane': {
      id: 'chapter-1/city/market-lane',
      mode: 'hub',
      title: 'Market Lane',
      description: 'A corridor of lanterns, ration stalls, relic hawkers, and sharp-eyed fixers.',
      cityId: 'ashen-reach',
      cityName: 'Ashen Reach',
      locationName: 'Market Lane',
      districtLabel: 'Market Zone',
      statusLabel: 'crowded quarter',
      backgroundId: 'chapter-1/backgrounds/market-lane.webp',
      startNodeId: 'market-lane',
      nodes: {
        'market-lane': {
          id: 'market-lane',
          type: 'choice',
          title: 'Market Lane',
          text: 'A corridor of lanterns, ration stalls, relic hawkers, and sharp-eyed fixers.',
          choices: [
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
        },
      },
    },
    'chapter-1/city/silt-bar': {
      id: 'chapter-1/city/silt-bar',
      mode: 'hub',
      title: 'Silt Bar',
      description: 'A low bar where river soot clings to coats and every table bargains for something.',
      cityId: 'ashen-reach',
      cityName: 'Ashen Reach',
      locationName: 'Silt Bar',
      districtLabel: 'Riverside Quarter',
      statusLabel: 'social den',
      backgroundId: 'chapter-1/backgrounds/silt-bar.webp',
      startNodeId: 'silt-bar',
      nodes: {
        'silt-bar': {
          id: 'silt-bar',
          type: 'choice',
          title: 'Silt Bar',
          text: 'A low bar where river soot clings to coats and every table bargains for something.',
          choices: [
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
        },
      },
    },
    'chapter-1/city/shrine-court': {
      id: 'chapter-1/city/shrine-court',
      mode: 'hub',
      title: 'Shrine Court',
      description: 'A dim court of brass bowls and pale incense where people come to steady themselves.',
      cityId: 'ashen-reach',
      cityName: 'Ashen Reach',
      locationName: 'Shrine Court',
      districtLabel: 'Temple Quarter',
      statusLabel: 'recovery point',
      backgroundId: 'chapter-1/backgrounds/shrine-court.webp',
      startNodeId: 'shrine-court',
      nodes: {
        'shrine-court': {
          id: 'shrine-court',
          type: 'choice',
          title: 'Shrine Court',
          text: 'A dim court of brass bowls and pale incense where people come to steady themselves.',
          choices: [
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
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
