import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

import { chapter1BackgroundIds } from '../../assets';

export const chapter1PrisonFallSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/prison-fall',
  schemaVersion: 1,
  title: 'Prison Fall Bridge',
  meta: {
    chapterId: 'chapter-1',
    defaultBackgroundId: chapter1BackgroundIds.prisonCell,
  },
  scenes: {
    'chapter-1/scene/prison-fall': {
      id: 'chapter-1/scene/prison-fall',
      mode: 'sequence',
      title: 'Prison Fall',
      description:
        'A compact aftermath bridge that keeps Chapter 1 on the collapse path before the city sandbox content begins.',
      startNodeId: 'prison-fall-1',
      nodes: {
        'prison-fall-1': {
          id: 'prison-fall-1',
          type: 'narration',
          title: 'Після падіння',
          text: `Темрява після втечі не принесла полегшення. Вона тільки забрала зору звичну форму речей, і тому смерть батька перестала бути сценою та стала фактом, з яким доводилося йти далі.`,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prisonFall.entered',
              value: true,
            },
          ],
          nextNodeId: 'prison-fall-2',
        },
        'prison-fall-2': {
          id: 'prison-fall-2',
          type: 'choice',
          speakerId: 'mirella',
          text: 'За що Мірелла тримається в першу хвилину після втечі?',
          choices: [
            {
              id: 'prison-fall-anchor-mother',
              text: 'Не дати матері впасти разом із домом.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prisonFall.anchor',
                  value: 'mother',
                },
                {
                  type: 'changeStat',
                  key: 'humanity',
                  delta: 1,
                },
              ],
              nextNodeId: 'prison-fall-3',
            },
            {
              id: 'prison-fall-anchor-aren',
              text: 'Триматися за різкість Арена й рухатися далі.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prisonFall.anchor',
                  value: 'aren',
                },
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
              ],
              nextNodeId: 'prison-fall-3',
            },
            {
              id: 'prison-fall-anchor-self',
              text: 'Замкнути все всередині й іти мовчки.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prisonFall.anchor',
                  value: 'self',
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'prison-fall-3',
            },
          ],
        },
        'prison-fall-3': {
          id: 'prison-fall-3',
          type: 'narration',
          text: `Це ще не нове життя і навіть не безпечна пауза. Це лише перший порядок після розлому: кого слухати, що пам’ятати і в якому стані винести себе до наступного шару темряви.`,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prisonFall.bridgeResolved',
              value: true,
            },
            {
              type: 'changeMeta',
              key: 'morale',
              delta: -1,
            },
          ],
          nextNodeId: 'prison-fall-4',
        },
        'prison-fall-4': {
          id: 'prison-fall-4',
          type: 'narration',
          title: 'Далі тільки вниз',
          text: `Під каменем уже не було місця для ролей дому Торнів. Лишався тільки рух уперед, де втеча мала перетворитися на пробудження.`,
          nextSceneId: 'chapter-1/scene/awakening',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
