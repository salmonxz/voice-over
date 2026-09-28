'use client';

import React, { useRef } from 'react';
import { Mic, BookOpen, Settings, HelpCircle, Download, Upload, CheckCircle2, Cpu } from 'lucide-react';
import { EngineType } from '@/lib/types';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenGlossary: () => void;
  onOpenTips: () => void;
  saveStatus?: string;
  slidesCount?: number;
  onExportProject?: () => void;
  onImportProject?: (file: File) => void;
  onRestoreDefaultSlides?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenGlossary,
  onOpenTips,
  saveStatus = 'Tersimpan otomatis',
  slidesCount = 20,
  onExportProject,
  onImportProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportProject) {
      onImportProject(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a3447] bg-[#131722]">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-label="Unggah file cadangan JSON"
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Station Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a202c] border border-[#2a3447] text-[#f59e0b]">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                IndoVoice <span className="text-[#f59e0b]">Studio</span>
              </h1>
              <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-[#1e2635] text-slate-300 border border-[#2a3447]">
                Voice-Over Magang
              </span>
            </div>
            <p className="text-xs text-slate-400">Audio Console & Slide Deck Director</p>
          </div>
        </div>

        {/* Status & Studio Controls */}
        <div className="flex items-center gap-2">
          {/* Storage Status */}
          <div
            className="hidden lg:flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 py-1 text-xs text-slate-300"
            title="Perubahan otomatis tersimpan ke IndexedDB & LocalStorage"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>{saveStatus}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-300">{slidesCount} slide</span>
          </div>

          {/* Backup / Export Button */}
          {onExportProject && (
            <button
              onClick={onExportProject}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#1a202c] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
              title="Unduh file cadangan proyek (.json)"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden xl:inline">Cadangan Proyek</span>
            </button>
          )}

          {/* Restore / Import Button */}
          {onImportProject && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#1a202c] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
              title="Buka kembali file cadangan proyek (.json)"
            >
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden xl:inline">Buka Proyek</span>
            </button>
          )}

          {/* Active Engine Badge */}
          <div
            className="hidden md:flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 py-1.5 text-xs font-medium text-slate-300"
            title="Mesin Suara: Microsoft Edge Neural TTS (Gratis & Cepat)"
          >
            <Cpu className="h-3.5 w-3.5 text-[#f59e0b]" />
            <span>
              Engine: <strong className="font-semibold text-emerald-400">Edge Neural TTS</strong>
            </span>
          </div>

          {/* Glossary Button */}
          <button
            onClick={onOpenGlossary}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#1a202c] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
            title="Kelola Pelafalan Istilah Teknis & Singkatan"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Kamus Fonetik</span>
          </button>

          {/* Tips Button */}
          <button
            onClick={onOpenTips}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#1a202c] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
            title="Panduan Teknis Presentasi Magang"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Panduan</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#1a202c] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
            title="Pengaturan Kunci API & Konfigurasi"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
