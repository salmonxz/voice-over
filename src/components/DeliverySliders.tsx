'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Volume2,
  Gauge,
  Play,
  Square,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DeliverySettings, GenderType } from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';

interface DeliverySlidersProps {
  settings: DeliverySettings;
  onChange: (updated: Partial<DeliverySettings>) => void;
  activeGender?: GenderType;
  onRegenerateActive?: () => void;
  isGenerating?: boolean;
}

export const DeliverySliders: React.FC<DeliverySlidersProps> = ({
  settings,
  onChange,
  activeGender = 'pria',
  onRegenerateActive,
  isGenerating = false,
}) => {
  const currentPersona = PERSONA_PRESETS[settings.personaId];

  // State for live audio preview
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleReset = () => {
    if (currentPersona) {
      onChange({
        rate: currentPersona.defaultRate,
        pitch: currentPersona.defaultPitch,
        volume: 100,
        pauseDurationMs: currentPersona.pauseDurationMs,
      });
    }
  };

  // Live test preview of current slider parameters
  const handleTestAudio = async () => {
    if (isPlayingTest) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingTest(false);
      return;
    }

    try {
      setIsLoadingTest(true);
      const voice = activeGender === 'pria' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural';
      const sampleText = 'Ini adalah uji coba kecepatan bicara, tinggi nada, dan volume suara yang Anda atur.';

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voice,
          rate: settings.rate,
          pitch: settings.pitch,
          volume: settings.volume ?? 100,
          pauseDurationMs: settings.pauseDurationMs,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Gagal memuat uji suara');
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(data.audioBase64);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingTest(false);
      };
      audio.onerror = () => {
        setIsPlayingTest(false);
      };

      await audio.play();
      setIsPlayingTest(true);
    } catch (err) {
      console.error('Audio test preview error:', err);
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <section aria-labelledby="tuning-heading" className="rounded-xl border border-[#2a3447] bg-[#131722] p-5 shadow-lg">
      {/* Header with Title and Quick Actions */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#232b3b] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 id="tuning-heading" className="text-sm font-semibold tracking-wide text-slate-100">
              Parameter Suara & Intonasi
            </h2>
            <p className="text-[11px] text-slate-400">
              Pengaturan vokal Microsoft Edge Neural TTS secara real-time
            </p>
          </div>
        </div>

        {/* Toolbar: Test Voice Preview & Reset */}
        <div className="flex items-center gap-2">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={handleTestAudio}
            disabled={isLoadingTest}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm ${
              isPlayingTest
                ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 animate-pulse'
                : 'border border-[#f59e0b]/40 bg-[#f59e0b]/15 text-amber-400 hover:bg-[#f59e0b]/25 hover:border-[#f59e0b]'
            }`}
            title="Dengarkan langsung kombinasi kecepatan, nada, dan volume ini"
          >
            {isLoadingTest ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPlayingTest ? (
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>
              {isLoadingTest
                ? 'Menyiapkan...'
                : isPlayingTest
                ? 'Hentikan Contoh'
                : 'Uji Suara Parameter'}
            </span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-[#2a3447] bg-[#181e2b] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-[#222938] hover:text-white"
            title="Kembalikan semua parameter ke nilai bawaan persona ini"
          >
            <RotateCcw className="h-3 w-3 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Real-time Prosody Sliders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Speaking Rate (Speed) */}
        <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 transition-all hover:border-[#3b475e]">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <label htmlFor="slider-rate" className="flex items-center gap-1.5 font-medium text-slate-200">
              <Gauge className="h-3.5 w-3.5 text-amber-400" />
              Kecepatan Bicara
            </label>
            <span className="font-mono text-xs font-semibold text-amber-400 bg-[#0c0e14] px-2 py-0.5 rounded border border-[#2a3447]">
              {Math.round(settings.rate * 100)}%
            </span>
          </div>
          <input
            id="slider-rate"
            type="range"
            min="0.70"
            max="1.40"
            step="0.05"
            value={settings.rate}
            onChange={(e) => onChange({ rate: parseFloat(e.target.value) })}
            className="w-full accent-[#f59e0b] cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>0.70x (Tenang)</span>
            <span>1.0x (Normal)</span>
            <span>1.40x (Cepat)</span>
          </div>
        </div>

        {/* 2. Pitch (Tinggi Nada) */}
        <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 transition-all hover:border-[#3b475e]">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <label htmlFor="slider-pitch" className="flex items-center gap-1.5 font-medium text-slate-200">
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              Tinggi Nada (Pitch)
            </label>
            <span className="font-mono text-xs font-semibold text-sky-400 bg-[#0c0e14] px-2 py-0.5 rounded border border-[#2a3447]">
              {settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch} st
            </span>
          </div>
          <input
            id="slider-pitch"
            type="range"
            min="-6"
            max="6"
            step="1"
            value={settings.pitch}
            onChange={(e) => onChange({ pitch: parseInt(e.target.value, 10) })}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>-6st (Ngebass)</span>
            <span>0st (Natural)</span>
            <span>+6st (Tinggi)</span>
          </div>
        </div>

        {/* 3. Volume Suara (Intensitas) */}
        <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 transition-all hover:border-[#3b475e]">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <label htmlFor="slider-volume" className="flex items-center gap-1.5 font-medium text-slate-200">
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              Volume Suara
            </label>
            <span className="font-mono text-xs font-semibold text-emerald-400 bg-[#0c0e14] px-2 py-0.5 rounded border border-[#2a3447]">
              {settings.volume ?? 100}%
            </span>
          </div>
          <input
            id="slider-volume"
            type="range"
            min="60"
            max="140"
            step="5"
            value={settings.volume ?? 100}
            onChange={(e) => onChange({ volume: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>60% (Lembut)</span>
            <span>100% (Standar)</span>
            <span>140% (Tegas)</span>
          </div>
        </div>

        {/* 4. Pause Duration (Jeda Antar Kalimat) */}
        <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 transition-all hover:border-[#3b475e]">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <label htmlFor="slider-pause" className="flex items-center gap-1.5 font-medium text-slate-200">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              Jeda Antar Kalimat
            </label>
            <span className="font-mono text-xs font-semibold text-purple-400 bg-[#0c0e14] px-2 py-0.5 rounded border border-[#2a3447]">
              {settings.pauseDurationMs} ms
            </span>
          </div>
          <input
            id="slider-pause"
            type="range"
            min="200"
            max="1200"
            step="50"
            value={settings.pauseDurationMs}
            onChange={(e) => onChange({ pauseDurationMs: parseInt(e.target.value, 10) })}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>200ms (Rapat)</span>
            <span>450ms (Standar)</span>
            <span>1200ms (Leluasa)</span>
          </div>
        </div>
      </div>

      {/* Helpful Guidance Notice & Quick Apply */}
      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[#232b3b] bg-[#0c0e14] p-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#f59e0b] shrink-0" />
          <span>
            Gunakan tombol <strong className="text-amber-400 font-semibold">&quot;Uji Suara Parameter&quot;</strong> di atas untuk mendengar pratinjau. Setelah cocok, klik <strong className="text-slate-100 font-semibold">&quot;Generate Ulang&quot;</strong> pada slide untuk memperbarui audio.
          </span>
        </div>

        {onRegenerateActive && (
          <button
            type="button"
            onClick={onRegenerateActive}
            disabled={isGenerating}
            className="shrink-0 flex items-center justify-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-[#222938] hover:border-amber-500/40 transition-colors disabled:opacity-50"
            title="Generate ulang slide aktif dengan parameter ini"
          >
            <RotateCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Memproses...' : 'Terapkan ke Slide Aktif'}</span>
          </button>
        )}
      </div>
    </section>
  );
};
