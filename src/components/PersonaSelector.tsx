'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, CheckCircle2, GraduationCap, Laptop, Briefcase, Radio, Sliders, Play, Square, Volume2 } from 'lucide-react';
import { PersonaId, GenderType, PersonaPreset } from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';
import { PERSONA_SAMPLE_AUDIOS } from '@/lib/persona-samples';

interface PersonaSelectorProps {
  selectedPersonaId: PersonaId;
  selectedGender: GenderType;
  onSelectPersona: (preset: PersonaPreset) => void;
  onSelectGender: (gender: GenderType) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  selectedGender,
  onSelectPersona,
  onSelectGender,
}) => {
  const personas = Object.values(PERSONA_PRESETS);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingPersonaId, setPlayingPersonaId] = useState<PersonaId | null>(null);

  // Stop sample audio when gender changes or component unmounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingPersonaId(null);
  }, [selectedGender]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleSample = (personaId: PersonaId, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this persona, stop it
    if (playingPersonaId === personaId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingPersonaId(null);
      return;
    }

    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const sampleKey = `${personaId}_${selectedGender}`;
    const audioDataUrl = PERSONA_SAMPLE_AUDIOS[sampleKey];

    if (!audioDataUrl) {
      console.warn('Sample audio not found for:', sampleKey);
      return;
    }

    const audio = new Audio(audioDataUrl);
    audioRef.current = audio;
    setPlayingPersonaId(personaId);

    audio.onended = () => {
      setPlayingPersonaId(null);
    };

    audio.onerror = () => {
      setPlayingPersonaId(null);
    };

    audio.play().catch((err) => {
      console.warn('Audio play error:', err);
      setPlayingPersonaId(null);
    });
  };

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'pitch_magang':
        return <GraduationCap className="h-4 w-4 text-[#f59e0b]" />;
      case 'tutorial_demo':
        return <Laptop className="h-4 w-4 text-emerald-400" />;
      case 'executive':
        return <Briefcase className="h-4 w-4 text-sky-400" />;
      case 'casual_podcast':
        return <Radio className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <section aria-labelledby="persona-heading" className="rounded-xl border border-[#2a3447] bg-[#131722] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#f59e0b]" />
            <h2 id="persona-heading" className="text-sm font-semibold tracking-wide text-slate-200">
              Karakter & Profil Suara
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Setiap karakter memiliki tempo, tinggi nada, dan ekspresi vokal yang khas. Klik <strong>Dengar Contoh</strong> untuk menguji suaranya langsung.
          </p>
        </div>

        {/* Gender Segmented Switcher */}
        <div className="flex items-center rounded-lg bg-[#0c0e14] p-1 border border-[#2a3447]" role="group" aria-label="Pilihan Suara Pria atau Wanita">
          <button
            type="button"
            onClick={() => onSelectGender('pria')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedGender === 'pria'
                ? 'bg-[#222938] text-white shadow-sm border border-[#3f4d67]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={selectedGender === 'pria'}
          >
            <User className="h-3.5 w-3.5 text-slate-300" />
            <span>Pria (Ardi)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectGender('wanita')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedGender === 'wanita'
                ? 'bg-[#222938] text-white shadow-sm border border-[#3f4d67]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={selectedGender === 'wanita'}
          >
            <User className="h-3.5 w-3.5 text-slate-300" />
            <span>Wanita (Gadis)</span>
          </button>
        </div>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {personas.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          const isPlaying = playingPersonaId === persona.id;
          const pitchStr = persona.defaultPitch > 0 ? `+${persona.defaultPitch}` : `${persona.defaultPitch}`;

          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className={`group flex flex-col justify-between rounded-lg border p-3.5 text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[#f59e0b] bg-[#1e2635] ring-1 ring-[#f59e0b]/60'
                  : 'border-[#262f40] bg-[#181e2b] hover:border-[#38465f] hover:bg-[#1b2230]'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPersona(persona);
                }
              }}
              aria-pressed={isSelected}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#131722] border border-[#2a3447]">
                    {getPersonaIcon(persona.id)}
                  </div>
                  <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-[#131722] text-slate-300 border border-[#2a3447]">
                    {persona.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
                  <span>{persona.name}</span>
                </h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {persona.description}
                </p>

                {/* Instant Audio Sample Preview Button */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => handleToggleSample(persona.id, e)}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                      isPlaying
                        ? 'border-rose-500/60 bg-rose-950/40 text-rose-300'
                        : 'border-[#2a3447] bg-[#131722] text-slate-200 hover:border-[#f59e0b]/50 hover:bg-[#1f2533] hover:text-[#f59e0b]'
                    }`}
                    title={`Putar contoh suara ${persona.name}`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="h-3 w-3 fill-current text-rose-400" />
                        <span>Hentikan Contoh</span>
                        <span className="flex items-end gap-0.5 h-3 ml-1">
                          <span className="w-0.5 h-3 bg-rose-400 animate-pulse"></span>
                          <span className="w-0.5 h-1.5 bg-rose-400 animate-pulse delay-75"></span>
                          <span className="w-0.5 h-2.5 bg-rose-400 animate-pulse delay-150"></span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current text-[#f59e0b]" />
                        <span>Dengar Contoh Suara</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-[#262f40] pt-2.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Tempo: <strong className="font-mono font-medium text-slate-200">{Math.round(persona.defaultRate * 100)}%</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Pitch: <strong className="font-mono font-medium text-slate-200">{pitchStr}st</strong></span>
                </div>
                {isSelected ? (
                  <span className="flex items-center gap-1 font-medium text-[#f59e0b]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aktif
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-slate-200">Pilih</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
