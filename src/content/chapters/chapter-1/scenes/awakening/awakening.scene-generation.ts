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
          placement: { x: 18, scale: 1.08 },
        },
        {
          speakerId: 'ner-azet',
          emotion: 'whisper',
          portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
          placement: { x: 82, y: 3, scale: 0.96, opacity: 0.84 },
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
      replay: {
        enabled: true,
      },
      nodes: {
        'awakening-1': {
          id: 'awakening-1',
          type: 'narration',
          text: 'Камінь дихає сирістю, а чорна ріка шепоче так, ніби пам’ятає кожне падіння в цю безодню.',
          onEnterEffects: [
            { type: 'setCharacterOutfit', characterId: 'mirella', outfitId: 'dress-ripped' },
          ],
          nextNodeId: 'awakening-2',
        },
        'awakening-2': {
          id: 'awakening-2',
          type: 'dialogue',
          speakerId: 'ner-azet',
          emotion: 'whisper',
          portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
          text: 'Ти ще дихаєш. Отже, шлях нагору ще не закрито.',
          nextNodeId: 'awakening-3',
        },
        'awakening-3': {
          id: 'awakening-3',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'trembling',
          portraitId: 'chapter-1/portraits/mirella/trembling.webp',
          text: 'Мірелла підводиться, слухаючи, як у темряві скрипить древній шлях.',
          choices: [
            {
              id: 'awakening-3-steady',
              text: 'Зібратись і йти далі.',
              effects: [
                { type: 'changeStat', key: 'pragmatism', delta: 1 },
                { type: 'setFlag', flagId: 'chapter1.awakening.steadied', value: true },
              ],
              nextSceneId: 'chapter-1/scene/awakening/road',
            },
            {
              id: 'awakening-3-listen',
              text: 'Прислухатись до шепоту під ногами.',
              effects: [
                { type: 'changeStat', key: 'altruism', delta: 1 },
                { type: 'setFlag', flagId: 'chapter1.awakening.listened', value: true },
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
      nodes: {
        'awakening-road-1': {
          id: 'awakening-road-1',
          type: 'narration',
          text: 'Попереду чекає маршрут крізь затоплені проходи, засідки і схрони. Далі вже йде не сон, а дорога.',
          nextNodeId: 'awakening-road-2',
        },
        'awakening-road-2': {
          id: 'awakening-road-2',
          type: 'choice',
          speakerId: 'mirella',
          emotion: 'determined',
          portraitId: 'chapter-1/portraits/mirella/determined.webp',
          text: 'У першому підземному відрізку Мірелла вирішує, за що саме триматиметься далі.',
          choices: [
            {
              id: 'awakening-road-2-mother-thread',
              text: 'Згадати матір і тихі храмові вузли, які вона ховала в побуті.',
              conditions: [{ type: 'flag', flagId: 'relationship.mother', operator: 'gte', value: 2 }],
              effects: [
                { type: 'setFlag', flagId: 'chapter1.aftermath.motherThreadRemembered', value: true },
                { type: 'changeMeta', key: 'morale', delta: 1 },
              ],
              nextNodeId: 'awakening-road-3',
            },
            {
              id: 'awakening-road-2-father-mask',
              text: 'Випрямити спину так, як робив батько, коли хотів зламати кімнату самою поставою.',
              conditions: [{ type: 'flag', flagId: 'relationship.father', operator: 'gte', value: 1 }],
              effects: [
                { type: 'setFlag', flagId: 'chapter1.aftermath.fatherMask', value: true },
                { type: 'changeStat', key: 'domination', delta: 1 },
              ],
              nextNodeId: 'awakening-road-3',
            },
            {
              id: 'awakening-road-2-pragmatic-route',
              text: 'Рахувати кроки, шви в камені й технічні жолоби, а не шепіт.',
              conditions: [{ type: 'statGte', key: 'pragmatism', value: 2 }],
              effects: [
                { type: 'setFlag', flagId: 'chapter1.travel.maintenanceDuctNoticed', value: true },
              ],
              nextNodeId: 'awakening-road-3',
            },
            {
              id: 'awakening-road-2-human-route',
              text: 'Слухати не древній шепіт, а те, чи не лишився під каменем хтось живий.',
              conditions: [{ type: 'statGte', key: 'altruism', value: 2 }],
              effects: [
                { type: 'setFlag', flagId: 'chapter1.travel.lostPilgrimHeard', value: true },
                { type: 'changeMeta', key: 'morale', delta: 1 },
              ],
              nextNodeId: 'awakening-road-3',
            },
            {
              id: 'awakening-road-2-keep-moving',
              text: 'Не називати це ніяк. Просто йти.',
              nextNodeId: 'awakening-road-3',
            },
          ],
        },
        'awakening-road-3': {
          id: 'awakening-road-3',
          type: 'narration',
          text: 'Так або інакше, темрява вже отримала від неї першу відповідь. Далі шлях мав перевірити, чи вистачить цієї внутрішньої опори бодай до наступного виходу нагору.',
          onEnterEffects: [
            { type: 'setFlag', flagId: 'chapter1.undergroundAwakeningQueued', value: true },
          ],
          nextSceneId: 'chapter-1/scene/caravan-to-hugen-um',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
