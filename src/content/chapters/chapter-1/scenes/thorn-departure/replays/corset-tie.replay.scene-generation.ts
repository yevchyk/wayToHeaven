import type { SceneGenerationScene } from '@engine/types/sceneGeneration';

export const chapter1ThornDepartureCorsetTieReplayScene: SceneGenerationScene = {
  id: 'chapter-1/scene/thorn-estate/replay/corset-tie',
  mode: 'sequence',
  title: 'Replay: Corset Tie',
  description: 'A replay stub for the dressing scene. Keep it compact and intimate.',
  startNodeId: 'thorn-replay-corset-1',
  backgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
  replay: {
    enabled: true,
    unlockOnStart: false,
  },
  nodes: {
    'thorn-replay-corset-1': {
      id: 'thorn-replay-corset-1',
      type: 'narration',
      text: 'Базовий реплей-вузол для сцени з корсетом. Тут можна без поспіху розписати тілесний дискомфорт, залежність від чужих рук, класову близькість між Міреллою і Танею та те, як дрібна турбота стає небезпечною в домі, де все читають як ієрархію.',
      nextNodeId: 'thorn-replay-corset-2',
    },
    'thorn-replay-corset-2': {
      id: 'thorn-replay-corset-2',
      type: 'dialogue',
      speakerId: 'tanya',
      emotion: 'careful',
      text: 'Базова репліка для Тані: вона може спитати, чи не надто туго, або м’яко прокоментувати, що в дорозі краще дихати, ніж виглядати ідеально. Тон тихий, майже без права на ініціативу.',
      nextNodeId: 'thorn-replay-corset-3',
    },
    'thorn-replay-corset-3': {
      id: 'thorn-replay-corset-3',
      type: 'narration',
      text: 'Базовий фінальний вузол: зафіксувати післясмак сцени. Не робити її еротичною за замовчуванням; сильніше працюють сором, довіра, напруга тіла, звичка терпіти й відчуття, що Таня вміє зникати навіть у моменти близькості.',
      isEnd: true,
    },
  },
};
