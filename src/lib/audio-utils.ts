import JSZip from 'jszip';
import { SlideBlock } from './types';

/**
 * Converts a base64 or DataURL to an ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Triggers a direct browser file download
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads a text file (like .SRT)
 */
export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

/**
 * Converts an AudioBuffer to WAV format ArrayBuffer
 */
export function audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = audioBuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return out.buffer;
}

/**
 * Bundles multiple slide audio files into a single downloadable ZIP
 */
export async function downloadSlidesZip(
  slides: SlideBlock[],
  combinedSrt?: string,
  projectName: string = 'IndoVoice_Magang_Deck'
) {
  const zip = new JSZip();
  const folder = zip.folder(projectName) || zip;

  for (const slide of slides) {
    if (slide.audioUrl) {
      const buffer = dataUrlToArrayBuffer(slide.audioUrl);
      const safeTitle = slide.title.replace(/[^a-z0-9_-]/gi, '_') || `Slide_${slide.slideNumber}`;
      const filename = `Slide_${String(slide.slideNumber).padStart(2, '0')}_${safeTitle}.mp3`;
      folder.file(filename, buffer);
    }
  }

  if (combinedSrt) {
    folder.file(`${projectName}_subtitles.srt`, combinedSrt);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, `${projectName}_Audio_Deck.zip`);
}

/**
 * Merges multiple audio URLs into a single continuous AudioBuffer
 */
export async function mergeAudioBuffers(
  audioUrls: string[],
  gapSeconds: number = 0.5
): Promise<Blob> {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  const decodedBuffers: AudioBuffer[] = [];
  for (const url of audioUrls) {
    const arrayBuffer = dataUrlToArrayBuffer(url);
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    decodedBuffers.push(decoded);
  }

  if (decodedBuffers.length === 0) {
    throw new Error('Tidak ada audio untuk digabungkan.');
  }

  const sampleRate = decodedBuffers[0].sampleRate;
  const numberOfChannels = decodedBuffers[0].numberOfChannels;
  const gapSamples = Math.floor(gapSeconds * sampleRate);

  let totalSamples = 0;
  for (let i = 0; i < decodedBuffers.length; i++) {
    totalSamples += decodedBuffers[i].length;
    if (i < decodedBuffers.length - 1) {
      totalSamples += gapSamples;
    }
  }

  const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalSamples, sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = mergedBuffer.getChannelData(channel);
    let currentOffset = 0;

    for (let i = 0; i < decodedBuffers.length; i++) {
      const buf = decodedBuffers[i];
      const sourceChannel = channel < buf.numberOfChannels ? buf.getChannelData(channel) : buf.getChannelData(0);
      channelData.set(sourceChannel, currentOffset);
      currentOffset += buf.length;

      if (i < decodedBuffers.length - 1) {
        currentOffset += gapSamples;
      }
    }
  }

  const wavArrayBuffer = audioBufferToWav(mergedBuffer);
  return new Blob([wavArrayBuffer], { type: 'audio/wav' });
}
