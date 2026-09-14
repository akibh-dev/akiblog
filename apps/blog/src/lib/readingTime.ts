export function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';

  let textToCount = content;

  // If content is Editor.js JSON string, extract plain text from blocks
  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.blocks)) {
        textToCount = parsed.blocks
          .map((b: any) => {
            if (b.data?.text) return b.data.text;
            if (Array.isArray(b.data?.items)) return b.data.items.join(' ');
            if (b.data?.code) return b.data.code;
            return '';
          })
          .join(' ');
      }
    }
  } catch {
    // If parsing fails, fall back to counting words in raw string
  }

  // Strip HTML tags if any
  const cleanText = textToCount.replace(/<[^>]*>?/gm, ' ').trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
}
