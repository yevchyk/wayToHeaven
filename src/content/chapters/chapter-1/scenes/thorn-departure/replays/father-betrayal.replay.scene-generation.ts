import type { SceneGenerationScene } from '@engine/types/sceneGeneration';

export const chapter1ThornDepartureFatherBetrayalReplayScene: SceneGenerationScene = {
  id: 'chapter-1/scene/thorn-estate/replay/father-betrayal',
  mode: 'sequence',
  title: 'Replay: Father Betrayal',
  description: 'A replay stub for the corridor discovery. Keep it morally cold, not melodramatic.',
  startNodeId: 'thorn-replay-betrayal-1',
  backgroundId: 'prologue/backgrounds/thorn_mines_private_corridor_dim',
  replay: {
    enabled: true,
    unlockOnStart: false,
  },
  nodes: {
    'thorn-replay-betrayal-1': {
      id: 'thorn-replay-betrayal-1',
      type: 'narration',
      text: 'Базовий реплей-вузол для сцени з батьковою зрадою. Тут важливо змістити фокус із простої невірності на те, як влада проникає в близькість і перетворює навіть полегшення для іншої людини на інструмент залежності.',
      nextNodeId: 'thorn-replay-betrayal-2',
    },
    'thorn-replay-betrayal-2': {
      id: 'thorn-replay-betrayal-2',
      type: 'narration',
      text: 'Базовий середній вузол: дати кілька точних деталей, службову стрічку, подяку за переведення брата, близькість облич, жест, який уже неможливо назвати просто співчуттям. Без крику, без гучного шоку, тільки ясність.',
      nextNodeId: 'thorn-replay-betrayal-3',
    },
    'thorn-replay-betrayal-3': {
      id: 'thorn-replay-betrayal-3',
      type: 'narration',
      text: 'Базовий фінальний вузол: реакція Мірелли має бути не підлітково-моралістичною, а роздвоєною. Її ранить не лише сам факт, а й те, що тепер вона краще бачить батька як систему, яка не змінює форми навіть у напівтемряві.',
      isEnd: true,
    },
  },
};
