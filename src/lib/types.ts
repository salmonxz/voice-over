export type EngineType = 'edge';

export type GenderType = 'pria' | 'wanita';

export type PersonaId = 'pitch_magang' | 'tutorial_demo' | 'executive' | 'casual_podcast';

export interface PersonaPreset {
  id: PersonaId;
  name: string;
  badge: string;
  description: string;
  gender: GenderType;
  voiceId: string; // id-ID-ArdiNeural or id-ID-GadisNeural
  defaultRate: number; // e.g. 1.0 (100%)
  defaultPitch: number; // e.g. 0Hz or semitones
  expressiveness: number; // 0-100
  naturalness: number; // 0-100
  pauseDurationMs: number; // pause between sentences/paragraphs
  samplePhrase?: string;
}

export interface SlideBlock {
  id: string;
  slideNumber: number;
  title: string;
  content: string;
  audioUrl?: string;
  audioDuration?: number;
  isGenerating?: boolean;
  personaId?: PersonaId;
  gender?: GenderType;
  voiceId?: string;
  rate?: number;
  pitch?: number;
}

export interface GlossaryEntry {
  id: string;
  original: string;
  replacement: string;
  category: 'tech' | 'business' | 'indonesian' | 'custom';
  enabled: boolean;
}

export interface DeliverySettings {
  engine: EngineType;
  personaId: PersonaId;
  gender: GenderType;
  voiceId: string;
  rate: number; // 0.5 to 2.0 (1.0 default)
  pitch: number; // -10 to +10 semitones (0 default)
  volume?: number; // 50 to 150 (100 default)
  pauseDurationMs: number; // 100 to 2000 ms
  naturalness?: number; // legacy
  expressiveness?: number; // legacy
}

export interface AudioGenerationResult {
  audioBase64: string;
  format: 'mp3' | 'wav';
  durationSeconds?: number;
  srtContent?: string;
  slideId?: string;
}

