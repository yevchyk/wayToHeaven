import { expect, it } from 'vitest';

import {
  countNarrativeVisibleCharacters,
  getNarrativeAccessibleText,
  getNarrativePlainText,
  prepareDialogueNarrativeHtml,
  sanitizeNarrativeHtml,
  sliceNarrativeHtml,
  truncateNarrativeHtml,
} from '@engine/utils/narrativeHtml';

describe('narrativeHtml', () => {
  const source =
    'Before <strong>signal</strong><br><script>alert(1)</script><p>After <em>echo</em>.</p>';

  it('sanitizes authored narrative html with a safe tag subset', () => {
    expect(sanitizeNarrativeHtml(source)).toBe(
      'Before <strong>signal</strong><br><p>After <em>echo</em>.</p>',
    );
  });

  it('extracts readable plain text and accessible text', () => {
    expect(getNarrativePlainText(source)).toBe('Before signal\nAfter echo.\n');
    expect(getNarrativeAccessibleText(source)).toBe('Before signal After echo.');
    expect(countNarrativeVisibleCharacters(source)).toBe('Before signal\nAfter echo.\n'.length);
  });

  it('prepares dialogue plain text into paragraphs and line breaks', () => {
    const plainTextSource = 'First line\nSecond line\n\nThird line';
    const prepared = prepareDialogueNarrativeHtml(plainTextSource);

    expect(prepared).toBe('<p>First line<br>Second line</p><p>Third line</p>');
    expect(getNarrativePlainText(prepared)).toBe('First line\nSecond line\nThird line\n');
  });

  it('slices html by visible characters without breaking inline markup', () => {
    const sliced = sliceNarrativeHtml(source, 7, 14);

    expect(sanitizeNarrativeHtml(sliced)).toBe('<strong>signal</strong><br>');
    expect(getNarrativePlainText(sliced)).toBe('signal\n');
  });

  it('truncates html by visible characters instead of raw markup length', () => {
    const truncated = truncateNarrativeHtml(source, 14);

    expect(sanitizeNarrativeHtml(truncated)).toBe('Before <strong>signal</strong><br>');
    expect(getNarrativePlainText(truncated)).toBe('Before signal\n');
  });
});
