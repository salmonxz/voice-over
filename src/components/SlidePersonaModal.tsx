'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Laptop,
  Briefcase,
  Radio,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { SlideBlock, PersonaId, GenderType, PersonaPreset } from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';

interface SlidePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideBlock | null;
  globalPersonaId: PersonaId;
  globalGender: GenderType;
  onSaveSlidePersona: (
    slideId: string,
    personaId: PersonaId | undefined,
    gender: GenderType | undefined,
    rate?: number,
    pitch?: number,
    applyToAll?: boolean,
    autoGenerate?: boolean
  ) => void;
}

export const SlidePersonaModal: React.FC<SlidePersonaModalProps> = ({
  isOpen,
  onClose,
  slide,
  globalPersonaId,
  globalGender,
  onSaveSlidePersona,
}) => {
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>(globalPersonaId);
  const [selectedGender, setSelectedGender] = useState<GenderType>(globalGender);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);

  // Sync state when slide changes
  useEffect(() => {
    if (slide) {
      const hasCustom = Boolean(slide.personaId || slide.gender);
      setIsCustom(hasCustom);
      setSelectedPersonaId(slide.personaId || globalPersonaId);
      setSelectedGender(slide.gender || globalGender);
      setRate(slide.rate ?? PERSONA_PRESETS[slide.personaId || globalPersonaId].defaultRate);
      setPitch(slide.pitch ?? PERSONA_PRESETS[slide.personaId || globalPersonaId].defaultPitch);
    }
  }, [slide, globalPersonaId, globalGender]);

  if (!isOpen || !slide) return null;

  const personas = Object.values(PERSONA_PRESETS);

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

  const globalPersona = PERSONA_PRESETS[globalPersonaId];

  const handleSelectPersona = (preset: PersonaPreset) => {
    setSelectedPersonaId(preset.id);
    setRate(preset.defaultRate);
    setPitch(preset.defaultPitch);
  };

  const handleSave = (applyToAll = false, autoGenerate = false) => {
    if (!isCustom) {
      // Revert to global
      onSaveSlidePersona(slide.id, undefined, undefined, undefined, undefined, applyToAll, autoGenerate);
    } else {
      onSaveSlidePersona(slide.id, selectedPersonaId, selectedGender, rate, pitch, applyToAll, autoGenerate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="slide-persona-modal-title">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#181e2b] border border-[#2a3447] text-[#f59e0b]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#181e2b] border border-[#2a3447] px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-300">
                  Slide {slide.slideNumber}
                </span>
                <h2 id="slide-persona-modal-title" className="text-sm font-bold text-slate-100 truncate max-w-md">
                  {slide.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Karakter suara dan tempo khusus untuk bagian slide ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup kustomisasi slide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
          {/* Mode Option Switch: Global vs Custom */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                !isCustom
                  ? 'border-[#f59e0b] bg-[#1e2635] ring-1 ring-[#f59e0b]/50'
                  : 'border-[#262f40] bg-[#181e2b] hover:border-[#38465f]'
              }`}
            >
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-500">
                {!isCustom && <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-xs">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ikuti Karakter Global</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mengikuti profil umum: <strong className="text-slate-200">{globalPersona.name} ({globalGender === 'pria' ? 'Ardi' : 'Gadis'})</strong>
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                isCustom
                  ? 'border-[#f59e0b] bg-[#1e2635] ring-1 ring-[#f59e0b]/50'
                  : 'border-[#262f40] bg-[#181e2b] hover:border-[#38465f]'
              }`}
            >
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-500">
                {isCustom && <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  <span>Kustomisasi Slide Ini</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Atur karakter, gender, dan kecepatan tersendiri untuk slide ini.
                </p>
              </div>
            </button>
          </div>

          {/* If Custom, Show Persona & Voice Options */}
          {isCustom && (
            <div className="space-y-4 rounded-lg border border-[#262f40] bg-[#181e2b] p-4">
              {/* Gender Switcher */}
              <div className="flex items-center justify-between border-b border-[#262f40] pb-3">
                <span className="font-semibold text-slate-200 text-xs">Pilihan Gender Vokal:</span>
                <div className="flex items-center rounded-md bg-[#131722] p-1 border border-[#2a3447]">
                  <button
                    type="button"
                    onClick={() => setSelectedGender('pria')}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedGender === 'pria'
                        ? 'bg-[#222938] text-white border border-[#3f4d67]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="h-3 w-3" />
                    <span>Pria (Ardi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGender('wanita')}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedGender === 'wanita'
                        ? 'bg-[#222938] text-white border border-[#3f4d67]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="h-3 w-3" />
                    <span>Wanita (Gadis)</span>
                  </button>
                </div>
              </div>

              {/* Persona Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {personas.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleSelectPersona(persona)}
                      className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-[#f59e0b] bg-[#1e2635] ring-1 ring-[#f59e0b]/50'
                          : 'border-[#262f40] bg-[#131722] hover:border-[#38465f]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#181e2b] border border-[#2a3447]">
                            {getPersonaIcon(persona.id)}
                          </div>
                          <span className="rounded bg-[#181e2b] border border-[#2a3447] px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                            {persona.badge}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-100 text-xs">{persona.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {persona.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-[#f59e0b]">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Karakter Dipilih</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sliders: Rate & Pitch for this slide */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#262f40] pt-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Kecepatan (Tempo):</span>
                    <span className="font-mono text-slate-200 font-semibold">{Math.round(rate * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.02"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-[#f59e0b] h-1.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Tinggi Nada (Pitch):</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {pitch > 0 ? `+${pitch}` : pitch} st
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={pitch}
                    onChange={(e) => setPitch(parseInt(e.target.value, 10))}
                    className="w-full accent-[#f59e0b] h-1.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#2a3447] px-6 py-3.5 bg-[#131722]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#2a3447] bg-[#181e2b] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#222938] transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true, false)}
              className="rounded-md border border-[#2a3447] bg-[#181e2b] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#222938] transition-colors"
              title="Terapkan pengaturan karakter ini ke seluruh slide"
            >
              Terapkan ke Semua
            </button>
            <button
              type="button"
              onClick={() => handleSave(false, false)}
              className="rounded-md border border-[#3f4d67] bg-[#1e2635] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#2b3548] transition-colors"
              title="Simpan pengaturan karakter tanpa memproses audio sekarang"
            >
              Simpan Saja
            </button>
            <button
              type="button"
              onClick={() => handleSave(false, true)}
              className="flex items-center gap-1.5 rounded-md bg-[#f59e0b] px-4 py-1.5 text-xs font-bold text-[#0c0e14] hover:bg-[#d97706] transition-colors shadow-sm"
              title="Simpan pengaturan karakter dan langsung generate audio baru untuk slide ini"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Simpan & Generate Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
