const ALLOWED_NARRATIVE_TAGS = new Set([
  'b',
  'br',
  'code',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]);

const SKIPPED_NARRATIVE_TAGS = new Set([
  'iframe',
  'meta',
  'object',
  'script',
  'style',
]);

interface NarrativeSerializationState {
  startOffset: number;
  remainingCharacters: number | null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function normalizeNarrativeText(value: string) {
  return value.replace(/\r\n?/g, '\n');
}

const BLOCK_NARRATIVE_TAG_PATTERN = /<(p|ul|ol|li|blockquote|h[1-6])\b/i;
const BREAK_NARRATIVE_TAG_PATTERN = /<br\s*\/?>/i;

function createNarrativeRoot(input: string) {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(input, 'text/html').body;
  }

  if (typeof document !== 'undefined') {
    const fallbackDocument = document.implementation.createHTMLDocument('');
    fallbackDocument.body.innerHTML = input;

    return fallbackDocument.body;
  }

  return null;
}

function serializeNarrativeNode(node: ChildNode, state: NarrativeSerializationState): string {
  if (state.remainingCharacters !== null && state.remainingCharacters <= 0) {
    return '';
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = normalizeNarrativeText(node.textContent ?? '');
    const textLength = textContent.length;

    if (state.startOffset >= textLength) {
      state.startOffset -= textLength;

      return '';
    }

    const visibleText = textContent.slice(state.startOffset);
    state.startOffset = 0;

    if (state.remainingCharacters === null) {
      return escapeHtml(visibleText);
    }

    const visibleChunk = visibleText.slice(0, state.remainingCharacters);
    state.remainingCharacters -= visibleChunk.length;

    return escapeHtml(visibleChunk);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (SKIPPED_NARRATIVE_TAGS.has(tagName)) {
    return '';
  }

  if (tagName === 'br') {
    if (state.startOffset > 0) {
      state.startOffset -= 1;

      return '';
    }

    if (state.remainingCharacters !== null) {
      state.remainingCharacters -= 1;
    }

    return '<br>';
  }

  const children = Array.from(element.childNodes)
    .map((childNode) => serializeNarrativeNode(childNode, state))
    .join('');

  if (!ALLOWED_NARRATIVE_TAGS.has(tagName)) {
    return children;
  }

  if (!children) {
    return '';
  }

  return `<${tagName}>${children}</${tagName}>`;
}

function collectNarrativeText(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeNarrativeText(node.textContent ?? '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  if (SKIPPED_NARRATIVE_TAGS.has(tagName)) {
    return '';
  }

  if (tagName === 'br') {
    return '\n';
  }

  const childText = Array.from(element.childNodes)
    .map((childNode) => collectNarrativeText(childNode))
    .join('');

  if (tagName === 'li') {
    return childText ? `${childText}\n` : '';
  }

  if (tagName === 'p') {
    return childText ? `${childText}\n` : '';
  }

  return childText;
}

function fallbackPlainText(input: string) {
  return normalizeNarrativeText(input).replace(/<[^>]*>/g, '');
}

export function sanitizeNarrativeHtml(input: string) {
  const root = createNarrativeRoot(input);

  if (!root) {
    return escapeHtml(normalizeNarrativeText(input));
  }

  return Array.from(root.childNodes)
    .map((node) =>
      serializeNarrativeNode(node, {
        startOffset: 0,
        remainingCharacters: null,
      }))
    .join('');
}

export function truncateNarrativeHtml(input: string, visibleCharacterCount: number) {
  const safeVisibleCharacterCount = Math.max(0, visibleCharacterCount);
  const root = createNarrativeRoot(input);

  if (!root) {
    return escapeHtml(input.slice(0, safeVisibleCharacterCount));
  }

  const state: NarrativeSerializationState = {
    startOffset: 0,
    remainingCharacters: safeVisibleCharacterCount,
  };

  return Array.from(root.childNodes)
    .map((node) => serializeNarrativeNode(node, state))
    .join('');
}

export function sliceNarrativeHtml(input: string, startVisibleCharacterCount: number, endVisibleCharacterCount: number) {
  const safeStartVisibleCharacterCount = Math.max(0, startVisibleCharacterCount);
  const safeEndVisibleCharacterCount = Math.max(safeStartVisibleCharacterCount, endVisibleCharacterCount);
  const root = createNarrativeRoot(input);

  if (!root) {
    return escapeHtml(normalizeNarrativeText(input).slice(
      safeStartVisibleCharacterCount,
      safeEndVisibleCharacterCount,
    ));
  }

  const state: NarrativeSerializationState = {
    startOffset: safeStartVisibleCharacterCount,
    remainingCharacters: safeEndVisibleCharacterCount - safeStartVisibleCharacterCount,
  };

  return Array.from(root.childNodes)
    .map((node) => serializeNarrativeNode(node, state))
    .join('');
}

export function getNarrativePlainText(input: string) {
  const root = createNarrativeRoot(input);

  if (!root) {
    return fallbackPlainText(input);
  }

  return Array.from(root.childNodes)
    .map((node) => collectNarrativeText(node))
    .join('')
    .replace(/\n{3,}/g, '\n\n');
}

export function countNarrativeVisibleCharacters(input: string) {
  return getNarrativePlainText(input).length;
}

export function getNarrativeAccessibleText(input: string) {
  return getNarrativePlainText(input).replace(/\s+/g, ' ').trim();
}

export function prepareDialogueNarrativeHtml(input: string) {
  const normalizedInput = normalizeNarrativeText(input).trim();

  if (!normalizedInput) {
    return '';
  }

  if (BLOCK_NARRATIVE_TAG_PATTERN.test(normalizedInput) || BREAK_NARRATIVE_TAG_PATTERN.test(normalizedInput)) {
    return normalizedInput;
  }

  const paragraphs = normalizedInput
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return normalizedInput.replace(/\n/g, '<br>');
  }

  return paragraphs
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
