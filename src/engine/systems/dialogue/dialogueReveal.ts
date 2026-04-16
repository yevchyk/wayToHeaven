interface DialogueRevealSegment {
  segment: string;
  isWhitespace: boolean;
  isNewline: boolean;
  isWordLike: boolean;
}

const MAX_DIALOGUE_REVEAL_DELAY_MS = 240;
const WORD_LIKE_CHARACTER_PATTERN = /[\p{L}\p{N}\p{M}]/u;
const WHITESPACE_PATTERN = /\s/u;
const TERMINAL_PUNCTUATION_PATTERN = /[.!?…]/u;
const MINOR_PUNCTUATION_PATTERN = /[,;:]/u;

function isWordLikeCharacter(character: string) {
  return WORD_LIKE_CHARACTER_PATTERN.test(character);
}

function toDialogueRevealSegment(segment: string): DialogueRevealSegment {
  return {
    segment,
    isWhitespace: WHITESPACE_PATTERN.test(segment),
    isNewline: segment.includes('\n'),
    isWordLike: isWordLikeCharacter(segment),
  };
}

function createFallbackGraphemeSegments(input: string) {
  return Array.from(input).map((segment) => toDialogueRevealSegment(segment));
}

function getDialogueRevealSegments(input: string) {
  if (!input) {
    return [];
  }

  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('uk', { granularity: 'grapheme' });

    return Array.from(segmenter.segment(input), ({ segment }) => toDialogueRevealSegment(segment));
  }

  return createFallbackGraphemeSegments(input);
}

function consumeAttachedTrailingSegments(
  segments: DialogueRevealSegment[],
  startIndex: number,
) {
  let consumedCharacters = 0;
  let cursor = startIndex;

  while (cursor < segments.length) {
    const segment = segments[cursor];

    if (!segment || segment.isWordLike) {
      break;
    }

    consumedCharacters += segment.segment.length;
    cursor += 1;

    if (segment.isNewline || segment.isWhitespace) {
      break;
    }
  }

  return {
    consumedCharacters,
    nextIndex: cursor,
  };
}

export function getNextDialogueRevealCharacterCount(
  plainText: string,
  currentCharacterCount: number,
  pageEndCharacterCount: number,
) {
  const safeStart = Math.max(0, currentCharacterCount);
  const safeEnd = Math.max(safeStart, Math.min(pageEndCharacterCount, plainText.length));

  if (safeStart >= safeEnd) {
    return safeEnd;
  }

  const remainingText = plainText.slice(safeStart, safeEnd);
  const segments = getDialogueRevealSegments(remainingText);

  if (segments.length === 0) {
    return Math.min(safeEnd, safeStart + 1);
  }

  let consumedCharacters = 0;
  let segmentIndex = 0;
  let hasVisibleGrapheme = false;

  while (segmentIndex < segments.length) {
    const segment = segments[segmentIndex];

    if (!segment) {
      break;
    }

    consumedCharacters += segment.segment.length;
    segmentIndex += 1;

    if (segment.isNewline) {
      break;
    }

    if (segment.isWhitespace) {
      if (hasVisibleGrapheme) {
        break;
      }

      continue;
    }

    if (!segment.isWordLike) {
      if (hasVisibleGrapheme) {
        const trailingSegments = consumeAttachedTrailingSegments(segments, segmentIndex);
        consumedCharacters += trailingSegments.consumedCharacters;
        segmentIndex = trailingSegments.nextIndex;
        break;
      }

      continue;
    }

    hasVisibleGrapheme = true;

    const trailingSegments = consumeAttachedTrailingSegments(segments, segmentIndex);
    consumedCharacters += trailingSegments.consumedCharacters;
    segmentIndex = trailingSegments.nextIndex;
    break;
  }

  return safeStart + Math.max(1, Math.min(consumedCharacters, safeEnd - safeStart));
}

function getTrailingPunctuationDelayMultiplier(revealedChunk: string) {
  const characters = Array.from(revealedChunk);
  let trailingVisibleCharacter: string | null = null;

  for (let index = characters.length - 1; index >= 0; index -= 1) {
    const character = characters[index];

    if (!character || WHITESPACE_PATTERN.test(character)) {
      continue;
    }

    trailingVisibleCharacter = character;
    break;
  }

  if (!trailingVisibleCharacter) {
    return 1;
  }

  if (TERMINAL_PUNCTUATION_PATTERN.test(trailingVisibleCharacter)) {
    return 3;
  }

  if (MINOR_PUNCTUATION_PATTERN.test(trailingVisibleCharacter)) {
    return 1.8;
  }

  if (revealedChunk.includes('\n')) {
    return 2.3;
  }

  return 1;
}

export function getDialogueRevealDelayMs(
  textSpeed: number,
  revealedCharacterDelta: number,
  revealedChunk = '',
) {
  const stepDelayMs = Math.max(10, Math.floor(1000 / Math.max(1, textSpeed)));
  const punctuationMultiplier = getTrailingPunctuationDelayMultiplier(revealedChunk);

  return Math.max(
    stepDelayMs,
    Math.min(
      MAX_DIALOGUE_REVEAL_DELAY_MS,
      Math.floor(stepDelayMs * Math.max(1, revealedCharacterDelta) * punctuationMultiplier),
    ),
  );
}
