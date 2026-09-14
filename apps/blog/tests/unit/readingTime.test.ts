/**
 * @file tests/unit/readingTime.test.ts
 * @description Unit tests for the reading time calculator utility.
 * 
 * POC / Implementation Details:
 * - Accurately estimates read duration based on standard reading speed (200 wpm).
 * - Parses and extracts plain text from heterogeneous inputs: raw markdown, HTML markup,
 *   and structured Editor.js block JSON trees.
 * - Why this implementation is best: Provides readers with an accurate, consistent time estimate
 *   regardless of whether content is raw text or block JSON, without throwing exceptions.
 */

import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from '../../src/lib/readingTime';

describe('calculateReadingTime()', () => {
  it('returns default minimum read time for empty or null content', () => {
    expect(calculateReadingTime('')).toBe('1 min read');
    expect(calculateReadingTime('   ')).toBe('1 min read');
  });

  it('calculates reading time for short plain text', () => {
    const text = 'This is a brief article about modern edge web applications.';
    expect(calculateReadingTime(text)).toBe('1 min read');
  });

  it('calculates reading time for long plain text (>200 words)', () => {
    const words = Array(500).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe('3 min read');
  });

  it('strips HTML tags before counting words', () => {
    const html = `
      <article>
        <h1>My Article</h1>
        <p>This is a <strong>formatted</strong> paragraph with <a href="#">links</a>.</p>
      </article>
    `;
    expect(calculateReadingTime(html)).toBe('1 min read');
  });

  it('correctly extracts and counts words from Editor.js JSON blocks', () => {
    const editorJson = JSON.stringify({
      time: 1710000000000,
      blocks: [
        { type: 'header', data: { text: 'Edge Computing' } },
        { type: 'paragraph', data: { text: 'Running code on Cloudflare edge workers worldwide.' } },
        { type: 'list', data: { items: ['Zero cold starts', 'Extreme speed', 'Global cache'] } },
        { type: 'code', data: { code: 'const edge = true;' } },
      ],
    });

    expect(calculateReadingTime(editorJson)).toBe('1 min read');

    // 450 words spread across multiple blocks
    const longBlocks = Array(15).fill(0).map((_, i) => ({
      type: 'paragraph',
      data: { text: Array(30).fill('sampleword').join(' ') },
    }));

    const longEditorJson = JSON.stringify({ blocks: longBlocks });
    expect(calculateReadingTime(longEditorJson)).toBe('3 min read');
  });

  it('gracefully handles malformed JSON without crashing', () => {
    const malformed = '{ invalid json blocks: ';
    expect(calculateReadingTime(malformed)).toBe('1 min read');
  });
});
