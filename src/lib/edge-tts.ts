import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { Readable } from 'stream';

export interface EdgeTtsOptions {
  voice: string;
  rate?: number; // 0.5 to 2.0 (1.0 default)
  pitch?: number; // -10 to 10 (0 default)
  volume?: number; // 50 to 150 (100 default)
  pauseDurationMs?: number; // default 400
}

/**
 * Converts inline pseudo-tags to SSML tags
 */
export function convertTextToSSML(
  text: string,
  voice: string,
  options: EdgeTtsOptions
): string {
  const { rate = 1.0, pitch = 0, volume = 100, pauseDurationMs = 400 } = options;

  // Convert rate to SSML percentage format (e.g. 1.05 -> "+5%", 0.9 -> "-10%")
  const ratePercent = Math.round((rate - 1.0) * 100);
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

  // Convert pitch to SSML semitone or Hz format (e.g. +2 -> "+2st", -1 -> "-1st")
  const pitchStr = pitch >= 0 ? `+${pitch}st` : `${pitch}st`;

  // Convert volume to SSML percentage format (e.g. 120 -> "+20%", 80 -> "-20%")
  const volumePercent = Math.round(volume - 100);
  const volumeStr = volumePercent >= 0 ? `+${volumePercent}%` : `${volumePercent}%`;

  // Pre-process text to replace user inline tags and linebreaks with natural speech cadence
  // NOTE: Microsoft Edge TTS free endpoint strictly rejects nested XML tags like <break>, <emphasis>,
  // or <mstts:express-as>, closing the websocket with "Stream closed before the synthesis completed".
  // Natural neural breath pauses are created via punctuation (ellipses & commas) and clean spacing.
  let processed = text
    // Replace [pause:...] or [jeda:...] with natural speech cadence
    .replace(/\[(?:pause|jeda):\s*([0-9]+)\s*(ms|s)?\]/gi, ' ... ')
    // Strip inline formatting tags so they don't break XML
    .replace(/\[(?:emphasis|penekanan)\](.*?)\[\/(?:emphasis|penekanan)\]/gi, '$1')
    .replace(/\[(?:whisper|bisik)\](.*?)\[\/(?:whisper|bisik)\]/gi, '$1')
    // Double line breaks (paragraph gap) -> natural thought breath pause (ellipsis)
    .replace(/\n\s*\n/g, ' ... ')
    // Single line break -> gentle breathing comma pause
    .replace(/\n/g, ', ')
    // Convert bare ampersands to Indonesian word 'dan' to prevent XML entity failure
    .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, ' dan ')
    // Escape XML special characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="id-ID">
  <voice name="${voice}">
    <prosody rate="${rateStr}" pitch="${pitchStr}" volume="${volumeStr}">
      ${processed}
    </prosody>
  </voice>
</speak>`.trim();

  return ssml;
}

/**
 * Streams audio from Edge TTS and buffers into a Node.js Buffer
 */
async function streamToBuffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    readable.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    readable.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readable.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generates Indonesian neural audio using Microsoft Edge TTS
 */
export async function generateEdgeAudio(
  rawText: string,
  options: EdgeTtsOptions
): Promise<{ buffer: Buffer; mimeType: string }> {
  const voice = options.voice || 'id-ID-ArdiNeural';
  const tts = new MsEdgeTTS();
  
  // High quality MP3 24khz 96kbps (crystal clear voice, optimal payload)
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const ssml = convertTextToSSML(rawText, voice, options);
  
  try {
    const streamObj = tts.rawToStream(ssml);
    const buffer = await streamToBuffer(streamObj.audioStream);
    return {
      buffer,
      mimeType: 'audio/mpeg',
    };
  } catch (error) {
    // If SSML parsing failed on Edge side due to user formatting, fallback to raw text synthesis
    console.warn('SSML synthesis fallback to plain text due to:', error);
    
    // Clean all brackets from text
    const plainText = rawText
      .replace(/\[.*?\]/g, '')
      .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, ' dan ')
      .trim();
    const ratePercent = Math.round(((options.rate || 1.0) - 1.0) * 100);
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    const pitchStr = (options.pitch || 0) >= 0 ? `+${options.pitch || 0}st` : `${options.pitch || 0}st`;
    const volumePercent = Math.round(((options.volume || 100) - 100));
    const volumeStr = volumePercent >= 0 ? `+${volumePercent}%` : `${volumePercent}%`;

    const fallbackTts = new MsEdgeTTS();
    await fallbackTts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const fallbackStreamObj = fallbackTts.toStream(plainText, {
      rate: rateStr,
      pitch: pitchStr,
      volume: volumeStr,
    });
    const buffer = await streamToBuffer(fallbackStreamObj.audioStream);
    return {
      buffer,
      mimeType: 'audio/mpeg',
    };
  }
}
