'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PersonaSelector } from '@/components/PersonaSelector';
import { DeliverySliders } from '@/components/DeliverySliders';
import { ScriptEditor } from '@/components/ScriptEditor';
import { WaveformPlayer } from '@/components/WaveformPlayer';
import { GlossaryModal } from '@/components/GlossaryModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ExportModal } from '@/components/ExportModal';
import { TipsModal } from '@/components/TipsModal';
import { ImportDocxModal } from '@/components/ImportDocxModal';
import {
  EngineType,
  GenderType,
  PersonaId,
  PersonaPreset,
  DeliverySettings,
  SlideBlock,
  GlossaryEntry,
} from '@/lib/types';
import { PERSONA_PRESETS } from '@/lib/personas';
import { DEFAULT_GLOSSARY } from '@/lib/glossary';
import { RECOVERED_SLIDES } from '@/lib/recovered-slides';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
  loadGlossaryFromStorage,
  saveGlossaryToStorage,
  exportProjectToJson,
  importProjectFromJson,
} from '@/lib/storage';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  // Persona & Voice Settings
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('pitch_magang');
  const [selectedGender, setSelectedGender] = useState<GenderType>('pria');

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    engine: 'edge',
    personaId: 'pitch_magang',
    gender: 'pria',
    voiceId: 'id-ID-ArdiNeural',
    rate: 1.05,
    pitch: 0,
    volume: 100,
    pauseDurationMs: 450,
  });

  // Glossary
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(DEFAULT_GLOSSARY);

  // Script & Slides - Default to recovered 20 slides in deck mode
  const [mode, setMode] = useState<'single' | 'deck'>('deck');
  const [singleText, setSingleText] = useState(
    `Selamat pagi kepada Bapak dan Ibu mentor, serta rekan-rekan sekalian. [pause:500ms]\n\nPerkenalkan, saya peserta magang divisi Software Engineering. [pause:600ms]\n\nPada presentasi kali ini, saya ingin memaparkan implementasi arsitektur baru dan pipeline CI/CD yang berhasil meningkatkan efisiensi rilis hingga 40%.`
  );
  const [slides, setSlides] = useState<SlideBlock[]>(RECOVERED_SLIDES);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);

  // Storage & Save Status State
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Tersimpan otomatis');

  // Audio Output State - preload first audio if available
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(RECOVERED_SLIDES[0]?.audioUrl || null);
  const [activeAudioTitle, setActiveAudioTitle] = useState(
    RECOVERED_SLIDES[0]?.title ? `Audio: ${RECOVERED_SLIDES[0].title}` : 'Voice-Over Presentasi'
  );
  const [activeAudioDuration, setActiveAudioDuration] = useState(RECOVERED_SLIDES[0]?.audioDuration || 0);
  const [activeSrtContent, setActiveSrtContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personaNotice, setPersonaNotice] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isImportDocxOpen, setIsImportDocxOpen] = useState(false);

  // 1. Load persisted project from IndexedDB / Storage on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const savedGlossary = loadGlossaryFromStorage();
        const projectData = await loadProjectFromStorage();
        if (!isMounted) return;

        if (savedGlossary && savedGlossary.length > 0) {
          setGlossary(savedGlossary);
        } else if (projectData.glossary && projectData.glossary.length > 0) {
          setGlossary(projectData.glossary);
        }

        if (projectData.slides && projectData.slides.length > 0) {
          setSlides(projectData.slides);
          const firstWithAudio = projectData.slides.find(s => Boolean(s.audioUrl));
          if (firstWithAudio && firstWithAudio.audioUrl) {
            setActiveAudioUrl(firstWithAudio.audioUrl);
            setActiveAudioTitle(`Audio: ${firstWithAudio.title}`);
            setActiveAudioDuration(firstWithAudio.audioDuration || 0);
          }
        }
        if (projectData.mode) setMode(projectData.mode);
        if (projectData.singleText) setSingleText(projectData.singleText);
        if (projectData.deliverySettings) {
          setDeliverySettings({
            ...projectData.deliverySettings,
            engine: 'edge',
          });
        }
      } catch (e) {
        console.warn('Storage initial load error:', e);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Persist state changes with debounce (Only AFTER initial load is done)
  useEffect(() => {
    if (!isInitialized) return;

    setSaveStatus('Menyimpan...');
    const timer = setTimeout(async () => {
      try {
        await saveProjectToStorage({
          slides,
          singleText,
          mode,
          engine: 'edge',
          glossary,
          deliverySettings,
        });
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setSaveStatus(`Tersimpan otomatis (${timeStr})`);
      } catch (e) {
        console.warn('Auto-save error:', e);
        setSaveStatus('Penyimpanan lokal');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isInitialized, glossary, singleText, slides, mode, deliverySettings]);

  // Handle Export Backup JSON
  const handleExportProject = () => {
    exportProjectToJson(slides, `indovoice_presentasi_vimk26_${slides.length}_slide.json`);
  };

  // Handle Import Backup JSON
  const handleImportProject = async (file: File) => {
    try {
      const importedSlides = await importProjectFromJson(file);
      setSlides(importedSlides);
      setMode('deck');
      const first = importedSlides.find(s => Boolean(s.audioUrl));
      if (first && first.audioUrl) {
        setActiveAudioUrl(first.audioUrl);
        setActiveAudioTitle(`Audio: ${first.title}`);
        setActiveAudioDuration(first.audioDuration || 0);
      }
      setErrorMessage(null);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(`Gagal membuka file backup: ${error.message}`);
    }
  };

  // Handle Restore Default 20 Slides
  const handleRestoreDefaultSlides = () => {
    setSlides(RECOVERED_SLIDES);
    setMode('deck');
    const first = RECOVERED_SLIDES.find(s => Boolean(s.audioUrl));
    if (first && first.audioUrl) {
      setActiveAudioUrl(first.audioUrl);
      setActiveAudioTitle(`Audio: ${first.title}`);
      setActiveAudioDuration(first.audioDuration || 0);
    }
  };

  // Handle Import Slides from Word (.docx) or Text
  const handleImportDocxSlides = (newSlides: SlideBlock[]) => {
    setSlides(newSlides);
    setMode('deck');
    const firstSlide = newSlides[0];
    if (firstSlide) {
      setActiveSlideId(firstSlide.id);
      setActiveAudioUrl(null);
      setActiveAudioTitle(`Audio: ${firstSlide.title}`);
      setActiveAudioDuration(0);
      setActiveSrtContent('');
    }
    setPersonaNotice(
      `Berhasil mengimpor ${newSlides.length} slide dari dokumen Word. Audio sengaja tidak langsung di-generate agar Anda dapat memeriksa naskah terlebih dahulu.`
    );
  };

  // Handle Persona Selection
  const handleSelectPersona = (preset: PersonaPreset) => {
    setSelectedPersonaId(preset.id);
    const voice = selectedGender === 'pria' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural';
    setDeliverySettings(prev => ({
      ...prev,
      personaId: preset.id,
      voiceId: voice,
      rate: preset.defaultRate,
      pitch: preset.defaultPitch,
      volume: 100,
      pauseDurationMs: preset.pauseDurationMs,
    }));
    setPersonaNotice(
      `Karakter "${preset.name}" aktif (${selectedGender === 'pria' ? 'Ardi' : 'Gadis'}). Dengarkan contohnya di tombol "Dengar Contoh Suara", atau klik "Generate" pada slide untuk memperbarui audio.`
    );
  };

  // Handle Gender Switch
  const handleSelectGender = (gender: GenderType) => {
    setSelectedGender(gender);
    const voice = gender === 'pria' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural';
    setDeliverySettings(prev => ({
      ...prev,
      gender,
      voiceId: voice,
    }));
    setPersonaNotice(
      `Format suara diubah ke ${gender === 'pria' ? 'Pria (Ardi)' : 'Wanita (Gadis)'}. Klik "Dengar Contoh Suara" pada kartu untuk mendengar perbedaannya.`
    );
  };

  // Handle Delivery Slider Updates
  const handleDeliverySettingsChange = (updated: Partial<DeliverySettings>) => {
    setDeliverySettings(prev => ({ ...prev, ...updated }));
  };

  // Call TTS API with Microsoft Edge Neural TTS
  const requestTts = async (text: string, slideId?: string, customSlide?: SlideBlock) => {
    // Slide-level overrides take precedence over global settings
    const activeGender = customSlide?.gender || selectedGender;
    const activeRate = customSlide?.rate !== undefined ? customSlide.rate : deliverySettings.rate;
    const activePitch = customSlide?.pitch !== undefined ? customSlide.pitch : deliverySettings.pitch;
    const activeVolume = deliverySettings.volume ?? 100;
    const activePause = deliverySettings.pauseDurationMs;

    const voice = activeGender === 'pria' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural';

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        rate: activeRate,
        pitch: activePitch,
        volume: activeVolume,
        pauseDurationMs: activePause,
        glossary,
        slideId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Gagal menghasilkan audio.');
    }
    return data;
  };

  // Generate Single Text Audio
  const handleGenerateSingle = async () => {
    if (!singleText.trim()) {
      setErrorMessage('Naskah teks tunggal masih kosong. Silakan tulis naskah terlebih dahulu.');
      return;
    }
    try {
      setIsGenerating(true);
      setErrorMessage(null);

      const result = await requestTts(singleText);
      setActiveAudioUrl(result.audioBase64);
      setActiveAudioTitle('Voice-Over Presentasi Magang');
      setActiveAudioDuration(result.durationSeconds || 0);
      setActiveSrtContent(result.srtContent || '');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Specific Slide Audio (Respecting per-slide persona and overrides)
  const handleGenerateSlide = async (slideId: string, customOverrideSlide?: SlideBlock) => {
    const slide = customOverrideSlide || slides.find(s => s.id === slideId);
    if (!slide || !slide.content.trim()) {
      setErrorMessage(`Naskah untuk slide #${slide?.slideNumber || ''} masih kosong. Silakan isi kalimat presentasi.`);
      return;
    }

    try {
      setSlides(prev => prev.map(s => (s.id === slideId ? { ...s, isGenerating: true } : s)));
      setErrorMessage(null);

      const result = await requestTts(slide.content, slideId, slide);

      setSlides(prev =>
        prev.map(s =>
          s.id === slideId
            ? {
                ...s,
                personaId: slide.personaId,
                gender: slide.gender,
                rate: slide.rate,
                pitch: slide.pitch,
                audioUrl: result.audioBase64,
                audioDuration: result.durationSeconds,
                isGenerating: false,
              }
            : s
        )
      );

      // Load into active player
      setActiveAudioUrl(result.audioBase64);
      setActiveAudioTitle(`Audio: ${slide.title}`);
      setActiveAudioDuration(result.durationSeconds || 0);
      setActiveSrtContent(result.srtContent || '');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setSlides(prev => prev.map(s => (s.id === slideId ? { ...s, isGenerating: false } : s)));
    }
  };

  // Generate All Slides Sequentially (Respecting per-slide persona)
  const handleGenerateAllSlides = async () => {
    const validSlides = slides.filter(s => s.content.trim().length > 0);
    if (validSlides.length === 0) {
      setErrorMessage('Semua slide masih kosong. Isi naskah slide sebelum men-generate audio.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      let firstAudioUrl: string | null = null;
      let firstAudioTitle = '';
      let firstAudioDuration = 0;
      let firstSrt = '';

      for (const slide of slides) {
        if (!slide.content.trim()) continue;

        setSlides(prev => prev.map(s => (s.id === slide.id ? { ...s, isGenerating: true } : s)));
        const result = await requestTts(slide.content, slide.id, slide);

        setSlides(prev =>
          prev.map(s =>
            s.id === slide.id
              ? {
                  ...s,
                  audioUrl: result.audioBase64,
                  audioDuration: result.durationSeconds,
                  isGenerating: false,
                }
              : s
          )
        );

        if (!firstAudioUrl) {
          firstAudioUrl = result.audioBase64;
          firstAudioTitle = `Audio: ${slide.title}`;
          firstAudioDuration = result.durationSeconds || 0;
          firstSrt = result.srtContent || '';
        }
      }

      if (firstAudioUrl) {
        setActiveAudioUrl(firstAudioUrl);
        setActiveAudioTitle(firstAudioTitle);
        setActiveAudioDuration(firstAudioDuration);
        setActiveSrtContent(firstSrt);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsGenerating(false);
      setSlides(prev => prev.map(s => ({ ...s, isGenerating: false })));
    }
  };

  // Update per-slide character persona & voice
  const handleUpdateSlidePersona = (
    slideId: string,
    personaId?: PersonaId,
    gender?: GenderType,
    rate?: number,
    pitch?: number,
    applyToAll?: boolean,
    autoGenerate?: boolean
  ) => {
    const preset = personaId ? PERSONA_PRESETS[personaId] : null;
    const finalRate = rate ?? preset?.defaultRate;
    const finalPitch = pitch ?? preset?.defaultPitch;

    let updatedTargetSlide: SlideBlock | undefined;

    setSlides(prev =>
      prev.map(s => {
        if (applyToAll || s.id === slideId) {
          const updated = {
            ...s,
            personaId,
            gender,
            rate: finalRate,
            pitch: finalPitch,
          };
          if (s.id === slideId) {
            updatedTargetSlide = updated;
          }
          return updated;
        }
        return s;
      })
    );

    if (autoGenerate) {
      setTimeout(() => {
        const slide = updatedTargetSlide || slides.find(s => s.id === slideId);
        if (slide) {
          const overrideSlide: SlideBlock = {
            ...slide,
            personaId,
            gender,
            rate: finalRate,
            pitch: finalPitch,
          };
          handleGenerateSlide(slideId, overrideSlide);
        }
      }, 50);
    }
  };

  // Smooth scroll up to Persona Selector
  const handleScrollToPersonaSelector = () => {
    const el = document.getElementById('persona-selector-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Play slide audio in main player
  const handlePlaySlideAudio = (url: string, title: string) => {
    setActiveAudioUrl(url);
    setActiveAudioTitle(title);
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100 flex flex-col selection:bg-[#f59e0b]/30 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenTips={() => setIsTipsOpen(true)}
        saveStatus={saveStatus}
        slidesCount={slides.length}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        onRestoreDefaultSlides={handleRestoreDefaultSlides}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {/* Error Alert Toast */}
        {errorMessage && (
          <div className="flex items-center justify-between rounded-lg border border-[#7f1d1d] bg-[#1e1317] p-3.5 text-xs font-medium text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white underline text-xs"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Informative Notification on Persona / Voice Change */}
        {personaNotice && (
          <div className="flex items-center justify-between rounded-lg border border-[#f59e0b]/40 bg-[#1c1813] p-3 text-xs font-medium text-amber-200/90 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#f59e0b] shrink-0" />
              <span>{personaNotice}</span>
            </div>
            <button
              onClick={() => setPersonaNotice(null)}
              className="text-amber-400 hover:text-white underline text-xs ml-3 shrink-0"
            >
              Mengerti
            </button>
          </div>
        )}

        {/* Section 1: Persona & Character Selection */}
        <div id="persona-selector-section">
          <PersonaSelector
            selectedPersonaId={selectedPersonaId}
            selectedGender={selectedGender}
            onSelectPersona={handleSelectPersona}
            onSelectGender={handleSelectGender}
          />
        </div>

        {/* Section 2: Fine-Tuning Sliders */}
        <DeliverySliders
          settings={deliverySettings}
          onChange={handleDeliverySettingsChange}
          activeGender={selectedGender}
          onRegenerateActive={
            mode === 'single'
              ? handleGenerateSingle
              : () => (activeSlideId ? handleGenerateSlide(activeSlideId) : handleGenerateAllSlides())
          }
          isGenerating={isGenerating}
        />

        {/* Section 3: Script Workspace (Single Mode & Slide Deck Mode) */}
        <ScriptEditor
          mode={mode}
          setMode={setMode}
          singleText={singleText}
          setSingleText={setSingleText}
          slides={slides}
          setSlides={setSlides}
          onGenerateSingle={handleGenerateSingle}
          onGenerateSlide={handleGenerateSlide}
          onGenerateAllSlides={handleGenerateAllSlides}
          isGenerating={isGenerating}
          activeSlideId={activeSlideId}
          setActiveSlideId={setActiveSlideId}
          onPlaySlideAudio={handlePlaySlideAudio}
          onRestoreDefaultSlides={handleRestoreDefaultSlides}
          onExportProject={handleExportProject}
          onOpenImportDocx={() => setIsImportDocxOpen(true)}
          globalPersonaId={selectedPersonaId}
          globalGender={selectedGender}
          glossary={glossary}
          onUpdateSlidePersona={handleUpdateSlidePersona}
          onScrollToPersonaSelector={handleScrollToPersonaSelector}
        />

        {/* Section 4: Interactive Waveform Player & Output */}
        <WaveformPlayer
          audioUrl={activeAudioUrl}
          durationSeconds={activeAudioDuration}
          isGenerating={isGenerating}
          onRegenerate={
            mode === 'single'
              ? handleGenerateSingle
              : () => (activeSlideId ? handleGenerateSlide(activeSlideId) : handleGenerateAllSlides())
          }
          onOpenExport={() => setIsExportOpen(true)}
          title={activeAudioTitle}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a3447] py-5 text-center text-xs text-slate-400 bg-[#0c0e14]">
        <p>
          IndoVoice Studio • Solusi Voice-Over Presentasi Magang & Video Edukasi
        </p>
      </footer>

      {/* Modals */}
      <ImportDocxModal
        isOpen={isImportDocxOpen}
        onClose={() => setIsImportDocxOpen(false)}
        onImportSlides={handleImportDocxSlides}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        glossary={glossary}
        setGlossary={setGlossary}
        scriptText={mode === 'single' ? singleText : slides.map(s => s.content).join(' ')}
        activeVoice={
          (activeSlideId && slides.find(s => s.id === activeSlideId)?.gender === 'wanita')
            ? 'id-ID-GadisNeural'
            : (selectedGender === 'pria' ? 'id-ID-ArdiNeural' : 'id-ID-GadisNeural')
        }
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeAudioUrl={activeAudioUrl}
        srtContent={activeSrtContent}
        slides={slides}
        mode={mode}
      />

      <TipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
      />
    </div>
  );
}
