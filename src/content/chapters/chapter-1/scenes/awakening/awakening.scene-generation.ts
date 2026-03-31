import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1AwakeningSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/awakening',
  schemaVersion: 1,
  title: 'Awakening Beneath The River',
  meta: {
    chapterId: 'chapter-1',
    defaultBackgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
    defaultMusicId: 'theme_parasite',
    defaultStage: {
      characters: [
        {
          speakerId: 'mirella',
          emotion: 'trembling',
          portraitId: 'chapter-1/portraits/mirella/trembling.webp',
          outfitId: 'dress-ripped',
        },
        {
          speakerId: 'ner-azet',
          emotion: 'whisper',
          portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
        },
      ],
      focusCharacterId: 'mirella',
    },
  },
  scenes: {
    'chapter-1/scene/awakening': {
      id: 'chapter-1/scene/awakening',
      mode: 'sequence',
      title: 'Awakening',
      description: 'The first breath after the fall under the black river.',
      startNodeId: 'awakening-1',
      nodes: {
        'awakening-1': {
          id: 'awakening-1',
          type: 'narration',
          text: 'Камінь дихає сирістю, а чорна ріка шепоче так, ніби пам’ятає кожне падіння в цю безодню.',
          onEnterEffects: [
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-ripped',
            },
          ],
          nextNodeId: 'awakening-2',
        },
        'awakening-2': {
          id: 'awakening-2',
          type: 'dialogue',
          speakerId: 'ner-azet',
          emotion: 'whisper',
          portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'trembling',
                portraitId: 'chapter-1/portraits/mirella/trembling.webp',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'ner-azet',
                emotion: 'whisper',
                portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
              },
            ],
            focusCharacterId: 'ner-azet',
          },
          text: 'Ти ще дихаєш. Отже, шлях нагору ще не закрито.',
          nextNodeId: 'awakening-3',
        },
        'awakening-3': {
          id: 'awakening-3',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'trembling',
          portraitId: 'chapter-1/portraits/mirella/trembling.webp',
          stage: {
            characters: [
              {
                speakerId: 'mirella',
                emotion: 'trembling',
                portraitId: 'chapter-1/portraits/mirella/trembling.webp',
                outfitId: 'dress-ripped',
              },
              {
                speakerId: 'ner-azet',
                emotion: 'whisper',
                portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
              },
            ],
            focusCharacterId: 'mirella',
          },
          text: 'Мірелла підводиться, слухаючи, як у темряві скрипить древній шлях.',
          choices: [
            {
              id: 'awakening-3-steady',
              text: 'Зібратись і йти далі.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'pragmatism',
                  delta: 1,
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter1.awakening.steadied',
                  value: true,
                },
              ],
              nextSceneId: 'chapter-1/scene/awakening/road',
            },
            {
              id: 'awakening-3-listen',
              text: 'Прислухатись до шепоту під ногами.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'humanity',
                  delta: 1,
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter1.awakening.listened',
                  value: true,
                },
              ],
              nextSceneId: 'chapter-1/scene/awakening/road',
            },
          ],
        },
      },
    },
    'chapter-1/scene/awakening/road': {
      id: 'chapter-1/scene/awakening/road',
      mode: 'sequence',
      title: 'The First Road',
      startNodeId: 'awakening-road-1',
      stage: {
        characters: [
          {
            speakerId: 'mirella',
            emotion: 'determined',
            portraitId: 'chapter-1/portraits/mirella/determined.webp',
            outfitId: 'dress-ripped',
          },
        ],
        focusCharacterId: 'mirella',
      },
      nodes: {
        'awakening-road-1': {
          id: 'awakening-road-1',
          type: 'narration',
          text: 'Попереду чекає маршрут крізь затоплені проходи, засідки і схрони. Далі вже йде не сон, а дорога.',
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.undergroundAwakeningQueued',
              value: true,
            },
          ],
          isEnd: true,
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
