import { EffectReferenceValidator } from '@engine/validators/EffectReferenceValidator';
import { QuestContentValidator } from '@engine/validators/QuestContentValidator';

describe('QuestContentValidator', () => {
  it('detects duplicate objectives and broken stage references', () => {
    const validator = new QuestContentValidator(new EffectReferenceValidator());

    const issues = validator.validate({
      id: 'broken-quest',
      title: 'Broken quest',
      category: 'main',
      startStageId: 'missing-start',
      stages: [
        {
          id: 'stage-a',
          title: 'Stage A',
          nextStageId: 'stage-missing',
          objectives: [
            {
              id: 'repeat',
              label: 'First objective',
              kind: 'counter',
              targetValue: 1,
            },
            {
              id: 'repeat',
              label: 'Duplicate objective',
              kind: 'counter',
              targetValue: 1,
            },
          ],
        },
      ],
    });

    const issueCodes = new Set(issues.map((issue) => issue.code));

    expect(issueCodes.has('duplicateQuestObjectiveId')).toBe(true);
    expect(issueCodes.has('missingQuestStageReference')).toBe(true);
  });
});
