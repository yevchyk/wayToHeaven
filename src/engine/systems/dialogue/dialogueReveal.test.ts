import { expect, it } from 'vitest';

import { getNextDialogueRevealCharacterCount } from '@engine/systems/dialogue/dialogueReveal';

describe('dialogueReveal', () => {
  it('reveals a grapheme beat instead of jumping an entire word', () => {
    const plainText = 'Servant opened the wardrobe.';

    expect(getNextDialogueRevealCharacterCount(plainText, 0, plainText.length)).toBe(1);
  });

  it('keeps leading punctuation attached to the next visible character', () => {
    const plainText = '— Lady?';

    expect(getNextDialogueRevealCharacterCount(plainText, 0, plainText.length)).toBe('— L'.length);
  });

  it('attaches a line break after finishing the current visible beat', () => {
    const plainText = 'ABC\nD';

    expect(getNextDialogueRevealCharacterCount(plainText, 2, plainText.length)).toBe('ABC\n'.length);
  });
});
