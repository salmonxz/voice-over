export interface SubtitleCue {
  index: number;
  startTimeSec: number;
  endTimeSec: number;
  text: string;
}

/**
 * Formats seconds into SRT timestamp format: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(seconds: number): string {
  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

/**
 * Generates an SRT string from an array of cues
 */
export function generateSrtContent(cues: SubtitleCue[]): string {
  return cues
    .map(cue => {
      return `${cue.index}\n${formatSrtTimestamp(cue.startTimeSec)} --> ${formatSrtTimestamp(cue.endTimeSec)}\n${cue.text}\n`;
    })
    .join('\n');
}

/**
 * Splits text into natural sentence cues and estimates timing based on total duration
 */
export function estimateSrtFromTextAndDuration(text: string, totalDurationSec: number): string {
  // Strip inline markup tags for subtitle display
  const cleanText = text
    .replace(/\[pause:[^\]]+\]/gi, '')
    .replace(/\[emphasis\](.*?)\[\/emphasis\]/gi, '$1')
    .replace(/\[whisper\](.*?)\[\/whisper\]/gi, '$1')
    .replace(/\[jeda:[^\]]+\]/gi, '')
    .trim();

  // Split into sentences or thought clauses
  const sentences = cleanText
    .split(/(?<=[.?!:\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) return '';

  // Calculate proportional timing based on character count
  const totalChars = sentences.reduce((acc, s) => acc + s.length, 0);
  let currentTime = 0;
  const cues: SubtitleCue[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const duration = (s.length / totalChars) * totalDurationSec;
    const startTime = currentTime;
    const endTime = Math.min(totalDurationSec, startTime + duration);

    cues.push({
      index: i + 1,
      startTimeSec: startTime,
      endTimeSec: endTime,
      text: s
    });

    currentTime = endTime;
  }

  return generateSrtContent(cues);
}
