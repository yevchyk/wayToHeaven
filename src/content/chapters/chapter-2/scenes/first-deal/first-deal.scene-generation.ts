import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import { chapter2BackgroundIds, chapter2MusicIds, chapter2PortraitIds } from '../../assets';

export const chapter2FirstDealSceneGenerationDocument = {
  id: 'chapter-2/scene-generation/first-deal',
  schemaVersion: 1,
  title: 'Глава II — Перший міський борг',
  meta: {
    chapterId: 'chapter-2',
    language: 'uk',
    defaultBackgroundId: chapter2BackgroundIds.brokerStall,
    defaultMusicId: chapter2MusicIds.ledgerBreath,
    notes:
      'The first deal is the chapter pivot. Mirella stops being merely processed and starts choosing how to enter the city machine.',
  },
  scenes: {
    'chapter-2/scene/first-deal': {
      id: 'chapter-2/scene/first-deal',
      mode: 'sequence',
      title: 'Перший міський борг',
      description: 'A broker offers Mirella her first binding city arrangement.',
      startNodeId: 'deal-001',
      backgroundId: chapter2BackgroundIds.brokerStall,
      music: {
        action: 'play',
        musicId: chapter2MusicIds.ledgerBreath,
        fadeMs: 700,
        loop: true,
      },
      nodes: {
        'deal-001': {
          id: 'deal-001',
          type: 'narration',
          text:
            'Нена не вивела Міреллу в окремий кабінет. Вона відсунула полотно збоку від ринкового проходу, де пахло мокрою тканиною, металом і чужими записами. У Гуген-Умі таємні справи не ховають глибоко. Їх просто ставлять так, щоб повз проходили тільки потрібні люди.',
          nextNodeId: 'deal-002',
        },
        'deal-002': {
          id: 'deal-002',
          type: 'dialogue',
          speakerId: 'broker-nena',
          speakerSide: 'left',
          emotion: 'sharp',
          portraitId: chapter2PortraitIds.brokerNena.sharp,
          text:
            'Місто вже витратило на тебе погляд, мітку і шмат двору. Тепер питання просте: ти даси йому щось у відповідь сама чи дочекаєшся, поки хтось вибере за тебе гірше.',
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
              type: 'addQuest',
              questId: 'cq_nena_first_deal',
            },
          ],
          nextNodeId: 'deal-003',
        },
        'deal-003': {
          id: 'deal-003',
          type: 'choice',
          speakerId: 'broker-nena',
          speakerSide: 'left',
          emotion: 'mocking',
          portraitId: chapter2PortraitIds.brokerNena.mocking,
          text: 'Що саме Мірелла робить зі своєю першою міською можливістю?',
          choices: [
            {
              id: 'deal-with-nena',
              text: 'Взяти запечатаний згорток Нени й занести його туди, куди не питають уголос.',
              tone: 'danger',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealPath',
                  value: 'broker',
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealClosed',
                  value: true,
                },
                {
                  type: 'advanceQuest',
                  questId: 'cq_nena_first_deal',
                  delta: 1,
                },
                {
                  type: 'advanceQuest',
                  questId: 'mq_become_unremovable',
                  delta: 1,
                },
                {
                  type: 'advanceQuest',
                  questId: 'mq_whose_name_holds_you',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'broker-nena',
                  axis: 'dependency',
                  delta: 1,
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
              ],
              nextNodeId: 'deal-004-broker',
            },
            {
              id: 'deal-with-registry',
              text: 'Занести все прямо до Вея і дати місту зрозуміти, що Мірелла не буде тінню на чужому шляху.',
              tone: 'duty',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealPath',
                  value: 'registry',
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealClosed',
                  value: true,
                },
                {
                  type: 'advanceQuest',
                  questId: 'cq_vey_ledger_mark',
                  delta: 1,
                },
                {
                  type: 'advanceQuest',
                  questId: 'mq_become_unremovable',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'registrar-vey',
                  axis: 'respect',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'reputation',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: -1,
                },
              ],
              nextNodeId: 'deal-004-registry',
            },
            {
              id: 'deal-with-shelter',
              text: 'Відмовитися від пакунка й купити собі перший дах не грошима, а роботою для притулку.',
              tone: 'recovery',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealPath',
                  value: 'shelter',
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter2.city.firstDealClosed',
                  value: true,
                },
                {
                  type: 'addQuest',
                  questId: 'cq_ioma_bed_without_name',
                },
                {
                  type: 'advanceQuest',
                  questId: 'mq_become_unremovable',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  relationshipId: 'matron-ioma',
                  axis: 'trust',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'safety',
                  delta: 1,
                },
                {
                  type: 'changeMeta',
                  key: 'morale',
                  delta: -1,
                },
              ],
              nextNodeId: 'deal-004-shelter',
            },
          ],
        },
        'deal-004-broker': {
          id: 'deal-004-broker',
          type: 'dialogue',
          speakerId: 'broker-nena',
          speakerSide: 'left',
          emotion: 'soft',
          portraitId: chapter2PortraitIds.brokerNena.soft,
          text:
            'Розумно. Перша користь не мусить бути чистою. Вона мусить бути вчасною. Коли повернешся, у тебе вже буде не просто мітка, а слід.',
          nextNodeId: 'deal-005',
        },
        'deal-004-registry': {
          id: 'deal-004-registry',
          type: 'narration',
          text:
            'Мірелла несла пакунок не як контрабанду, а як виклик. Якщо місто збиралося читати її по чужих записах, воно хоча б побачить, що вона вміє підходити до столу сама.',
          nextNodeId: 'deal-005',
        },
        'deal-004-shelter': {
          id: 'deal-004-shelter',
          type: 'narration',
          text:
            'Відмова теж стала боргом, просто іншого типу. Тепер місто вимагатиме від Мірелли не таємного ходу, а щоденної корисності перед людьми, які рахують ковдри й тіла однаково уважно.',
          nextNodeId: 'deal-005',
        },
        'deal-005': {
          id: 'deal-005',
          type: 'narration',
          text:
            'Так чи інакше, межа була перейдена. До цього моменту Гуген-Ум тиснув на неї як середовище. Тепер він уперше отримав відповідь, за яку можна буде виставити рахунок.',
          nextSceneId: 'chapter-2/city/sorting-yard',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
