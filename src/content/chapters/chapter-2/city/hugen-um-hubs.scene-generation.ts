import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import { chapter2BackgroundIds } from '../assets';

export const chapter2HugenUmHubsSceneGenerationDocument = {
  id: 'chapter-2/scene-generation/hugen-um-hubs',
  schemaVersion: 1,
  title: 'Глава II — Хаби Гуген-Уму',
  meta: {
    chapterId: 'chapter-2',
    language: 'uk',
  },
  scenes: {
    'chapter-2/city/sorting-yard': {
      id: 'chapter-2/city/sorting-yard',
      mode: 'hub',
      title: 'Сортувальний двір',
      description: 'The first urban choke point where arrivals are labeled, distributed, and quietly sold into routes.',
      cityId: 'hugen-um',
      cityName: 'Гуген-Ум',
      locationName: 'Сортувальний двір',
      districtLabel: 'Вхідний периметр',
      statusLabel: 'міська воронка',
      backgroundId: chapter2BackgroundIds.sortingYard,
      startNodeId: 'sorting-yard',
      nodes: {
        'sorting-yard': {
          id: 'sorting-yard',
          type: 'choice',
          title: 'Сортувальний двір',
          text: 'Камінь, списки, охорона і люди, яким уже пояснили, що місто любить порядок більше за милість.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.sortingYardSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'to-shelter',
              text: 'Піти під арку до першого притулку',
              description: 'Туди, де тілам дають ковдру не як милість, а як короткий аванс.',
              tone: 'recovery',
              nextSceneId: 'chapter-2/city/first-shelter',
            },
            {
              id: 'to-market',
              text: 'Втиснутися в ребра ринку',
              description: 'Побачити, як місто продає їжу, чутки, імена і дрібні шляхи обхідного життя.',
              tone: 'social',
              nextSceneId: 'chapter-2/city/market-ribs',
            },
            {
              id: 'to-tail',
              text: 'Спуститися в хвостовий квартал',
              description: 'Піти туди, де низ міста тримає власний рахунок корисності й непотребу.',
              tone: 'danger',
              nextSceneId: 'chapter-2/city/tail-quarter',
            },
            {
              id: 'to-court',
              text: 'Піти в судовий передпокій',
              description: 'Дізнатися, як місто закріплює за людьми вину, очікування і порядок.',
              tone: 'duty',
              nextSceneId: 'chapter-2/city/court-antechamber',
            },
            {
              id: 'first-deal',
              text: 'Прийняти першу міську пропозицію Нени',
              description: 'Зайти в гру дрібних боргів раніше, ніж місто саме вирішить, у що тебе вкладати.',
              tone: 'danger',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'chapter2.city.marketBrokerMet',
                  value: true,
                },
                {
                  type: 'flagEquals',
                  flagId: 'chapter2.city.firstDealClosed',
                  value: false,
                },
              ],
              openSceneFlowId: 'chapter-2/scene/first-deal',
            },
            {
              id: 'inspect-wall',
              text: 'Прочитати стіну оголошень і міток',
              description: 'Побачити, кого тут шукають, продають, рахують або вже списали.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.noticeWallRead',
                  value: true,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_sivra_rumor_chain',
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
              ],
            },
          ],
        },
      },
    },
    'chapter-2/city/first-shelter': {
      id: 'chapter-2/city/first-shelter',
      mode: 'hub',
      title: 'Перший притулок',
      description: 'A narrow civic shelter where warmth, blankets, and silence are all rationed.',
      cityId: 'hugen-um',
      cityName: 'Гуген-Ум',
      locationName: 'Перший притулок',
      districtLabel: 'Арковий сховок',
      statusLabel: 'умовна безпека',
      backgroundId: chapter2BackgroundIds.firstShelter,
      startNodeId: 'first-shelter',
      nodes: {
        'first-shelter': {
          id: 'first-shelter',
          type: 'choice',
          title: 'Перший притулок',
          text: 'Тут не питають, хто ти. Питають, чи залишиш після себе місце, воду і неприємності в прийнятній пропорції.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.firstShelterSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'claim-pallet',
              text: 'Вибороти вузьке місце під ковдру',
              description: 'Нічого героїчного. Просто шанс не спати на камені першої ж ночі.',
              tone: 'recovery',
              once: true,
              effects: [
                {
                  type: 'addQuest',
                  questId: 'cq_ioma_bed_without_name',
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'morale',
                  delta: 1,
                },
              ],
            },
            {
              id: 'listen-ioma',
              text: 'Вислухати правила Іоми',
              description: 'Зрозуміти, як притулок відсікає жалість і чому тут цінують не щирість, а функцію.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.iomaRulesHeard',
                  value: true,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'matron-ioma',
                  axis: 'trust',
                  delta: 1,
                },
              ],
            },
            {
              id: 'return-yard',
              text: 'Повернутися в сортувальний двір',
              description: 'Назад у головну воронку, де всі дороги міста спершу стають чужими.',
              tone: 'neutral',
              nextSceneId: 'chapter-2/city/sorting-yard',
            },
          ],
        },
      },
    },
    'chapter-2/city/market-ribs': {
      id: 'chapter-2/city/market-ribs',
      mode: 'hub',
      title: 'Ребра ринку',
      description: 'A pressed market corridor where food, rumor, cloth, and legal shortcuts trade places by the hour.',
      cityId: 'hugen-um',
      cityName: 'Гуген-Ум',
      locationName: 'Ребра ринку',
      districtLabel: 'Торгова складка',
      statusLabel: 'шумний вузол',
      backgroundId: chapter2BackgroundIds.marketRibs,
      startNodeId: 'market-ribs',
      nodes: {
        'market-ribs': {
          id: 'market-ribs',
          type: 'choice',
          title: 'Ребра ринку',
          text: 'Тут торг не приховує запаху зношеності. Навпаки, він ним дихає.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.marketSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'meet-nena',
              text: 'Прийняти погляд Нени, а не вдавати, що його не існує',
              description: 'Брокерка вже вибрала Міреллу оком. Тепер можна вибрати, чи відповідати.',
              tone: 'social',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.marketBrokerMet',
                  value: true,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_nena_first_deal',
                },
                {
                  type: 'advanceQuest',
                  questId: 'cq_nena_first_deal',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'broker-nena',
                  axis: 'trust',
                  delta: 1,
                },
              ],
            },
            {
              id: 'buy-broth',
              text: 'Виторгувати гарячу юшку',
              description: 'Не ситість. Просто коротке нагадування, що тіло все ще варте підтримки.',
              tone: 'reward',
              once: true,
              effects: [
                {
                  type: 'changeMeta',
                  key: 'hunger',
                  delta: -1,
                },
                {
                  type: 'changeMeta',
                  key: 'morale',
                  delta: 1,
                },
              ],
            },
            {
              id: 'listen-whispers',
              text: 'Зловити ринкові шепоти',
              description: 'Почути, як караванні чутки перебираються в міський облік і починають жити окремо.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'addQuest',
                  questId: 'cq_sivra_rumor_chain',
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.marketWhispersHeard',
                  value: true,
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
              ],
            },
            {
              id: 'return-yard',
              text: 'Повернутися в сортувальний двір',
              description: 'Назад туди, де ринок, суд і притулок все ще сходяться в одну шию міста.',
              tone: 'neutral',
              nextSceneId: 'chapter-2/city/sorting-yard',
            },
          ],
        },
      },
    },
    'chapter-2/city/tail-quarter': {
      id: 'chapter-2/city/tail-quarter',
      mode: 'hub',
      title: 'Хвостовий квартал',
      description: 'The lower quarter where the city keeps its tolerated excess, improvised labor, and unofficial survival.',
      cityId: 'hugen-um',
      cityName: 'Гуген-Ум',
      locationName: 'Хвостовий квартал',
      districtLabel: 'Нижчий хвіст',
      statusLabel: 'неофіційний низ',
      backgroundId: chapter2BackgroundIds.tailQuarter,
      startNodeId: 'tail-quarter',
      nodes: {
        'tail-quarter': {
          id: 'tail-quarter',
          type: 'choice',
          title: 'Хвостовий квартал',
          text: 'Тут місто перестає вдавати, що всіх можна вписати в одну форму. Саме тому воно так уважно дивиться, хто навчиться жити без неї.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.tailQuarterSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'speak-rusk',
              text: 'Поговорити з Руcком про правила низу',
              description: 'Визначити, чи читають тут Міреллу як випадкову панянку, чужий товар чи людину, яку ще можна використати.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'addQuest',
                  questId: 'cq_rusk_tail_entry',
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'tail-keeper-rusk',
                  axis: 'respect',
                  delta: 1,
                },
              ],
            },
            {
              id: 'ask-about-nadra',
              text: 'Спитати, чи Надра вже пустила коріння тут',
              description: 'Шукати не подругу, а вузол, через який караванний хвіст переходить у міський.',
              tone: 'social',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.nadraTrailOpened',
                  value: true,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'nadra',
                  axis: 'respect',
                  delta: 1,
                },
              ],
            },
            {
              id: 'return-yard',
              text: 'Повернутися в сортувальний двір',
              description: 'Знову піднятися туди, де місто вдає, ніби все ще керує кожним своїм низом.',
              tone: 'neutral',
              nextSceneId: 'chapter-2/city/sorting-yard',
            },
          ],
        },
      },
    },
    'chapter-2/city/court-antechamber': {
      id: 'chapter-2/city/court-antechamber',
      mode: 'hub',
      title: 'Судовий передпокій',
      description: 'A waiting chamber where silence, rank, and paperwork decide who may speak and who will simply be processed.',
      cityId: 'hugen-um',
      cityName: 'Гуген-Ум',
      locationName: 'Судовий передпокій',
      districtLabel: 'Адміністративний вузол',
      statusLabel: 'холодний порядок',
      backgroundId: chapter2BackgroundIds.courtAntechamber,
      startNodeId: 'court-antechamber',
      nodes: {
        'court-antechamber': {
          id: 'court-antechamber',
          type: 'choice',
          title: 'Судовий передпокій',
          text: 'Люди тут рідко підвищують голос. Не тому, що спокійні. А тому, що все важливе вже записане без них.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.courtSeen',
              value: true,
            },
          ],
          choices: [
            {
              id: 'read-tablets',
              text: 'Прочитати кам’яні таблиці черги',
              description: 'Подивитися, кого місто визнає справою, а кого просто тягне через процедуру.',
              tone: 'info',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.courtRulesSeen',
                  value: true,
                },
                {
                  type: 'advanceQuest',
                  questId: 'cq_vey_ledger_mark',
                  delta: 1,
                },
              ],
            },
            {
              id: 'submit-presence',
              text: 'Позначити свою присутність у черзі',
              description: 'Дати місту зрозуміти, що Мірелла не зникла з двору в тінь, а стоїть у його світлі навмисно.',
              tone: 'duty',
              once: true,
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.submittedToCourt',
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
              id: 'return-yard',
              text: 'Повернутися в сортувальний двір',
              description: 'Назад до простору, де рішення ще видають за вибір.',
              tone: 'neutral',
              nextSceneId: 'chapter-2/city/sorting-yard',
            },
          ],
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
