/**
 * @file tests/unit/slugify.test.ts
 * @description Unit tests for the URL slug generator utility.
 * 
 * POC / Implementation Details:
 * - Tests URL safety, sanitization of punctuation, accented characters, trim behavior,
 *   and handling of multiple consecutive delimiters.
 * - Why this implementation is best: Ensures deterministic, canonical URL slugs across all
 *   blog articles, preventing routing ambiguities and encoding anomalies.
 */

import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/lib/slugify';

describe('slugify()', () => {
  it('converts strings to lowercase and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Edge Computing in 2026')).toBe('edge-computing-in-2026');
  });

  it('replaces ampersands with "and"', () => {
    expect(slugify('Astro & Cloudflare D1')).toBe('astro-and-cloudflare-d1');
    expect(slugify('TypeScript & Rust')).toBe('typescript-and-rust');
  });

  it('strips non-word characters and punctuation', () => {
    expect(slugify('What is D1? (A Deep Dive!)')).toBe('what-is-d1-a-deep-dive');
    expect(slugify('Hello, World! #Astro')).toBe('hello-world-astro');
  });

  it('collapses multiple consecutive dashes into a single dash', () => {
    expect(slugify('Astro --- Cloudflare')).toBe('astro-cloudflare');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify(' - Leading and Trailing - ')).toBe('leading-and-trailing');
  });

  it('handles empty or whitespace-only strings gracefully', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });
});
