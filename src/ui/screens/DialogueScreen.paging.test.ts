import { expect, it } from 'vitest';

import { getPreferredDialoguePageBreak } from '@ui/screens/DialogueScreen';

describe('DialogueScreen paging', () => {
  it('prefers the end of a sentence over a mid-word cutoff', () => {
    const plainText = 'Перше речення. Друге речення тут. Третє речення ще попереду.';
    const candidatePageEnd = plainText.indexOf('попереду');

    expect(getPreferredDialoguePageBreak(plainText, 0, candidatePageEnd)).toBe(
      plainText.indexOf(' Третє') + 1,
    );
  });

  it('falls back to whitespace when no sentence break fits', () => {
    const plainText = 'Довгий фрагмент без крапки але з пробілами між словами';
    const candidatePageEnd = plainText.indexOf('пробілами') + 4;

    expect(getPreferredDialoguePageBreak(plainText, 0, candidatePageEnd)).toBe(
      plainText.indexOf('пробілами'),
    );
  });
});
