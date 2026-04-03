import type { DialogueData } from '@engine/types/dialogue';
import { DialogueValidator } from '@engine/validators/DialogueValidator';
import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { createContentReferenceLookup } from '@engine/validators/contentReferenceLookup';

describe('DialogueValidator', () => {
  it('detects broken dialogue references', () => {
    const referenceLookup = createContentReferenceLookup({
      battles: {},
      cityScenes: {},
      travelBoards: {},
      dialogues: {},
      sceneFlows: {},
      items: {},
      quests: {},
      locations: {},
      characterTemplates: {},
      characterInstances: {},
      enemyTemplates: {},
      statusDefinitions: {},
      defaultPartyInstanceIds: [],
    });
    const validator = new DialogueValidator(new EffectReferenceValidator(referenceLookup), {
      hasSpeakerId: (speakerId) => speakerId === 'guard',
      hasAssetOfKind: () => false,
    });
    const invalidDialogue: DialogueData = {
      id: 'broken-dialogue',
      startNodeId: 'missing-start',
      speakerIds: ['guard'],
      nodes: {
        intro: {
          id: 'mismatched-intro',
          type: 'choice',
          speakerId: 'outsider',
          emotion: 'unknown' as never,
          backgroundId: 'missing-background',
          text: 'This is invalid.',
          nextNodeId: 'missing-next',
          onEnterEffects: [
            {
              type: 'runScript',
              scriptId: 'missing-script',
            },
            {
              type: 'addQuest',
              questId: 'missing-quest',
            },
            {
              type: 'jumpToNode',
              nodeId: 'missing-jump',
            },
          ],
          choices: [
            {
              id: 'take-supplies',
              text: 'Take the supplies.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'missing-item',
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
    };

    const issues = validator.validate(invalidDialogue);

    expect(issues.some((issue) => issue.code === 'missingStartNode')).toBe(true);
    expect(issues.some((issue) => issue.code === 'unknownSpeaker')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingSpeakerReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'invalidNodeId')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingNodeReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'unsupportedEmotion')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingBackgroundReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingItemReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingQuestReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingScriptReference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missingJumpNodeReference')).toBe(true);
  });
});
