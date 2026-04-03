import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

const caravanBackgrounds = {
  wagonWake: 'chapter-1/backgrounds/caravan/underground-wagon-wake.webp',
  rationStop: 'chapter-1/backgrounds/caravan/temporary-stop-ration-count.webp',
  campEvening: 'chapter-1/backgrounds/caravan/caravan-restfire-evening.webp',
  nightCamp: 'chapter-1/backgrounds/caravan/night-camp-dim.webp',
  morningCamp: 'chapter-1/backgrounds/caravan/morning-camp-gray.webp',
  merchantWagon: 'chapter-1/backgrounds/caravan/merchant-wagon-side.webp',
  mutantTail: 'chapter-1/backgrounds/caravan/mutant-tail-edge.webp',
  blackWater: 'chapter-1/backgrounds/caravan/black-water-ledge.webp',
  rumorCamp: 'chapter-1/backgrounds/caravan/mid-camp-whispers.webp',
  saltPass: 'chapter-1/backgrounds/caravan/salt-pass-narrow.webp',
  ambush: 'chapter-1/backgrounds/caravan/tract-ambush-break.webp',
  afterAmbush: 'chapter-1/backgrounds/caravan/post-ambush-smoke.webp',
  hugenUm: 'chapter-1/backgrounds/caravan/first-view-hugen-um-far.webp',
} as const;

const caravanMusic = {
  underRoad: 'chapter-1/music/under-road.ogg',
  nightWithoutRoof: 'chapter-1/music/night-without-roof.ogg',
  blackWater: 'chapter-1/music/black-water.ogg',
  stoneTeeth: 'chapter-1/music/stone-teeth.ogg',
  ambushBreak: 'chapter-1/music/ambush-break.ogg',
  afterAmbushAsh: 'chapter-1/music/after-ambush-ash.ogg',
  deadCapitalBreathes: 'chapter-1/music/dead-capital-breathes.ogg',
} as const;

export const chapter1CaravanToHugenUmSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/caravan-to-hugen-um',
  schemaVersion: 1,
  title: 'Арка — Караван до Гуген-Уму',
  meta: {
    chapterId: 'chapter-1',
    language: 'uk',
    notes:
      'Canonical authored transfer of the caravan arc. The caravan follows the underground aftermath and becomes the first long-form survival route toward Hugen-Um.',
    defaultBackgroundId: caravanBackgrounds.wagonWake,
    defaultMusicId: caravanMusic.underRoad,
    defaultStage: {
      characters: [
        {
          speakerId: 'mirella',
          emotion: 'hurt',
          outfitId: 'dress-ripped',
        },
      ],
      focusCharacterId: 'mirella',
    },
  },
  scenes: {
    'chapter-1/scene/caravan-to-hugen-um': {
      id: 'chapter-1/scene/caravan-to-hugen-um',
      mode: 'sequence',
      title: 'Караван до Гуген-Уму',
      description: 'The first waking inside the caravan and the collapse of noble distance into road logic.',
      startNodeId: 'caravan-001',
      backgroundId: caravanBackgrounds.wagonWake,
      music: {
        action: 'play',
        musicId: caravanMusic.underRoad,
        fadeMs: 900,
        loop: true,
      },
      stage: {
        characters: [
          {
            speakerId: 'mirella',
            emotion: 'hurt',
            outfitId: 'dress-ripped',
          },
        ],
        focusCharacterId: 'mirella',
      },
      nodes: {
        'caravan-001': {
          id: 'caravan-001',
          type: 'narration',
          title: 'Перед темрявою',
          text:
            'Темрява не прийшла як сон. Вона прийшла як чужа сила, що вимикає тіло раніше, ніж розум встигає зібрати уламки події. Мірелла запам’ятала лише окремі речі: камінь під коліном, чийсь крик, різкий присмак диму й велику тінь, що закрила собою і без того вузький світ.',
          onEnterEffects: [
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-ripped',
            },
            {
              type: 'setFlag',
              flagId: 'chapter1.caravan.entered',
              value: true,
            },
            {
              type: 'setFlag',
              flagId: 'story.day',
              value: 1,
            },
            {
              type: 'setFlag',
              flagId: 'story.timeSegment',
              value: 'Надвечір',
            },
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: 5,
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: 4,
            },
            {
              type: 'addQuest',
              questId: 'mq_survive',
            },
            {
              type: 'addQuest',
              questId: 'mq_road_to_hugen_um',
            },
            {
              type: 'addQuest',
              questId: 'mq_what_are_you_to_caravan',
            },
          ],
          nextNodeId: 'caravan-002',
        },
        'caravan-002': {
          id: 'caravan-002',
          type: 'narration',
          title: 'Пробудження',
          text:
            'Прокидання боліло сильніше, ніж удар. Спершу Мірелла відчула мотузку на зап’ястках. Потім вагу власної голови. Потім бруд на шиї та грудях. І тільки тоді — рух. Віз гойдався повільно, важко, по нижньому тракту, де сама дорога була сирою й живою кліткою.',
          nextNodeId: 'caravan-003',
        },
        'caravan-003': {
          id: 'caravan-003',
          type: 'dialogue',
          speakerId: 'yarva',
          speakerSide: 'right',
          emotion: 'cold',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'hurt',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'yarva',
                emotion: 'cold',
              },
            ],
            focusCharacterId: 'yarva',
          },
          text: 'Прокинулась. Уже не вдома. І вже в дорозі до Гуген-Уму.',
          nextNodeId: 'caravan-004',
        },
        'caravan-004': {
          id: 'caravan-004',
          type: 'narration',
          text:
            'Назва осіла в повітрі як пил. Гуген-Ум. Не просто місто, а занепала столиця, куди стягується все, що не вмерло і не вигадало собі кращого місця. Ярва не прикрашала владу. Вона просто сказала правду: крок убік від каравану тут означає не свободу, а труп.',
          onEnterEffects: [
            {
              type: 'changeStat',
              key: 'will',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-005',
        },
        'caravan-005': {
          id: 'caravan-005',
          type: 'narration',
          text:
            'Формально Мірелла була заручницею. По суті ж її не тримали в окремій клітці не через милість, а через географію. Нижній тракт, сліпі проходи, провали, вода і темрява робили за караван всю роботу замка.',
          nextNodeId: 'caravan-006',
        },
        'caravan-006': {
          id: 'caravan-006',
          type: 'dialogue',
          title: 'Орма',
          speakerId: 'orma',
          speakerSide: 'left',
          emotion: 'serious',
          backgroundId: caravanBackgrounds.rationStop,
          stage: {
            characters: [
              {
                speakerId: 'orma',
                emotion: 'serious',
              },
              {
                speakerId: 'yarva',
                emotion: 'cold',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'orma',
          },
          text: 'Поки що витрата. Половинний пайок. І хай дякує, що її ще рахують людиною, а не зайвою вагою.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: -1,
            },
          ],
          nextNodeId: 'caravan-006-reaction-innocence',
        },
        'caravan-006-reaction-innocence': {
          id: 'caravan-006-reaction-innocence',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'innocence',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-006-reaction-humanity',
          },
          text:
            'Слова про "зайву вагу" вдарили гірше, ніж мотузка на руках. У старому житті приниження принаймні вдягали у форму. Тут його просто поклали поруч із пайком. Міреллу саме це лякало найбільше: світ уже говорив так, ніби з неї можна було зняти людську міру швидше, ніж бруд із обличчя.',
          nextNodeId: 'caravan-007',
        },
        'caravan-006-reaction-humanity': {
          id: 'caravan-006-reaction-humanity',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'humanity',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-006-reaction-disciplined',
          },
          text:
            'Найгіршим була не грубість Орми, а буденність сортування. Караван розкладав людей на користь, вагу, пайок і шанс пережити наступний день так само спокійно, як дім Торнів колись розкладав гостей за столом. Мірелла ще не звикла до світу, де людська межа коштує менше за мішок крупи.',
          nextNodeId: 'caravan-007',
        },
        'caravan-006-reaction-disciplined': {
          id: 'caravan-006-reaction-disciplined',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'will',
              value: 2,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-006-reaction-pragmatic',
          },
          text:
            'Вона проковтнула відповідь. Не тому, що прийняла правило, а тому, що дорога вже вчила простому: сперечатися треба лише там, де за спиною є сила. Це ще не було звичкою до нового світу. Лише першим швом, яким вона нашвидку зшивала власний шок.',
          nextNodeId: 'caravan-007',
        },
        'caravan-006-reaction-pragmatic': {
          id: 'caravan-006-reaction-pragmatic',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'pragmatism',
              value: 2,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-006-reaction-default',
          },
          text:
            'Розум одразу зробив те, чого не хотіло тіло: перетворив образу на арифметику. Половинний пайок. Низький статус. Тимчасова слабкість. Це пояснювало ситуацію, але не робило її менш брудною. Мірелла ще не жила за цими правилами. Вона лише зрозуміла, що світ навколо них уже давно живе.',
          nextNodeId: 'caravan-007',
        },
        'caravan-006-reaction-default': {
          id: 'caravan-006-reaction-default',
          type: 'narration',
          text:
            'Вона ще шукала в чужих словах хоча б натяк на тимчасовість, але караван говорив надто просто. Пайок. Облік. Користь. Зайва вага. Світ зняв зі зла будь-яку завісу і залишив сам побут. Мірелла ще не вміла дивитися на це без внутрішнього здригання.',
          nextNodeId: 'caravan-007',
        },
        'caravan-007': {
          id: 'caravan-007',
          type: 'narration',
          title: 'Лієна',
          backgroundId: caravanBackgrounds.campEvening,
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          stage: {
            characters: [
              {
                speakerId: 'liena',
                emotion: 'fragile',
              },
              {
                speakerId: 'salver',
                emotion: 'tired',
              },
              {
                speakerId: 'mirella',
                emotion: 'cold',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'liena',
          },
          text:
            'Біля другого вогню Мірелла побачила іншу жінку, яку зрозуміла з першого погляду. Лієна ще тримала спину так, ніби могла силою посадки повернути собі залу, яку вже замінив брудний привал. Вона помітила Міреллу і одразу зненавиділа той факт, що інша аристократка бачить її тут такою.',
          nextNodeId: 'caravan-008',
        },
        'caravan-008': {
          id: 'caravan-008',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'Що Мірелла робить із першим поглядом Лієни?',
          choices: [
            {
              id: 'caravan-008-soften',
              text: 'Відвести очі першою, ніби визнаючи право на залишок гідності.',
              tone: 'social',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'liena',
                  delta: 1,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_liena_do_not_look',
                },
              ],
              nextNodeId: 'caravan-009',
            },
            {
              id: 'caravan-008-hold',
              text: 'Не відводити очей. Нехай бачить, що падіння видно збоку.',
              tone: 'danger',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'liena',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_liena_do_not_look',
                },
              ],
              nextNodeId: 'caravan-009',
            },
            {
              id: 'caravan-008-salver',
              text: 'Не відповідати Лієні, а придивитися до її батька.',
              tone: 'neutral',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'salver',
                  delta: -1,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_salver_trading_daughter',
                },
              ],
              nextNodeId: 'caravan-009',
            },
          ],
        },
        'caravan-009': {
          id: 'caravan-009',
          type: 'dialogue',
          title: 'Тріс',
          speakerId: 'tris',
          speakerSide: 'right',
          emotion: 'cocky',
          stage: {
            characters: [
              {
                speakerId: 'tris',
                emotion: 'cocky',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'tris',
          },
          text: 'Ти довго не протягнеш, якщо ходитимеш із таким лицем. Вода коштує розмови. Мені нудно.',
          nextNodeId: 'caravan-010',
        },
        'caravan-010': {
          id: 'caravan-010',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'Як Мірелла відповідає Трісу?',
          choices: [
            {
              id: 'caravan-010-trade',
              text: 'Прийняти гру й купити воду словами.',
              tone: 'social',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'tris',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-011',
            },
            {
              id: 'caravan-010-refuse',
              text: 'Не брати воду й не грати в його правила.',
              tone: 'duty',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'tris',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-011',
            },
            {
              id: 'caravan-010-control',
              text: 'Взяти воду, але дати зрозуміти, що борг запам’ятано.',
              tone: 'neutral',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'tris',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-011',
            },
          ],
        },
        'caravan-011': {
          id: 'caravan-011',
          type: 'narration',
          title: 'Перша ніч',
          backgroundId: caravanBackgrounds.nightCamp,
          music: {
            action: 'switch',
            musicId: caravanMusic.nightWithoutRoof,
            fadeMs: 800,
            loop: true,
          },
          text:
            'Перша ніч у каравані швидко пояснила правила. Біля вогню пили, сварилися за їжу й воду, а слабких обговорювали як витрату. Небезпека була не тільки в темряві за табором, а й усередині самого каравану, де Міреллу вже придивлялися не як до людини, а як до тягаря, який можна використати.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: -1,
            },
            {
              type: 'changeStat',
              key: 'paranoia',
              delta: 1,
            },
            {
              type: 'setFlag',
              flagId: 'story.day',
              value: 2,
            },
            {
              type: 'setFlag',
              flagId: 'story.timeSegment',
              value: 'Ранок',
            },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um/day-2',
        },
      },
    },
    'chapter-1/scene/caravan-to-hugen-um/day-2': {
      id: 'chapter-1/scene/caravan-to-hugen-um/day-2',
      mode: 'sequence',
      title: 'Другий день',
      description: 'The caravan begins to sort Mirella into a usable social category.',
      startNodeId: 'caravan-day2-001',
      backgroundId: caravanBackgrounds.morningCamp,
      music: {
        action: 'switch',
        musicId: caravanMusic.underRoad,
        fadeMs: 700,
        loop: true,
      },
      nodes: {
        'caravan-day2-001': {
          id: 'caravan-day2-001',
          type: 'dialogue',
          speakerId: 'yarva',
          speakerSide: 'right',
          emotion: 'serious',
          stage: {
            characters: [
              {
                speakerId: 'yarva',
                emotion: 'serious',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'yarva',
          },
          text: 'У тебе три дні. Або караван звикне, що ти не тільки їси. Або тебе почнуть вирішувати інші.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_yarva_not_burden',
            },
          ],
          nextNodeId: 'caravan-day2-002',
        },
        'caravan-day2-002': {
          id: 'caravan-day2-002',
          type: 'narration',
          title: 'Рашек',
          text:
            'Рашек не кликав її окремо. Він просто допустив, щоб вона опинилася досить близько й почула головне: питання не в тому, чи вона втече, а в тому, чим саме вона буде для каравану.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_rashek_before_tract',
            },
            {
              type: 'advanceQuest',
              questId: 'mq_road_to_hugen_um',
              delta: 15,
            },
          ],
          nextNodeId: 'caravan-day2-003',
        },
        'caravan-day2-003': {
          id: 'caravan-day2-003',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'На що Мірелла витрачає свій перший повноцінний денний сегмент?',
          choices: [
            {
              id: 'caravan-day2-003-yarva',
              text: 'Піти за Ярвою і доводити корисність роботою.',
              tone: 'duty',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'yarva',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-day2-004',
            },
            {
              id: 'caravan-day2-003-khazruk',
              text: 'Знайти Хазрука й подивитися, що він бачить у ній.',
              tone: 'neutral',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'khazruk',
                  delta: 1,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_khazruk_unwritten',
                },
                {
                  type: 'addQuest',
                  questId: 'cq_khazruk_pretty_for_filth',
                },
                {
                  type: 'addQuest',
                  questId: 'cq_khazruk_invest',
                },
              ],
              nextNodeId: 'caravan-day2-005',
            },
            {
              id: 'caravan-day2-003-tail',
              text: 'Піти за Трісом і зайти туди, куди форму не водять.',
              tone: 'social',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'tris',
                  delta: 1,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_tail_entry',
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-day2-006',
            },
          ],
        },
        'caravan-day2-004': {
          id: 'caravan-day2-004',
          type: 'narration',
          text:
            'Ярва поставила її не на героїку, а на тупу брудну роботу між возами під наглядом Орми. Саме так караван відрізняє корисних від тих, хто ще вважає себе надто добрим для виживання.',
          onEnterEffects: [
            {
              type: 'advanceQuest',
              questId: 'cq_yarva_not_burden',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-day2-007',
        },
        'caravan-day2-005': {
          id: 'caravan-day2-005',
          type: 'dialogue',
          speakerId: 'khazruk',
          speakerSide: 'right',
          emotion: 'amused',
          backgroundId: caravanBackgrounds.merchantWagon,
          stage: {
            characters: [
              {
                speakerId: 'khazruk',
                emotion: 'amused',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'khazruk',
          },
          text: 'Навіть пил не зміг одразу зіпсувати тебе повністю. Це вже щось, у що можна вкластися.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'badReputation',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-day2-007',
        },
        'caravan-day2-006': {
          id: 'caravan-day2-006',
          type: 'narration',
          backgroundId: caravanBackgrounds.mutantTail,
          stage: {
            characters: [
              {
                speakerId: 'nadra',
                emotion: 'guarded',
              },
              {
                speakerId: 'krivozub',
                emotion: 'mocking',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'nadra',
          },
          text:
            'Мутантський хвіст не стояв табором як рівна частина каравану. Він тулився позаду, напівдопущений, напіввигнаний. Надра мовчки показала практику виживання краю. Кривозуб засміявся першим, щоб ніхто інший не зробив це за нього.',
          onEnterEffects: [
            {
              type: 'changeRelationship',
              key: 'nadra',
              delta: 1,
            },
            {
              type: 'changeRelationship',
              key: 'krivozub',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-day2-007',
        },
        'caravan-day2-007': {
          id: 'caravan-day2-007',
          type: 'narration',
          title: 'Перша ніч Ярви',
          backgroundId: caravanBackgrounds.nightCamp,
          music: {
            action: 'switch',
            musicId: caravanMusic.nightWithoutRoof,
            fadeMs: 700,
            loop: true,
          },
          text:
            'Ярва знайшла її вже після темряви. Перша перевірка була простою в описі й бридко правильною в суті: стояти біля мотузок, запасів і мішків, не спати, не панікувати і не давати ночі з’їсти рештки власної форми.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_yarva_three_nights',
            },
            {
              type: 'advanceQuest',
              questId: 'cq_yarva_three_nights',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: -1,
            },
            {
              type: 'changeStat',
              key: 'paranoia',
              delta: 1,
            },
            {
              type: 'setFlag',
              flagId: 'story.day',
              value: 3,
            },
            {
              type: 'setFlag',
              flagId: 'story.timeSegment',
              value: 'Ранок',
            },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um/black-water',
        },
      },
    },
    'chapter-1/scene/caravan-to-hugen-um/black-water': {
      id: 'chapter-1/scene/caravan-to-hugen-um/black-water',
      mode: 'sequence',
      title: 'Чорна вода',
      description: 'The tail, fishing, rumor, and the first explicit descent into lower survival logic.',
      startNodeId: 'caravan-black-001',
      backgroundId: caravanBackgrounds.blackWater,
      music: {
        action: 'switch',
        musicId: caravanMusic.blackWater,
        fadeMs: 750,
        loop: true,
      },
      nodes: {
        'caravan-black-001': {
          id: 'caravan-black-001',
          type: 'narration',
          text:
            'На третій день караван ішов ближче до підземної води. Якщо Мірелла вже заходила в хвіст, Надра сама знайшла її. Якщо ні, Тріс усе одно привів до того самого уступу: способу не так швидко здохнути від голоду.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_black_water',
            },
            {
              type: 'setFlag',
              flagId: 'chapter1.system.fishingUnlocked',
              value: true,
            },
            {
              type: 'advanceQuest',
              questId: 'mq_road_to_hugen_um',
              delta: 25,
            },
          ],
          nextNodeId: 'caravan-black-002',
        },
        'caravan-black-002': {
          id: 'caravan-black-002',
          type: 'dialogue',
          speakerId: 'nadra',
          speakerSide: 'left',
          emotion: 'serious',
          stage: {
            characters: [
              {
                speakerId: 'nadra',
                emotion: 'serious',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'nadra',
          },
          text: 'Тут не ловлять як на картинках. Тут беруть те, що ще не встигло вмерти.',
          nextNodeId: 'caravan-black-003',
        },
        'caravan-black-003': {
          id: 'caravan-black-003',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'Чи пробує Мірелла рибалити відразу?',
          choices: [
            {
              id: 'caravan-black-003-fish',
              text: 'Так. Голод важливіший за гордість.',
              tone: 'duty',
              effects: [
                {
                  type: 'advanceQuest',
                  questId: 'cq_black_water',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'hunger',
                  delta: -1,
                },
              ],
              nextNodeId: 'caravan-black-004',
            },
            {
              id: 'caravan-black-003-watch',
              text: 'Спершу дивитися, як це робить Надра.',
              tone: 'social',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'nadra',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-black-004',
            },
            {
              id: 'caravan-black-003-refuse',
              text: 'Відмовитися зараз і піти з відчуттям власної межі.',
              tone: 'danger',
              effects: [
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'hunger',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-black-004',
            },
          ],
        },
        'caravan-black-004': {
          id: 'caravan-black-004',
          type: 'narration',
          title: 'Те, що плаває не мертвим',
          stage: {
            characters: [
              {
                speakerId: 'krivozub',
                emotion: 'amused',
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'krivozub',
          },
          text:
            'Чорна вода віддала не просто рибу. На камінь витяглося щось між предметом і знаком: кістяний уламок або фрагмент чужої прикраси з насічками, старими довше за саму дорогу. Не все в цій воді забуте.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_not_dead_floating',
            },
            {
              type: 'advanceQuest',
              questId: 'cq_black_water',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-black-005',
        },
        'caravan-black-005': {
          id: 'caravan-black-005',
          type: 'narration',
          title: 'Батько, що торгується',
          text:
            'Пізніше того ж дня Мірелла чує Салвера. Він говорить не злодійським шепотом, а страшною втомленою раціональністю: Лієна для нього стає не тільки донькою, а шансом конвертувати живу цінність у кілька додаткових днів.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_salver_trading_daughter',
            },
            {
              type: 'changeRelationship',
              key: 'salver',
              delta: -1,
            },
          ],
          nextNodeId: 'caravan-black-006',
        },
        'caravan-black-006': {
          id: 'caravan-black-006',
          type: 'dialogue',
          title: 'Чутка до вечора',
          speakerId: 'sivra',
          speakerSide: 'left',
          emotion: 'careful',
          backgroundId: caravanBackgrounds.rumorCamp,
          stage: {
            characters: [
              {
                speakerId: 'sivra',
                emotion: 'careful',
              },
              {
                speakerId: 'mirella',
                emotion: 'cold',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'sivra',
          },
          text: 'До вечора караван має вірити в одну з двох версій. Я не кажу, яку. Я дивлюся, яку ти зробиш кориснішою.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_rumor_by_evening',
            },
            {
              type: 'addQuest',
              questId: 'cq_not_like_others',
            },
          ],
          nextNodeId: 'caravan-black-007',
        },
        'caravan-black-007': {
          id: 'caravan-black-007',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'Що Мірелла робить із чужою підозрою?',
          choices: [
            {
              id: 'caravan-black-007-tail',
              text: 'Підштовхнути чутку в бік хвоста. Там і так звикли нести чуже.',
              tone: 'danger',
              effects: [
                {
                  type: 'changeStat',
                  key: 'corruption',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'sivra',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-black-008',
            },
            {
              id: 'caravan-black-007-protect',
              text: 'Спробувати загасити натовп і не дати йому народити зручну жертву.',
              tone: 'duty',
              effects: [
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'sivra',
                  delta: -1,
                },
                {
                  type: 'changeRelationship',
                  key: 'yarva',
                  delta: -1,
                },
              ],
              nextNodeId: 'caravan-black-008',
            },
            {
              id: 'caravan-black-007-silent',
              text: 'Нічого не робити й дозволити системі з’їсти когось без тебе.',
              tone: 'neutral',
              effects: [
                {
                  type: 'changeStat',
                  key: 'paranoia',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-black-008',
            },
          ],
        },
        'caravan-black-008': {
          id: 'caravan-black-008',
          type: 'narration',
          title: 'Сукня для їжі',
          text:
            'Пропозиція приходить саме тоді, коли голод починає говорити через тіло. Один із людей Хазрука пояснює її майже ділово: чистіше місце біля вогню, додатковий шматок сушеного м’яса, трохи захисту від нічних рук. Взамін караван хоче не всю її одразу, а право звикнути, що її форма, голос, усмішка і слухняна присутність теж можуть входити в пайок.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_dress_for_food',
            },
          ],
          nextNodeId: 'caravan-black-008-reaction-innocence',
        },
        'caravan-black-008-reaction-innocence': {
          id: 'caravan-black-008-reaction-innocence',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'innocence',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-black-008-reaction-honor',
          },
          text:
            'Її пересмикнуло не тільки від самої пропозиції, а від діловитості тону. Наче світ давно вирішив, що жіноча присутність теж входить до складу обозу. Мірелла ще не встигла відучитися від простого внутрішнього жесту: тут мало б існувати слово "не можна". Караван такого слова не визнавав.',
          nextNodeId: 'caravan-black-009',
        },
        'caravan-black-008-reaction-honor': {
          id: 'caravan-black-008-reaction-honor',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'honor',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-black-008-reaction-pragmatic',
          },
          text:
            'Найбільше вона вчепилася не за вигоду й не за страх, а за саму межу. Якщо віддати навіть спосіб стояти, дивитися і мовчати, що тоді ще залишиться її власним? Світ тиснув грубо, але Мірелла поки що відчувала межу як живий нерв, а не як стару казку про честь.',
          nextNodeId: 'caravan-black-009',
        },
        'caravan-black-008-reaction-pragmatic': {
          id: 'caravan-black-008-reaction-pragmatic',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'pragmatism',
              value: 2,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-black-008-reaction-paranoia',
          },
          text:
            'Розум одразу розклав усе по полицях: трохи їжі, трохи тепла, трохи захисту в обмін на борг, який завтра подадуть як природний стан. Огиду це не зняло. Лише зробило її рахунком. Мірелла ще не була людиною цього світу, але вже бачила його арифметику надто ясно.',
          nextNodeId: 'caravan-black-009',
        },
        'caravan-black-008-reaction-paranoia': {
          id: 'caravan-black-008-reaction-paranoia',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'paranoia',
              value: 2,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-black-008-reaction-default',
          },
          text:
            'Найгіршою була навіть не сама угода, а її очевидне продовження. Раз дозволила, значить хтось вирішить, що можна ще. І ще. Караван рідко зупинявся на першому приниженні. Страх уже вмів підказувати це швидше, ніж гордість знаходила слова.',
          nextNodeId: 'caravan-black-009',
        },
        'caravan-black-008-reaction-default': {
          id: 'caravan-black-008-reaction-default',
          type: 'narration',
          text:
            'Пропозиція вдарила саме тому, що була сказана без злості. Караван не бачив тут нічого виняткового. Мірелла ще бачила. Саме цей розрив між її внутрішнім "це занадто" і чужим побутовим тоном був найпринизливішою частиною дороги.',
          nextNodeId: 'caravan-black-009',
        },
        'caravan-black-009': {
          id: 'caravan-black-009',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text: 'Межа ще не зникла. Але тут за неї вже торгуються відкрито.',
          choices: [
            {
              id: 'caravan-black-009-accept',
              text: 'Прийняти брудну угоду і пережити ще один день трохи легше.',
              tone: 'danger',
              effects: [
                {
                  type: 'changeMeta',
                  key: 'hunger',
                  delta: -1,
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'corruption',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'khazruk',
                  delta: 1,
                },
              ],
              nextNodeId: 'caravan-black-010',
            },
            {
              id: 'caravan-black-009-refuse',
              text: 'Відмовитися й залишити собі бодай цю межу.',
              tone: 'duty',
              effects: [
                {
                  type: 'changeMeta',
                  key: 'hunger',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'khazruk',
                  delta: -1,
                },
              ],
              nextNodeId: 'caravan-black-010',
            },
          ],
        },
        'caravan-black-010': {
          id: 'caravan-black-010',
          type: 'narration',
          title: 'Друга ніч Ярви',
          backgroundId: caravanBackgrounds.nightCamp,
          music: {
            action: 'switch',
            musicId: caravanMusic.nightWithoutRoof,
            fadeMs: 700,
            loop: true,
          },
          text:
            'Друга ніч Ярви була гіршою, бо в ній уже не було новизни. Не правда і не брехня ставали головним, а результат, який переживе ніч і не розсипле табір до ранку. Ярва не вчила жорстокості. Вона вчила життєздатності в системі, де жорстокість уже давно стала побутом.',
          onEnterEffects: [
            {
              type: 'advanceQuest',
              questId: 'cq_yarva_three_nights',
              delta: 1,
            },
            {
              type: 'changeStat',
              key: 'paranoia',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: -1,
            },
            {
              type: 'setFlag',
              flagId: 'story.day',
              value: 4,
            },
            {
              type: 'setFlag',
              flagId: 'story.timeSegment',
              value: 'День',
            },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um/salt-pass',
        },
      },
    },
    'chapter-1/scene/caravan-to-hugen-um/salt-pass': {
      id: 'chapter-1/scene/caravan-to-hugen-um/salt-pass',
      mode: 'sequence',
      title: 'Соляний прохід',
      description: 'The road narrows into battle, exhaustion, and exposed hierarchy.',
      startNodeId: 'caravan-salt-001',
      backgroundId: caravanBackgrounds.saltPass,
      music: {
        action: 'switch',
        musicId: caravanMusic.stoneTeeth,
        fadeMs: 700,
        loop: true,
      },
      nodes: {
        'caravan-salt-001': {
          id: 'caravan-salt-001',
          type: 'narration',
          text:
            'Четвертий і п’ятий дні зливаються в дорогу, де камінь має зуби. Соляний прохід стискає караван, робить його повільнішим, шумнішим і вразливішим — саме таким, яким люблять бачити дорогу ті, хто вміє бити в слабкі місця маршруту.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_salt_pass',
            },
            {
              type: 'advanceQuest',
              questId: 'mq_road_to_hugen_um',
              delta: 25,
            },
          ],
          nextNodeId: 'caravan-salt-002',
        },
        'caravan-salt-002': {
          id: 'caravan-salt-002',
          type: 'narration',
          text:
            'Тут бойова система нового життя перестає бути абстракцією. Сила, спритність, виснаження, набута безпека і чужа пам’ять про тебе раптом стають не системними словами, а тілесним фактом.',
          onEnterEffects: [
            {
              type: 'startBattle',
              battleTemplateId: 'caravan-salt-pass-battle',
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: -1,
            },
          ],
          nextNodeId: 'caravan-salt-003',
        },
        'caravan-salt-003': {
          id: 'caravan-salt-003',
          conditions: [
            {
              type: 'flagEquals',
              flagId: 'chapter1.caravan.saltPassCleared',
              value: true,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-salt-003-loss',
          },
          type: 'narration',
          text:
            'Після проходу люди мовчать не з поваги, а з втоми. Але цього разу втома змішана з тим коротким, майже недовірливим визнанням, яке караван дозволяє тільки тим, хто не склався в камені. Корисність Мірелли вперше стає видимою навіть тим, хто вчора лише сміявся.',
          onEnterEffects: [
            {
              type: 'advanceQuest',
              questId: 'cq_yarva_not_burden',
              delta: 1,
            },
            {
              type: 'advanceQuest',
              questId: 'cq_rashek_before_tract',
              delta: 1,
            },
            {
              type: 'changeRelationship',
              key: 'yarva',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-salt-004',
        },
        'caravan-salt-003-loss': {
          id: 'caravan-salt-003-loss',
          type: 'narration',
          text:
            'Прохід пережили не так, як хотіли, а так, як вийшло. Камінь забрав сили, лад і частину впевненості. Після такого люди дивляться на тебе не як на корисну, а як на ще один ризик, який треба тягнути далі лише тому, що вже пізно щось міняти.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'badReputation',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: 1,
            },
            {
              type: 'changeRelationship',
              key: 'yarva',
              delta: -1,
            },
            {
              type: 'changeStat',
              key: 'paranoia',
              delta: 1,
            },
          ],
          nextNodeId: 'caravan-salt-004',
        },
        'caravan-salt-004': {
          id: 'caravan-salt-004',
          type: 'narration',
          title: 'Хтось із хвоста чув',
          text:
            'Ближче до виходу на прямий тракт хвіст поводиться інакше. Надра стає тихішою. Кривозуб жартує коротше. Хтось із задніх людей каже, що попереду «щось не так». Неясно, чи це чутка, нюх на засідку чи просто страх перед ширшим простором.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_voice_from_tail',
            },
          ],
          nextNodeId: 'caravan-salt-005',
        },
        'caravan-salt-005': {
          id: 'caravan-salt-005',
          type: 'narration',
          title: 'Перед прямим трактом',
          text:
            'Напруга стає іншою: не табірною, а бойовою. Рашек стягує людей щільніше. Ярва коротшає в словах. Орма нервує через облік. Хазрук раптом береже деякі скрині надто явно. Перед трактом дорога перестає бути просто шляхом. Вона стає оголенням.',
          onEnterEffects: [
            {
              type: 'advanceQuest',
              questId: 'mq_road_to_hugen_um',
              delta: 25,
            },
          ],
          nextNodeId: 'caravan-salt-006',
        },
        'caravan-salt-006': {
          id: 'caravan-salt-006',
          type: 'narration',
          title: 'Засідка',
          backgroundId: caravanBackgrounds.ambush,
          music: {
            action: 'switch',
            musicId: caravanMusic.ambushBreak,
            fadeMs: 400,
            loop: true,
          },
          transition: {
            type: 'cut',
            durationMs: 250,
          },
          text:
            'Засідка не починається як випадковість. Вона б’є в ту мить, коли караван уже вийшов із захисної вузькості тунелів, але ще не розгорнувся у зовнішній простір. Перші удари йдуть не по товару, а по людях, що мають зламати стрій. Саме тут зводиться все: стосунки, безпека, погана слава, параноя, порча і вміння битися.',
          onEnterEffects: [
            {
              type: 'startBattle',
              battleTemplateId: 'caravan-ambush-battle',
            },
            {
              type: 'changeMeta',
              key: 'safety',
              delta: -1,
            },
          ],
          nextNodeId: 'caravan-salt-007',
        },
        'caravan-salt-007': {
          id: 'caravan-salt-007',
          conditions: [
            {
              type: 'flagEquals',
              flagId: 'chapter1.caravan.ambushWon',
              value: true,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-salt-007-loss',
          },
          type: 'narration',
          text:
            'Коли перший злам хаосу минає, стає видно просту річ: караван не розсипався. Його прорвали, налякали, надкусили, але не розчавили. Саме в такі хвилини пам’ятають, хто втримався, а хто шукав, ким прикритися.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'morale',
              delta: 1,
            },
            {
              type: 'changeRelationship',
              key: 'rashek',
              delta: 1,
            },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um/after-ambush',
        },
        'caravan-salt-007-loss': {
          id: 'caravan-salt-007-loss',
          type: 'narration',
          text:
            'Караван вистояв, але не зберіг форму. Частина возів надщерблена, частина людей дивиться одна на одну вже без залишку довіри. Після такого не тримаються разом з поваги. Тримаються разом лише тому, що поодинці помруть швидше.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'badReputation',
              delta: 1,
            },
            {
              type: 'changeStat',
              key: 'corruption',
              delta: 1,
            },
            {
              type: 'changeRelationship',
              key: 'rashek',
              delta: -1,
            },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um/after-ambush',
        },
      },
    },
    'chapter-1/scene/caravan-to-hugen-um/after-ambush': {
      id: 'chapter-1/scene/caravan-to-hugen-um/after-ambush',
      mode: 'sequence',
      title: 'Після засідки',
      description: 'The caravan survives as a damaged machine, and Hugen-Um finally appears on the horizon.',
      startNodeId: 'caravan-after-001',
      backgroundId: caravanBackgrounds.afterAmbush,
      music: {
        action: 'switch',
        musicId: caravanMusic.afterAmbushAsh,
        fadeMs: 800,
        loop: true,
      },
      nodes: {
        'caravan-after-001': {
          id: 'caravan-after-001',
          type: 'narration',
          text:
            'Після бою караван не мовчить повністю. Він лише змінює вид шуму. Замість дорожнього скрипу — стогони і кашель із кров’ю. Замість побутової лайки — короткі накази й швидкі рішення, кого перев’язувати, а кого просто відтягнути з проходу. Замість жартів про лордессу — швидкі погляди, якими люди перевіряють, хто ще стоїть, а хто вже став тягарем.',
          onEnterEffects: [
            {
              type: 'changeMeta',
              key: 'hunger',
              delta: 1,
            },
            {
              type: 'changeStat',
              key: 'paranoia',
              delta: 1,
            },
            {
              type: 'completeQuest',
              questId: 'cq_salt_pass',
            },
            {
              type: 'completeQuest',
              questId: 'cq_rashek_before_tract',
            },
          ],
          nextNodeId: 'caravan-after-002',
        },
        'caravan-after-002': {
          id: 'caravan-after-002',
          type: 'narration',
          text:
            'Найважливіше змінилося не навколо, а всередині. Мірелла вже знає, що таке пайок, якого не вистачає, безпека, яку треба заробляти, і приниження, яке не роблять красивим, бо ніхто тут не вважає це потрібним.',
          onEnterEffects: [
            {
              type: 'changeStat',
              key: 'will',
              delta: 1,
            },
            {
              type: 'changeStat',
              key: 'innocence',
              delta: -1,
            },
            {
              type: 'completeQuest',
              questId: 'cq_yarva_not_burden',
            },
          ],
          nextNodeId: 'caravan-after-002-reaction-innocence',
        },
        'caravan-after-002-reaction-innocence': {
          id: 'caravan-after-002-reaction-innocence',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'innocence',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-after-002-reaction-humanity',
          },
          text:
            'Попри все, всередині ще лишався шматок, який відмовлявся називати це нормою. Кров висихала на камені, люди вже ділили воду і перевіряли колеса, а її розум усе ще чіплявся за думку, що так жити не можна. Саме ця запізніла чистота і боліла найдужче.',
          nextNodeId: 'caravan-after-003',
        },
        'caravan-after-002-reaction-humanity': {
          id: 'caravan-after-002-reaction-humanity',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'humanity',
              value: 1,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-after-002-reaction-will',
          },
          text:
            'Найсильніше тримали не власні рани, а чужі обличчя, які надто швидко перетворилися на облік втрат. Комусь перев’язували руку. Комусь уже діставали запасний ремінь замість співчуття. Міреллу ще нудило від самої легкості цього переходу.',
          nextNodeId: 'caravan-after-003',
        },
        'caravan-after-002-reaction-will': {
          id: 'caravan-after-002-reaction-will',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'will',
              value: 3,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-after-002-reaction-paranoia',
          },
          text:
            'Вона зібрала себе докупи майже насильно. Це ще не означало, що світ став ближчим або зрозумілішим. Лише те, що розсипатися тепер дорожче, ніж мовчати. Витримка вчила не любити цей порядок, а не гинути в ньому раніше, ніж з’явиться наступний крок.',
          nextNodeId: 'caravan-after-003',
        },
        'caravan-after-002-reaction-paranoia': {
          id: 'caravan-after-002-reaction-paranoia',
          type: 'narration',
          conditions: [
            {
              type: 'statGte',
              key: 'paranoia',
              value: 2,
            },
          ],
          onConditionFail: {
            nextNodeId: 'caravan-after-002-reaction-default',
          },
          text:
            'Після засідки вона насамперед рахувала не мертвих, а кути, тіні й руки, що лишилися без діла. Страх навчився дивитися вперед швидше, ніж серце встигало відреагувати. Це ще не робило її своєю для дороги. Але дорога вже прописувалася в її тілі.',
          nextNodeId: 'caravan-after-003',
        },
        'caravan-after-002-reaction-default': {
          id: 'caravan-after-002-reaction-default',
          type: 'narration',
          text:
            'Караван рушив далі занадто швидко, ніби жорстокість була просто ще одним погодним станом дороги. Мірелла ще не вміла жити з такою швидкістю забування. Світ навколо неї вже вмів.',
          nextNodeId: 'caravan-after-003',
        },
        'caravan-after-003': {
          id: 'caravan-after-003',
          type: 'narration',
          title: 'Гуген-Ум попереду',
          backgroundId: caravanBackgrounds.hugenUm,
          music: {
            action: 'switch',
            musicId: caravanMusic.deadCapitalBreathes,
            fadeMs: 900,
            loop: true,
          },
          text:
            'Коли залишки каравану знову рушають, дорога вже інша. І в далекому прорізі кам’яної щілини вперше видно обриси того, куди їх тягнули весь цей час. Гуген-Ум. Не місто, що кличе. Не столиця, що прощає. Просто велике кам’яне тіло, в яке вже вросло надто багато бруду, торгу, насильства і чужих надій.',
          onEnterEffects: [
            {
              type: 'completeQuest',
              questId: 'mq_road_to_hugen_um',
            },
            {
              type: 'setFlag',
              flagId: 'caravan_arc.completed',
              value: true,
            },
            {
              type: 'setFlag',
              flagId: 'story.day',
              value: 6,
            },
            {
              type: 'setFlag',
              flagId: 'story.timeSegment',
              value: 'Надвечір',
            },
          ],
          nextNodeId: 'caravan-after-004',
        },
        'caravan-after-004': {
          id: 'caravan-after-004',
          type: 'narration',
          title: 'Кінець арки',
          text:
            'Караван не просто перевіз Міреллу до нової точки сюжету. Він не зробив її людиною цієї дороги, але зламав стару дистанцію і навчив, якою ціною тут купують ще один день. Стара форма вже не повернеться в колишньому вигляді. Попереду місто, яке перевірить не готову жорсткість, а те, що саме народжується з її решток.',
          isEnd: true,
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
