import { expect, it } from 'vitest';

import { getNextDialogueRevealCharacterCount } from '@engine/systems/dialogue/dialogueReveal';

describe('dialogueReveal', () => {
  it('reveals up to the next whole word boundary', () => {
    const plainText = 'Служниця відкрила шафу.';

    expect(getNextDialogueRevealCharacterCount(plainText, 0, plainText.length)).toBe(
      'Служниця '.length,
    );
  });

  it('keeps punctuation prefixes attached to the following word', () => {
    const plainText = '— Для дороги попелясту, пані?';

    expect(getNextDialogueRevealCharacterCount(plainText, 0, plainText.length)).toBe(
      '— Для '.length,
    );
  });

  it('stops at a line break after finishing the current word chunk', () => {
    const plainText = 'ABC\nD';

    expect(getNextDialogueRevealCharacterCount(plainText, 0, plainText.length)).toBe('ABC\n'.length);
  });
});
