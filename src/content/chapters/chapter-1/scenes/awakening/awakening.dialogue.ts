import type { DialogueData } from '@engine/types/dialogue';

export const chapter1AwakeningDialogue: DialogueData = {
  id: 'chapter-1/dialogues/awakening',
  title: 'Awakening Beneath The River',
  startNodeId: 'awakening-1',
  meta: {
    chapterId: 'chapter-1',
    sceneId: 'chapter-1/scene/awakening',
    sceneTitle: 'Awakening',
    defaultBackgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
    defaultMusicId: 'theme_parasite',
  },
  speakerIds: ['mirella', 'ner-azet'],
  nodes: {
    'awakening-1': {
      id: 'awakening-1',
      type: 'narration',
      backgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
      text: 'Камінь дихає сирістю, а чорна ріка шепоче так, ніби пам’ятає кожне падіння в цю безодню.',
      nextNodeId: 'awakening-2',
    },
    'awakening-2': {
      id: 'awakening-2',
      type: 'dialogue',
      speakerId: 'ner-azet',
      speakerSide: 'left',
      emotion: 'whisper',
      portraitId: 'chapter-1/portraits/ner-azet/whisper.webp',
      text: 'Ти ще дихаєш. Отже, шлях нагору ще не закрито.',
      nextNodeId: 'awakening-3',
    },
    'awakening-3': {
      id: 'awakening-3',
      type: 'choice',
      speakerId: 'mirella',
      speakerSide: 'right',
      emotion: 'trembling',
      portraitId: 'chapter-1/portraits/mirella/trembling.webp',
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
          nextNodeId: 'awakening-4',
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
          nextNodeId: 'awakening-4',
        },
      ],
    },
    'awakening-4': {
      id: 'awakening-4',
      type: 'narration',
      text: 'Попереду чекає маршрут крізь затоплені проходи, засідки і схрони. Далі вже йде не сон, а дорога.',
      isEnd: true,
    },
  },
};
