import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1IntroSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/intro',
  schemaVersion: 1,
  title: 'Пролог — Над містом, під землею',
  meta: {
    chapterId: 'chapter-1',
    defaultBackgroundId: 'chapter-1/backgrounds/mansion-dining-hall.webp',
    defaultMusicId: 'theme_estate',
  },
  scenes: {
    'chapter-1/scene/intro': {
      id: 'chapter-1/scene/intro',
      mode: 'sequence',
      title: 'Пролог — Над містом, під землею',
      description:
        'Breakfast above the city, capture below it, and the first contact with the force under the black river.',
      startNodeId: 'n1',
      nodes: {
        n1: {
          id: 'n1',
          type: 'narration',
          text:
            'Ранок у домі Торнів завжди починався красиво. Срібний посуд, тепле світло, гірське повітря за склом і місто далеко внизу — ніби весь світ лежав під їхнім столом. Мірелла сиділа тихо, відчуваючи, як тепло чаю розливається по тілу.',
          music: {
            action: 'play',
            musicId: 'theme_estate',
            fadeMs: 900,
            loop: true,
          },
          stage: {
            characters: [
              {
                speakerId: 'lady-sera',
                emotion: 'soft',
                portraitId: 'chapter-1/portraits/lady-sera/soft.webp',
              },
              {
                speakerId: 'mirella',
                emotion: 'neutral',
                outfitId: 'dress-pristine',
              },
              {
                speakerId: 'lord-guy',
                emotion: 'composed',
                portraitId: 'chapter-1/portraits/lord-guy/composed.webp',
              },
              {
                speakerId: 'kael',
                emotion: 'playful',
                portraitId: 'chapter-1/portraits/kael/playful.webp',
              },
              {
                speakerId: 'sir-raust',
                emotion: 'stern',
                portraitId: 'chapter-1/portraits/sir-raust/stern.webp',
              },
            ],
          },
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prologue.seen',
              value: true,
            },
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-pristine',
            },
          ],
          nextNodeId: 'n2',
        },
        n2: {
          id: 'n2',
          type: 'dialogue',
          speakerId: 'lord-guy',
          speakerSide: 'right',
          emotion: 'composed',
          text:
            'Шахта знову просіла по видобутку. А люди внизу чомусь завжди дивуються, коли за це карають.',
          nextNodeId: 'n3',
        },
        n3: {
          id: 'n3',
          type: 'dialogue',
          speakerId: 'sir-raust',
          speakerSide: 'left',
          emotion: 'stern',
          text:
            'Страх тримає дім лише доти, доки хтось сильніший не принесе свій. А магія просто знімає маску.',
          nextNodeId: 'n4',
        },
        n4: {
          id: 'n4',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'thinking',
          text:
            'Мірелла ковзнула поглядом між батьком і дядьком. Магія підсилює те, що вже є… то що вона підсилить у мені?',
          choices: [
            {
              id: 'n4_c1',
              text: 'Підтримати Рауста про честь.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'humanity',
                  delta: 1,
                },
              ],
              nextNodeId: 'n5',
            },
            {
              id: 'n4_c2',
              text: 'Підтримати батька про порядок.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n6',
            },
            {
              id: 'n4_c3',
              text: 'Промовчати.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'egoism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n7',
            },
          ],
        },
        n5: {
          id: 'n5',
          type: 'dialogue',
          speakerId: 'mirella',
          emotion: 'serious',
          text: 'Якщо дім тримається лише на страху, то це поганий дім.',
          nextNodeId: 'n82',
        },
        n6: {
          id: 'n6',
          type: 'dialogue',
          speakerId: 'mirella',
          emotion: 'polite',
          text: 'Без порядку все внизу давно б розсипалося.',
          nextNodeId: 'n82',
        },
        n7: {
          id: 'n7',
          type: 'narration',
          text:
            'Мірелла нічого не сказала. Але всередині вже заворушилося легке, майже приємне відчуття, що колись вона могла б змусити їх усіх мовчати.',
          nextNodeId: 'n82',
        },
        n82: {
          id: 'n82',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'shocked',
          text: 'Коли все зламалося, часу на думку лишилося рівно стільки, щоб зробити один імпульсивний вибір.',
          choices: [
            {
              id: 'n82_c1',
              text: 'Кинутися до матері.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'altruism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n83',
            },
            {
              id: 'n82_c2',
              text: 'Завмерти.',
              nextNodeId: 'n84',
            },
            {
              id: 'n82_c3',
              text: 'Хапати зброю і знак роду.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n85',
            },
            {
              id: 'n82_c4',
              text: 'Відчути моторошний захват від його сили.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'lust',
                  delta: 1,
                },
              ],
              nextNodeId: 'n86',
            },
          ],
        },
        n83: {
          id: 'n83',
          type: 'narration',
          text: 'Мірелла встигла торкнутися материної руки лише на мить.',
          nextNodeId: 'n87',
        },
        n84: {
          id: 'n84',
          type: 'narration',
          text: 'Страх приклеїв її до підлоги краще, ніж будь-який наказ.',
          nextNodeId: 'n87',
        },
        n85: {
          id: 'n85',
          type: 'narration',
          text: 'Пальці самі стиснули медальйон і короткий ніж.',
          nextNodeId: 'n87',
        },
        n86: {
          id: 'n86',
          type: 'narration',
          text: 'У тій жорстокості було щось таке, що лякало і притягувало водночас.',
          nextNodeId: 'n87',
        },
        n87: {
          id: 'n87',
          type: 'narration',
          backgroundId: 'chapter-1/backgrounds/cage-descent.webp',
          music: {
            action: 'switch',
            musicId: 'theme_captivity',
            fadeMs: 700,
          },
          stage: {
            characters: [
              {
                speakerId: 'old-prisoner',
                emotion: 'shifty',
                portraitId: 'chapter-1/portraits/old-prisoner/shifty.webp',
              },
              {
                speakerId: 'mirella',
                emotion: 'broken',
                outfitId: 'dress-torn',
              },
              {
                speakerId: 'guard',
                emotion: 'cold',
                portraitId: 'chapter-1/portraits/guard/cold.webp',
              },
            ],
            focusCharacterId: 'mirella',
          },
          text:
            'Спуск у клітці пахнув кров’ю, іржею і чиїмось старим потом. Голод виявився принизливішим за страх.',
          onEnterEffects: [
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-torn',
            },
          ],
          nextNodeId: 'n88',
        },
        n88: {
          id: 'n88',
          type: 'dialogue',
          speakerId: 'old-prisoner',
          emotion: 'shifty',
          text: 'У тебе такий вигляд, ніби ти ще вчора їла з гербового срібла.',
          nextNodeId: 'n89',
        },
        n89: {
          id: 'n89',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'humiliated',
          text:
            'Старий тримав шматок сухого хліба. Від нього тхнуло і старістю, і чимось слизько-двозначним.',
          choices: [
            {
              id: 'n89_c1',
              text: 'Терпіти голод.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'restraint',
                  delta: 1,
                },
              ],
              nextNodeId: 'n90',
            },
            {
              id: 'n89_c2',
              text: 'Попросити їжі обережно.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'humanity',
                  delta: 1,
                },
              ],
              nextNodeId: 'n91',
            },
            {
              id: 'n89_c3',
              text: 'Спробувати щось виторгувати.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n92',
            },
            {
              id: 'n89_c4',
              text: 'Наїхати статусом.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'egoism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n93',
            },
          ],
        },
        n90: {
          id: 'n90',
          type: 'narration',
          text: 'Мірелла відвернулася. Голод простіше витримати, ніж ще одне приниження.',
          nextNodeId: 'n94',
        },
        n91: {
          id: 'n91',
          type: 'dialogue',
          speakerId: 'mirella',
          text: 'Дай трохи…',
          nextNodeId: 'n94',
        },
        n92: {
          id: 'n92',
          type: 'dialogue',
          speakerId: 'mirella',
          text: 'Якщо ми переживемо цей спуск, я можу відплатити.',
          nextNodeId: 'n94',
        },
        n93: {
          id: 'n93',
          type: 'dialogue',
          speakerId: 'mirella',
          text: 'Ти взагалі розумієш, хто я?',
          nextNodeId: 'n94',
        },
        n94: {
          id: 'n94',
          type: 'dialogue',
          speakerId: 'old-prisoner',
          emotion: 'soft',
          text:
            'Розумію. Тому й кажу: їж, поки ще можеш бути просто голодною, а не мертвою.',
          onEnterEffects: [
            {
              type: 'setFlag',
              key: 'oldManNotPureMonster',
              value: true,
            },
          ],
          nextNodeId: 'n107',
        },
        n107: {
          id: 'n107',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'hollow',
          text: 'Стіл. Ліна. Шахта. Мати з вином. Каель у дверях. Рауст на балконі. Батько в крові.',
          choices: [
            {
              id: 'n107_c1',
              text: 'Думати про матір.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'humanity',
                  delta: 1,
                },
              ],
              nextNodeId: 'n108',
            },
            {
              id: 'n107_c2',
              text: 'Думати про силу.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'domination',
                  delta: 1,
                },
              ],
              nextNodeId: 'n109',
            },
            {
              id: 'n107_c3',
              text: 'Думати тільки про виживання.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
              ],
              nextNodeId: 'n110',
            },
          ],
        },
        n108: {
          id: 'n108',
          type: 'narration',
          text: 'Останнім чистим образом у темряві лишилася мати. Не сильна. Не права. Але жива.',
          nextNodeId: 'n111',
        },
        n109: {
          id: 'n109',
          type: 'narration',
          text: 'Мірелла побачила лише одне: як легко все вирішує той, хто більше не соромиться сили.',
          nextNodeId: 'n111',
        },
        n110: {
          id: 'n110',
          type: 'narration',
          text: 'Жодної думки не лишилося цілісною. Тільки голе, тваринне бажання дихати ще хоч раз.',
          nextNodeId: 'n111',
        },
        n111: {
          id: 'n111',
          type: 'narration',
          backgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          music: {
            action: 'switch',
            musicId: 'theme_parasite',
            fadeMs: 900,
          },
          stage: {
            characters: [
              {
                speakerId: 'ner-azet',
                emotion: 'hunger',
                portraitId: 'chapter-1/portraits/ner-azet/hunger.webp',
              },
              {
                speakerId: 'mirella',
                emotion: 'broken',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'mirella',
          },
          text:
            'Коли вона розплющила очі, над нею висіли уламки древнього храму, а поруч дихала чорна ріка. Біль уже майже перестав бути болем.',
          onEnterEffects: [
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-ripped',
            },
          ],
          nextNodeId: 'n119',
        },
        n119: {
          id: 'n119',
          type: 'event',
          speakerId: 'ner-azet',
          emotion: 'invasion',
          text: 'Тоді встань.',
          onEnterEffects: [
            {
              type: 'setFlag',
              key: 'parasiteContact',
              value: true,
            },
            {
              type: 'unlockStat',
              key: 'corruption',
            },
          ],
          nextNodeId: 'n120',
        },
        n120: {
          id: 'n120',
          type: 'narration',
          text:
            'Чорна ріка дихнула в темряві. Мірелла підняла голову. Пролог закінчився там, де починалося вже не повернення — а підйом нагору через щось гірше за смерть.',
          onEnterEffects: [
            {
              type: 'setFlag',
              key: 'prologueFinished',
              value: true,
            },
            {
              type: 'setFlag',
              flagId: 'chapter1.undergroundAwakeningQueued',
              value: true,
            },
          ],
          nextSceneId: 'chapter-1/travel/underground-route',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
