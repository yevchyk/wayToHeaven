import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import {
  chapter2BackgroundIds,
  chapter2MusicIds,
  chapter2PortraitIds,
  chapter2SfxIds,
} from '../../assets';

export const chapter2ArrivalSceneGenerationDocument = {
  id: 'chapter-2/scene-generation/arrival',
  schemaVersion: 1,
  title: 'Глава II — Вхід у Гуген-Ум',
  meta: {
    chapterId: 'chapter-2',
    language: 'uk',
    defaultBackgroundId: chapter2BackgroundIds.arrivalGate,
    defaultMusicId: chapter2MusicIds.cityPressure,
    notes:
      'Chapter 2 opens not with sanctuary but with sorting. The city defines Mirella before it offers any path forward.',
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
    'chapter-2/scene/arrival': {
      id: 'chapter-2/scene/arrival',
      mode: 'sequence',
      title: 'Вхід у Гуген-Ум',
      description: 'The caravan arrives at the dead capital and Mirella receives her first city mark.',
      startNodeId: 'arrival-001',
      backgroundId: chapter2BackgroundIds.arrivalGate,
      music: {
        action: 'play',
        musicId: chapter2MusicIds.cityPressure,
        fadeMs: 1000,
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
        'arrival-001': {
          id: 'arrival-001',
          type: 'narration',
          title: 'Перед брамою',
          text:
            'Гуген-Ум не виріс з туману як столиця з дитячої легенди. Він сидів попереду як кам’яне тіло, яке давно забуло про славу, але не забуло, як тиснути. Караван зменшився перед ним не тому, що став дрібнішим, а тому, що саме місто вміло робити з прибулих матеріал.',
          onEnterEffects: [
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-ripped',
            },
            {
              type: 'setFlag',
              flagId: 'chapter2.arrival.entered',
              value: true,
            },
            {
              type: 'setFlag',
              flagId: 'chapter2.city.firstDealClosed',
              value: false,
            },
            {
              type: 'completeQuest',
              questId: 'mq_road_to_hugen_um',
            },
            {
              type: 'addQuest',
              questId: 'mq_survive_hugen_um',
            },
            {
              type: 'addQuest',
              questId: 'mq_become_unremovable',
            },
            {
              type: 'addQuest',
              questId: 'mq_whose_name_holds_you',
            },
          ],
          nextNodeId: 'arrival-002',
        },
        'arrival-002': {
          id: 'arrival-002',
          type: 'dialogue',
          speakerId: 'yarva',
          speakerSide: 'right',
          emotion: 'cold',
          text:
            'Не дивись на мури як на кінець дороги. Тут дорога тільки міняє форму. Зараз вас не впускають. Зараз вас сортують.',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'yarva',
                emotion: 'cold',
              },
            ],
            focusCharacterId: 'yarva',
          },
          nextNodeId: 'arrival-003',
        },
        'arrival-003': {
          id: 'arrival-003',
          type: 'narration',
          backgroundId: chapter2BackgroundIds.sortingYard,
          text:
            'За брамою не було урочистого входу. Була довга кам’яна шия двору, куди стягували людей, тварин, мішки, поранених і тих, кого ще не вирішили куди віднести. На одних уже висіли жетони. Інших крейдою маркували на місці.',
          nextNodeId: 'arrival-004',
        },
        'arrival-004': {
          id: 'arrival-004',
          type: 'dialogue',
          speakerId: 'registrar-vey',
          speakerSide: 'right',
          emotion: 'professional',
          portraitId: chapter2PortraitIds.registrarVey.professional,
          sceneChange: {
            sfx: {
              sfxId: chapter2SfxIds.registryStamp,
            },
          },
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'registrar-vey',
                emotion: 'professional',
                portraitId: chapter2PortraitIds.registrarVey.professional,
              },
            ],
            focusCharacterId: 'registrar-vey',
          },
          text:
            'Ім’я. Походження. Хто за тебе платить, якщо ти впадеш. Хто забере тебе, якщо ти зіпсуєшся. Відповідай коротко. Двір не любить зайвих людей і зайвих слів однаково.',
          onEnterEffects: [
            {
              type: 'addQuest',
              questId: 'cq_vey_ledger_mark',
            },
          ],
          nextNodeId: 'arrival-005',
        },
        'arrival-005': {
          id: 'arrival-005',
          type: 'choice',
          speakerId: 'registrar-vey',
          speakerSide: 'right',
          emotion: 'stern',
          portraitId: chapter2PortraitIds.registrarVey.stern,
          text: 'Як саме Мірелла дозволяє місту записати себе?',
          choices: [
            {
              id: 'claim-thorn-name',
              text: 'Назвати дім Торнів і дивитися так, ніби ім’я досі щось важить.',
              tone: 'duty',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.arrival.identity',
                  value: 'thorn',
                },
                {
                  type: 'changeMeta',
                  key: 'reputation',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'badReputation',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'registrar-vey',
                  axis: 'respect',
                  delta: 1,
                },
              ],
              nextNodeId: 'arrival-006-thorn',
            },
            {
              id: 'stay-with-caravan',
              text: 'Лишитися тілом із караванного списку, не відриваючись від чужого обліку.',
              tone: 'neutral',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.arrival.identity',
                  value: 'caravan',
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'yarva',
                  axis: 'dependency',
                  delta: 1,
                },
              ],
              nextNodeId: 'arrival-006-caravan',
            },
            {
              id: 'speak-own-name',
              text: 'Дати тільки власне ім’я й не сховатися ні за домом, ні за караваном.',
              tone: 'danger',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.arrival.identity',
                  value: 'self',
                },
                {
                  type: 'changeMeta',
                  key: 'morale',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: -1,
                },
              ],
              nextNodeId: 'arrival-006-self',
            },
          ],
        },
        'arrival-006-thorn': {
          id: 'arrival-006-thorn',
          type: 'dialogue',
          speakerId: 'registrar-vey',
          speakerSide: 'right',
          emotion: 'stern',
          portraitId: chapter2PortraitIds.registrarVey.stern,
          text:
            'Торн. Добре. Такі імена ще відкривають двері, але частіше відкривають зайві книги. Не загубися, поки я вирішую, в яку саме тебе внести.',
          nextNodeId: 'arrival-007',
        },
        'arrival-006-caravan': {
          id: 'arrival-006-caravan',
          type: 'dialogue',
          speakerId: 'registrar-vey',
          speakerSide: 'right',
          emotion: 'professional',
          portraitId: chapter2PortraitIds.registrarVey.professional,
          text:
            'Караванний залишок. Це простіше. Якщо ніхто не забере тебе окремо, місто розпоряджатиметься тобою разом з рештою.',
          nextNodeId: 'arrival-007',
        },
        'arrival-006-self': {
          id: 'arrival-006-self',
          type: 'dialogue',
          speakerId: 'registrar-vey',
          speakerSide: 'right',
          emotion: 'stern',
          portraitId: chapter2PortraitIds.registrarVey.stern,
          text:
            'Тільки ім’я. Сміливо або дурно. У Гуген-Умі це часто одне й те саме, доки хтось не вирішить інакше.',
          nextNodeId: 'arrival-007',
        },
        'arrival-007': {
          id: 'arrival-007',
          type: 'narration',
          text:
            'Холодна мітка лягла на зап’ясток швидше, ніж Мірелла встигла звикнути до власної відповіді. Вей не бив і не принижував. Він просто зробив гірше: перетворив її на рядок, який тепер житиме окремо від неї самої.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.sortingMarkPlaced',
              value: true,
            },
            {
              type: 'advanceQuest',
              questId: 'mq_whose_name_holds_you',
              delta: 1,
            },
            {
              type: 'changeMeta',
              key: 'badReputation',
              delta: 1,
            },
          ],
          nextNodeId: 'arrival-008',
        },
        'arrival-008': {
          id: 'arrival-008',
          type: 'dialogue',
          speakerId: 'yarva',
          speakerSide: 'right',
          emotion: 'serious',
          text:
            'Тепер ти в місті так само, як була в каравані: не вільна, а видима. Користуйся цим краще, ніж ім’ям.',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'shaken',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'yarva',
                emotion: 'serious',
              },
            ],
            focusCharacterId: 'yarva',
          },
          nextNodeId: 'arrival-009',
        },
        'arrival-009': {
          id: 'arrival-009',
          type: 'dialogue',
          speakerId: 'broker-nena',
          speakerSide: 'left',
          emotion: 'sharp',
          portraitId: chapter2PortraitIds.brokerNena.sharp,
          text:
            'Не лякайся. Тут усіх спершу зводять до мітки. Різниця тільки в тому, хто першим навчиться заробляти на ній.',
          stage: {
            characters: [
              {
                speakerId: 'broker-nena',
                emotion: 'sharp',
                portraitId: chapter2PortraitIds.brokerNena.sharp,
              },
              {
                speakerId: 'mirella',
                emotion: 'guarded',
                outfitId: 'dress-ripped',
              },
            ],
            focusCharacterId: 'broker-nena',
          },
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter2.city.brokerEyeOnMirella',
              value: true,
            },
          ],
          nextNodeId: 'arrival-010',
        },
        'arrival-010': {
          id: 'arrival-010',
          type: 'narration',
          text:
            'Сортувальний двір не завершував прибуття. Він тільки пояснював перше правило міста: спочатку тебе називають інші, а вже потім ти шукаєш, як із цим жити.',
          nextSceneId: 'chapter-2/city/sorting-yard',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
