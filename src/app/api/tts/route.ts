import { NextRequest, NextResponse } from 'next/server';
import { generateEdgeAudio } from '@/lib/edge-tts';
import { applyGlossary, DEFAULT_GLOSSARY } from '@/lib/glossary';
import { estimateSrtFromTextAndDuration } from '@/lib/srt-generator';
import { GlossaryEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voice = 'id-ID-ArdiNeural',
      rate = 1.0,
      pitch = 0,
      volume = 100,
      pauseDurationMs = 400,
      glossary = DEFAULT_GLOSSARY,
      slideId,
    } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Teks naskah tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // 1. Preprocess text with pronunciation glossary
    const preprocessedText = applyGlossary(text, glossary as GlossaryEntry[]);

    // 2. Synthesize audio with Microsoft Edge Neural TTS (Native & Free)
    const { buffer: audioBuffer, mimeType } = await generateEdgeAudio(preprocessedText, {
      voice,
      rate: Number(rate) || 1.0,
      pitch: Number(pitch) || 0,
      volume: Number(volume) || 100,
      pauseDurationMs: Number(pauseDurationMs) || 400,
    });

    // 3. Estimate duration from MP3 buffer size / word count
    // 96kbps MP3 = 12000 bytes/sec
    const durationSeconds = Math.max(1, Math.round((audioBuffer.length / 12000) * 10) / 10);

    // 4. Generate synchronized SRT subtitle
    const srtContent = estimateSrtFromTextAndDuration(text, durationSeconds);

    const base64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      audioBase64: audioDataUrl,
      format: 'mp3',
      durationSeconds,
      srtContent,
      slideId,
      processedText: preprocessedText,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('TTS API error:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal menghasilkan voice-over. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

