interface DialogueRevealSegment {
  segment: string;
  isWordLike: boolean;
}

const MAX_DIALOGUE_REVEAL_DELAY_MS = 240;
const WORD_LIKE_CHARACTER_PATTERN = /[\p{L}\p{N}\p{M}]/u;
const WORD_CONNECTOR_PATTERN = /['’ʼ-]/u;
const WHITESPACE_PATTERN = /\s/u;

function isWordLikeCharacter(character: string) {
  return WORD_LIKE_CHARACTER_PATTERN.test(character);
}

function isWordConnector(character: string) {
  return WORD_CONNECTOR_PATTERN.test(character);
}

function createFallbackWordSegments(input: string) {
  const segments: DialogueRevealSegment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const character = input[cursor];

    if (!character) {
      break;
    }

    if (WHITESPACE_PATTERN.test(character)) {
      let end = cursor + 1;

      while (end < input.length && WHITESPACE_PATTERN.test(input[end] ?? '')) {
        end += 1;
      }

      segments.push({
        segment: input.slice(cursor, end),
        isWordLike: false,
      });
      cursor = end;

      continue;
    }

    if (isWordLikeCharacter(character)) {
      let end = cursor + 1;

      while (end < input.length) {
        const nextCharacter = input[end] ?? '';

        if (isWordLikeCharacter(nextCharacter)) {
          end += 1;

          continue;
        }

        if (
          isWordConnector(nextCharacter) &&
          isWordLikeCharacter(input[end - 1] ?? '') &&
          isWordLikeCharacter(input[end + 1] ?? '')
        ) {
          end += 1;

          continue;
        }

        break;
      }

      segments.push({
        segment: input.slice(cursor, end),
        isWordLike: true,
      });
      cursor = end;

      continue;
    }

    let end = cursor + 1;

    while (
      end < input.length &&
      !WHITESPACE_PATTERN.test(input[end] ?? '') &&
      !isWordLikeCharacter(input[end] ?? '')
    ) {
      end += 1;
    }

    segments.push({
      segment: input.slice(cursor, end),
      isWordLike: false,
    });
    cursor = end;
  }

  return segments;
}

function getDialogueRevealSegments(input: string) {
  if (!input) {
    return [];
  }

  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('uk', { granularity: 'word' });

    return Array.from(segmenter.segment(input), ({ segment, isWordLike }) => ({
      segment,
      isWordLike: Boolean(isWordLike ?? WORD_LIKE_CHARACTER_PATTERN.test(segment)),
    }));
  }

  return createFallbackWordSegments(input);
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

  while (segmentIndex < segments.length) {
    const segment = segments[segmentIndex];

    if (!segment) {
      break;
    }

    consumedCharacters += segment.segment.length;
    segmentIndex += 1;

    if (!segment.isWordLike) {
      if (segment.segment.includes('\n')) {
        break;
      }

      continue;
    }

    while (segmentIndex < segments.length) {
      const trailingSegment = segments[segmentIndex];

      if (!trailingSegment || trailingSegment.isWordLike) {
        break;
      }

      consumedCharacters += trailingSegment.segment.length;
      segmentIndex += 1;

      if (trailingSegment.segment.includes('\n')) {
        break;
      }
    }

    break;
  }

  return safeStart + Math.max(1, Math.min(consumedCharacters, safeEnd - safeStart));
}

export function getDialogueRevealDelayMs(textSpeed: number, revealedCharacterDelta: number) {
  const stepDelayMs = Math.max(10, Math.floor(1000 / Math.max(1, textSpeed)));

  return Math.max(
    stepDelayMs,
    Math.min(MAX_DIALOGUE_REVEAL_DELAY_MS, stepDelayMs * Math.max(1, revealedCharacterDelta)),
  );
}
