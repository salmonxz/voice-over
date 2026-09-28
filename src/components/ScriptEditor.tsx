'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Layers,
  Plus,
  Trash2,
  Clock,
  Volume2,
  Play,
  Square,
  RotateCcw,
  Download,
  UserCheck,
  SlidersHorizontal,
  FileCode,
  Check,
  Sparkles,
} from 'lucide-react';
import { SlideBlock, PersonaId, GenderType, GlossaryEntry } from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';
import { applyGlossary, findGlossaryMatches } from '@/lib/glossary';
import { SlidePersonaModal } from './SlidePersonaModal';

interface ScriptEditorProps {
  mode: 'single' | 'deck';
  setMode: (mode: 'single' | 'deck') => void;
  singleText: string;
  setSingleText: (val: string) => void;
  slides: SlideBlock[];
  setSlides: React.Dispatch<React.SetStateAction<SlideBlock[]>>;
  onGenerateSingle: () => void;
  onGenerateSlide: (slideId: string) => void;
  onGenerateAllSlides: () => void;
  isGenerating: boolean;
  activeSlideId: string | null;
  setActiveSlideId: (id: string | null) => void;
  onPlaySlideAudio: (url: string, title: string) => void;
  onRestoreDefaultSlides?: () => void;
  onExportProject?: () => void;
  onOpenImportDocx?: () => void;
  globalPersonaId: PersonaId;
  globalGender: GenderType;
  glossary?: GlossaryEntry[];
  onUpdateSlidePersona: (
    slideId: string,
    personaId?: PersonaId,
    gender?: GenderType,
    rate?: number,
    pitch?: number,
    applyToAll?: boolean,
    autoGenerate?: boolean
  ) => void;
  onScrollToPersonaSelector?: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  mode,
  setMode,
  singleText,
  setSingleText,
  slides,
  setSlides,
  onGenerateSingle,
  onGenerateSlide,
  onGenerateAllSlides,
  isGenerating,
  onPlaySlideAudio,
  onRestoreDefaultSlides,
  onExportProject,
  onOpenImportDocx,
  globalPersonaId,
  globalGender,
  glossary = [],
  onUpdateSlidePersona,
  onScrollToPersonaSelector,
}) => {
  const singleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [personaModalSlide, setPersonaModalSlide] = useState<SlideBlock | null>(null);
  const [previewSpokenSingle, setPreviewSpokenSingle] = useState(false);
  const [previewSpokenSlideIds, setPreviewSpokenSlideIds] = useState<Record<string, boolean>>({});

  // Instant inline slide audio playback (plays immediately without scrolling down)
  const [playingSlideId, setPlayingSlideId] = useState<string | null>(null);
  const slideAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up inline audio on unmount
  useEffect(() => {
    return () => {
      if (slideAudioRef.current) {
        slideAudioRef.current.pause();
        slideAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayInlineSlide = (slide: SlideBlock) => {
    if (!slide.audioUrl) return;

    // If already playing this slide, toggle stop
    if (playingSlideId === slide.id) {
      if (slideAudioRef.current) {
        slideAudioRef.current.pause();
        slideAudioRef.current.currentTime = 0;
      }
      setPlayingSlideId(null);
      return;
    }

    // Stop any existing playback
    if (slideAudioRef.current) {
      slideAudioRef.current.pause();
      slideAudioRef.current = null;
    }

    // Also update main player in background for waveform view/export
    onPlaySlideAudio(slide.audioUrl, slide.title);

    const audio = new Audio(slide.audioUrl);
    slideAudioRef.current = audio;
    setPlayingSlideId(slide.id);

    audio.onended = () => {
      setPlayingSlideId(null);
    };

    audio.onerror = () => {
      setPlayingSlideId(null);
    };

    audio.play().catch(err => {
      console.warn('Inline slide audio play error:', err);
      setPlayingSlideId(null);
    });
  };

  // Helper to insert tag at current cursor position in single text mode
  const insertTagAtCursor = (startTag: string, endTag: string = '') => {
    const textarea = singleTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    const replacement = `${startTag}${selected || ''}${endTag}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    setSingleText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
    }, 50);
  };

  // Helper to insert tag into a specific slide
  const insertTagToSlide = (slideId: string, tag: string) => {
    setSlides(prev =>
      prev.map(s => {
        if (s.id !== slideId) return s;
        return {
          ...s,
          content: s.content ? `${s.content} ${tag}` : tag,
        };
      })
    );
  };

  // Add new slide
  const handleAddSlide = () => {
    const nextNumber = slides.length + 1;
    const newSlide: SlideBlock = {
      id: `slide_${Date.now()}`,
      slideNumber: nextNumber,
      title: `Slide ${nextNumber}: Bagian Baru`,
      content: '',
      isGenerating: false,
    };
    setSlides(prev => [...prev, newSlide]);
  };

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return;
    const filtered = slides.filter(s => s.id !== id);
    const renumbered = filtered.map((s, index) => ({
      ...s,
      slideNumber: index + 1,
    }));
    setSlides(renumbered);
  };

  // Update slide content
  const handleUpdateSlideContent = (id: string, content: string) => {
    setSlides(prev => prev.map(s => (s.id === id ? { ...s, content } : s)));
  };

  // Update slide title
  const handleUpdateSlideTitle = (id: string, title: string) => {
    setSlides(prev => prev.map(s => (s.id === id ? { ...s, title } : s)));
  };

  // Word count & duration estimate
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const getEstimatedDurationSec = (text: string) => {
    const words = getWordCount(text);
    return Math.max(2, Math.round((words / 130) * 60));
  };

  // Sample presentation script for quick demo
  const loadMagangSample = () => {
    const sample = `Selamat pagi kepada Bapak dan Ibu mentor, serta rekan-rekan sekalian. [pause:500ms]

Perkenalkan, saya Muhammad Raihan, peserta magang divisi Software Engineering. [pause:600ms]

Pada kesempatan kali ini, saya ingin mempresentasikan capaian proyek utama saya, yaitu perancangan [emphasis]arsitektur microservices[/emphasis] dan optimasi pipeline CI/CD yang berhasil meningkatkan efisiensi deployment hingga 40%. [pause:800ms]

Mari kita masuk ke bagian latar belakang masalah dan arsitektur teknis yang diimplementasikan.`;
    setSingleText(sample);
  };

  return (
    <section aria-labelledby="editor-heading" className="rounded-xl border border-[#2a3447] bg-[#131722] p-5">
      {/* Mode Switcher & Workspace Actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#262f40] pb-4">
        <div className="flex items-center gap-1.5 rounded-lg bg-[#0c0e14] p-1 border border-[#2a3447]" role="tablist" aria-label="Mode Script">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'single'}
            onClick={() => setMode('single')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'single'
                ? 'bg-[#222938] text-white shadow-sm border border-[#3f4d67]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-slate-300" />
            <span>Naskah Tunggal</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'deck'}
            onClick={() => setMode('deck')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'deck'
                ? 'bg-[#222938] text-white shadow-sm border border-[#3f4d67]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-slate-300" />
            <span>Slide Deck ({slides.length} Slide)</span>
          </button>
        </div>

        {mode === 'single' ? (
          <button
            type="button"
            onClick={loadMagangSample}
            className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
          >
            <FileCode className="h-3.5 w-3.5 text-slate-400" />
            <span>Muat Contoh Naskah</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {onScrollToPersonaSelector && (
              <button
                type="button"
                onClick={onScrollToPersonaSelector}
                className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#222938] transition-colors"
                title="Pilih karakter global di bagian atas"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                <span>Karakter Global: {PERSONA_PRESETS[globalPersonaId]?.name.split('&')[0]} ({globalGender === 'pria' ? 'Ardi' : 'Gadis'})</span>
              </button>
            )}
            {onRestoreDefaultSlides && (
              <button
                type="button"
                onClick={onRestoreDefaultSlides}
                className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#222938] hover:text-white"
                title="Muat ulang naskah 20 slide bawaan"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span>Pulihkan Slide</span>
              </button>
            )}
            {onExportProject && (
              <button
                type="button"
                onClick={onExportProject}
                className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#222938] hover:text-white"
                title="Cadangkan seluruh slide dan audio ke file JSON"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                <span>Simpan JSON</span>
              </button>
            )}
            {onOpenImportDocx && (
              <button
                type="button"
                onClick={onOpenImportDocx}
                className="flex items-center gap-1.5 rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/15 px-2.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-[#f59e0b]/25 hover:border-[#f59e0b] transition-all"
                title="Import naskah perslide langsung dari file Word (.docx) atau teks"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Import Word (.docx)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAddSlide}
              className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#222938] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 text-slate-400" />
              <span>Tambah Slide</span>
            </button>
            <button
              type="button"
              onClick={onGenerateAllSlides}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-md bg-[#f59e0b] px-3.5 py-1.5 text-xs font-bold text-[#0c0e14] transition-colors hover:bg-[#d97706] disabled:opacity-50"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Memproses Audio...' : 'Generate Semua Slide'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SINGLE TEXT MODE */}
      {mode === 'single' ? (
        <div className="space-y-3">
          {/* Quick Markup Toolbar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-medium text-slate-400">
              Markup Audio:
            </span>
            <button
              type="button"
              onClick={() => insertTagAtCursor('[pause:500ms]')}
              className="rounded border border-[#2a3447] bg-[#181e2b] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#222938]"
              title="Jeda nafas selama 0.5 detik"
            >
              + Jeda 0.5s
            </button>
            <button
              type="button"
              onClick={() => insertTagAtCursor('[pause:1s]')}
              className="rounded border border-[#2a3447] bg-[#181e2b] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#222938]"
              title="Jeda pergantian topik selama 1 detik"
            >
              + Jeda 1.0s
            </button>
            <button
              type="button"
              onClick={() => insertTagAtCursor('[emphasis]', '[/emphasis]')}
              className="rounded border border-[#2a3447] bg-[#181e2b] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#222938]"
              title="Beri penekanan intonasi pada teks yang dipilih"
            >
              + Penekanan
            </button>
            <button
              type="button"
              onClick={() => insertTagAtCursor('[whisper]', '[/whisper]')}
              className="rounded border border-[#2a3447] bg-[#181e2b] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#222938]"
              title="Ucapkan dengan nada lebih lembut"
            >
              + Lembut
            </button>
          </div>

          {/* Textarea */}
          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 focus-within:border-[#3f4d67] transition-colors">
            <textarea
              ref={singleTextareaRef}
              rows={8}
              value={singleText}
              onChange={(e) => setSingleText(e.target.value)}
              placeholder="Ketik atau tempelkan naskah presentasi Anda di sini... Tekan Enter untuk jeda paragraf alami."
              className="w-full resize-y bg-transparent text-sm leading-relaxed text-slate-100 placeholder-slate-500 outline-none font-sans"
            />

            {/* Bottom Meta & Word Count */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-[#262f40] pt-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-300">{singleText.length} karakter</span>
                <span>•</span>
                <span className="font-mono text-slate-300">{getWordCount(singleText)} kata</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-200">
                  <Clock className="h-3 w-3 text-slate-400" />
                  ~{getEstimatedDurationSec(singleText)}s durasi
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Gunakan <kbd className="rounded bg-[#131722] border border-[#2a3447] px-1 py-0.5 font-mono text-slate-300">Enter</kbd> untuk jeda kalimat otomatis
              </div>
            </div>

            {/* Phonetic Glossary Matches for Single Text */}
            {(() => {
              const singleGlossaryMatches = findGlossaryMatches(singleText, glossary);
              if (singleGlossaryMatches.length === 0) return null;
              return (
                <div className="mt-2.5 rounded-md border border-amber-500/30 bg-[#161410] p-2.5 text-xs text-amber-200/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                      <span>
                        {singleGlossaryMatches.length} istilah fonetik diterapkan ({singleGlossaryMatches.map(m => m.rule.original).join(', ')})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewSpokenSingle(!previewSpokenSingle)}
                      className="text-xs text-[#f59e0b] hover:underline shrink-0 ml-2"
                    >
                      {previewSpokenSingle ? 'Sembunyikan' : 'Lihat Teks Pelafalan'}
                    </button>
                  </div>
                  {previewSpokenSingle && (
                    <div className="mt-2 rounded bg-[#0c0e14] p-2 border border-[#2a3447] font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-sans">
                        Teks yang akan dibaca Edge TTS:
                      </div>
                      {applyGlossary(singleText, glossary)}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onGenerateSingle}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f59e0b] py-3 text-sm font-bold text-[#0c0e14] transition-colors hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Volume2 className="h-4 w-4" />
            <span>
              {isGenerating ? 'Sedang Memproses Audio...' : 'Generate Audio Naskah'}
            </span>
          </button>
        </div>
      ) : (
        /* SLIDE DECK MODE */
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Kelola narasi per slide secara terstruktur. Setiap slide dapat di-generate mandiri atau diunduh sebagai paket ZIP lengkap dengan subtitle SRT.
          </p>

          <div className="space-y-3">
            {slides.map((slide) => {
              const hasAudio = Boolean(slide.audioUrl);
              return (
                <div
                  key={slide.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    hasAudio
                      ? 'border-[#3f4d67] bg-[#181e2b]'
                      : 'border-[#262f40] bg-[#181e2b]'
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#131722] text-xs font-mono font-bold text-slate-200 border border-[#2a3447]">
                        {slide.slideNumber}
                      </span>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlideTitle(slide.id, e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-100 outline-none border-b border-transparent focus:border-[#f59e0b] flex-1"
                        placeholder="Judul Bagian Slide..."
                      />
                    </div>

                    {/* Actions per slide */}
                    <div className="flex items-center gap-2">
                      {hasAudio && (
                        <button
                          type="button"
                          onClick={() => handlePlayInlineSlide(slide)}
                          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all shadow-sm ${
                            playingSlideId === slide.id
                              ? 'border border-amber-500/60 bg-amber-500/25 text-amber-300 animate-pulse'
                              : 'border border-[#2a3447] bg-[#131722] text-slate-200 hover:bg-[#222938] hover:border-[#f59e0b]'
                          }`}
                          title={
                            playingSlideId === slide.id
                              ? 'Hentikan audio slide ini'
                              : 'Dengarkan langsung audio slide ini tanpa perlu scroll ke bawah'
                          }
                        >
                          {playingSlideId === slide.id ? (
                            <>
                              <Square className="h-3 w-3 fill-current text-amber-400" />
                              <span className="font-semibold text-amber-300">Hentikan</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current text-[#f59e0b]" />
                              <span>Dengar</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onGenerateSlide(slide.id)}
                        disabled={slide.isGenerating}
                        className="flex items-center gap-1 rounded-md border border-[#2a3447] bg-[#131722] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#222938] disabled:opacity-50 cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3 text-slate-400" />
                        <span>{slide.isGenerating ? 'Memproses...' : hasAudio ? 'Generate Ulang' : 'Generate'}</span>
                      </button>

                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                          title="Hapus slide ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slide Character / Voice Bar */}
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#131722] px-2.5 py-1.5 border border-[#2a3447]">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          Karakter:
                        </span>
                        <select
                          value={slide.personaId ? `${slide.personaId}|${slide.gender || 'pria'}` : 'global'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'global') {
                              onUpdateSlidePersona(slide.id, undefined, undefined);
                            } else {
                              const [pId, gId] = val.split('|') as [PersonaId, GenderType];
                              onUpdateSlidePersona(slide.id, pId, gId);
                            }
                          }}
                          className={`rounded px-2 py-0.5 text-xs font-medium outline-none cursor-pointer border transition-colors ${
                            slide.personaId
                              ? 'border-[#f59e0b] bg-[#1e2635] text-slate-100'
                              : 'border-[#2a3447] bg-[#181e2b] text-slate-300 hover:border-[#38465f]'
                          }`}
                          title="Pilih karakter suara khusus untuk slide ini"
                        >
                          <option value="global" className="bg-[#131722] text-slate-200">
                            Ikuti Global ({PERSONA_PRESETS[globalPersonaId]?.name.split('&')[0]} - {globalGender === 'pria' ? 'Ardi' : 'Gadis'})
                          </option>
                          <option value="pitch_magang|pria" className="bg-[#131722] text-slate-200">
                            Sidang Magang (Pria - Ardi)
                          </option>
                          <option value="pitch_magang|wanita" className="bg-[#131722] text-slate-200">
                            Sidang Magang (Wanita - Gadis)
                          </option>
                          <option value="tutorial_demo|wanita" className="bg-[#131722] text-slate-200">
                            Tutorial Demo (Wanita - Gadis)
                          </option>
                          <option value="tutorial_demo|pria" className="bg-[#131722] text-slate-200">
                            Tutorial Demo (Pria - Ardi)
                          </option>
                          <option value="executive|pria" className="bg-[#131722] text-slate-200">
                            Executive Formal (Pria - Ardi)
                          </option>
                          <option value="executive|wanita" className="bg-[#131722] text-slate-200">
                            Executive Formal (Wanita - Gadis)
                          </option>
                          <option value="casual_podcast|wanita" className="bg-[#131722] text-slate-200">
                            Casual Podcast (Wanita - Gadis)
                          </option>
                          <option value="casual_podcast|pria" className="bg-[#131722] text-slate-200">
                            Casual Podcast (Pria - Ardi)
                          </option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPersonaModalSlide(slide)}
                        className="flex items-center gap-1 rounded bg-[#181e2b] hover:bg-[#222938] border border-[#2a3447] px-2 py-0.5 text-[11px] font-medium text-slate-300 transition-colors"
                        title="Atur tempo kecepatan untuk slide ini"
                      >
                        <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                        <span>Detail & Tempo</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      {slide.personaId ? (
                        <span className="rounded bg-[#1e2635] px-2 py-0.5 font-medium text-slate-200 border border-[#2a3447]">
                          Kustom: {PERSONA_PRESETS[slide.personaId]?.name.split('&')[0]} ({slide.gender === 'pria' ? 'Ardi' : 'Gadis'})
                          {slide.rate && slide.rate !== 1 && ` • ${Math.round(slide.rate * 100)}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Standar Global
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slide Content Textarea */}
                  <textarea
                    rows={3}
                    value={slide.content}
                    onChange={(e) => handleUpdateSlideContent(slide.id, e.target.value)}
                    placeholder={`Ketik naskah untuk Slide ${slide.slideNumber}...`}
                    className="w-full resize-y rounded-md border border-[#2a3447] bg-[#131722] p-2.5 text-xs leading-relaxed text-slate-100 placeholder-slate-500 outline-none focus:border-[#f59e0b]"
                  />

                  {/* Slide quick tags */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => insertTagToSlide(slide.id, '[pause:500ms]')}
                        className="rounded border border-[#2a3447] bg-[#131722] px-1.5 py-0.5 text-slate-300 hover:bg-[#222938]"
                      >
                        + Jeda 0.5s
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTagToSlide(slide.id, '[pause:1s]')}
                        className="rounded border border-[#2a3447] bg-[#131722] px-1.5 py-0.5 text-slate-300 hover:bg-[#222938]"
                      >
                        + Jeda 1s
                      </button>
                    </div>
                    <span className="font-mono text-slate-400">{getWordCount(slide.content)} kata • ~{getEstimatedDurationSec(slide.content)}s</span>
                  </div>

                  {/* Glossary Match Indicator for this slide */}
                  {(() => {
                    const slideGlossaryMatches = findGlossaryMatches(slide.content, glossary);
                    if (slideGlossaryMatches.length === 0) return null;
                    const isPreviewingSpoken = Boolean(previewSpokenSlideIds[slide.id]);
                    return (
                      <div className="mt-2 rounded-md border border-amber-500/30 bg-[#161410] px-2.5 py-1.5 text-xs text-amber-200/90">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-medium text-[11px]">
                            <Sparkles className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                            <span>
                              Pelafalan fonetik aktif: {slideGlossaryMatches.map(m => m.rule.original).join(', ')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewSpokenSlideIds(prev => ({
                                ...prev,
                                [slide.id]: !prev[slide.id],
                              }))
                            }
                            className="text-[11px] text-[#f59e0b] hover:underline shrink-0 ml-2"
                          >
                            {isPreviewingSpoken ? 'Tutup Preview' : 'Lihat Teks Pelafalan'}
                          </button>
                        </div>
                        {isPreviewingSpoken && (
                          <div className="mt-1.5 rounded bg-[#0c0e14] p-2 border border-[#2a3447] font-mono text-[11px] text-emerald-300 leading-relaxed whitespace-pre-wrap">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5 font-sans">
                              Teks yang akan dibaca Edge TTS:
                            </div>
                            {applyGlossary(slide.content, glossary)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#2a3447] py-3 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Slide Berikutnya</span>
          </button>
        </div>
      )}

      {/* Modal Kustomisasi Karakter Slide */}
      <SlidePersonaModal
        isOpen={personaModalSlide !== null}
        onClose={() => setPersonaModalSlide(null)}
        slide={personaModalSlide}
        globalPersonaId={globalPersonaId}
        globalGender={globalGender}
        onSaveSlidePersona={onUpdateSlidePersona}
      />
    </section>
  );
};
