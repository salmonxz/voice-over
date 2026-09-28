import { SlideBlock } from './types';
import mammoth from 'mammoth';

/**
 * Parses raw text containing slide markers like 'SLIDE 1', 'SLIDE 2', etc.
 * and converts them into structured SlideBlock objects.
 */
export function parseSlidesFromText(text: string): SlideBlock[] {
  if (!text || typeof text !== 'string') return [];

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  // Pattern matches:
  // SLIDE 1, Slide 1, slide 1, [SLIDE 1], SLIDE 01, SLIDE: 1, Slide 1 - Judul
  const slideHeaderRegex = /(?:^|\n)\s*(?:\[?\s*SLIDE\s*(\d+)\s*\]?|SLIDE\s*(\d+))[:\s-]*/gi;

  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = slideHeaderRegex.exec(normalized)) !== null) {
    matches.push(m);
  }

  // Fallback: If no "SLIDE X" pattern is found, split by double newlines or lines starting with numbers
  if (matches.length === 0) {
    // Try splitting by double line breaks (paragraphs)
    const paragraphs = normalized.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paragraphs.map((content, idx) => {
      const slideNum = idx + 1;
      const firstLine = content.split('\n')[0].trim();
      let title = `Slide ${slideNum}`;
      if (firstLine) {
        const sentenceEnd = firstLine.search(/[.:!?]/);
        if (sentenceEnd > 5 && sentenceEnd <= 70) {
          title = `Slide ${slideNum}: ${firstLine.slice(0, sentenceEnd).trim()}`;
        } else if (firstLine.length <= 60) {
          title = `Slide ${slideNum}: ${firstLine}`;
        } else {
          title = `Slide ${slideNum}: ${firstLine.slice(0, 50).trim()}...`;
        }
      }

      return {
        id: `slide_${slideNum}`,
        slideNumber: slideNum,
        title,
        content: content.trim(),
        isGenerating: false,
      };
    });
  }

  const slides: SlideBlock[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const rawNum = match[1] || match[2];
    const slideNum = rawNum ? parseInt(rawNum, 10) : i + 1;
    const startIdx = match.index + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
    const content = normalized.slice(startIdx, endIdx).trim();

    if (!content) continue;

    // Smart title extraction from the first line or first sentence
    const firstLine = content.split('\n')[0].trim();
    let title = `Slide ${slideNum}`;
    if (firstLine) {
      const sentenceEnd = firstLine.search(/[.:!?]/);
      if (sentenceEnd > 5 && sentenceEnd <= 70) {
        title = `Slide ${slideNum}: ${firstLine.slice(0, sentenceEnd).trim()}`;
      } else if (firstLine.length <= 60) {
        title = `Slide ${slideNum}: ${firstLine}`;
      } else {
        title = `Slide ${slideNum}: ${firstLine.slice(0, 50).trim()}...`;
      }
    }

    slides.push({
      id: `slide_${slideNum}`,
      slideNumber: slideNum,
      title,
      content,
      isGenerating: false,
    });
  }

  return slides;
}

/**
 * Extracts text from a Word (.docx) file and parses into SlideBlock array
 */
export async function parseDocxFile(file: File): Promise<SlideBlock[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  return parseSlidesFromText(rawText);
}

/**
 * Extracts text from a plain text (.txt) file and parses into SlideBlock array
 */
export async function parseTextFile(file: File): Promise<SlideBlock[]> {
  const rawText = await file.text();
  return parseSlidesFromText(rawText);
}
