'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SlideBlock } from '@/lib/types';
import { parseDocxFile, parseTextFile, parseSlidesFromText } from '@/lib/document-parser';

interface ImportDocxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSlides: (newSlides: SlideBlock[]) => void;
}

export const ImportDocxModal: React.FC<ImportDocxModalProps> = ({
  isOpen,
  onClose,
  onImportSlides,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [pastedText, setPastedText] = useState('');
  const [parsedSlides, setParsedSlides] = useState<SlideBlock[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset modal state on close
  const handleClose = () => {
    setParsedSlides([]);
    setFileName(null);
    setErrorMessage(null);
    setPastedText('');
    onClose();
  };

  // Process File (.docx or .txt)
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setFileName(file.name);

    try {
      let slides: SlideBlock[] = [];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'docx') {
        slides = await parseDocxFile(file);
      } else if (extension === 'txt') {
        slides = await parseTextFile(file);
      } else {
        throw new Error('Format file tidak didukung. Harap unggah file Word (.docx) atau teks (.txt).');
      }

      if (slides.length === 0) {
        throw new Error(
          'Tidak dapat menemukan penanda slide (misal: "SLIDE 1", "SLIDE 2"). Pastikan naskah memiliki pemisah antar slide.'
        );
      }

      setParsedSlides(slides);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Gagal memproses file Word.');
      setParsedSlides([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // File drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  // File input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  // Process manual paste text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Silakan tempel teks naskah terlebih dahulu.');
      return;
    }

    const slides = parseSlidesFromText(pastedText);
    if (slides.length === 0) {
      setErrorMessage('Tidak ditemukan penanda "SLIDE 1", "SLIDE 2", dsb. pada teks yang ditempel.');
      return;
    }

    setParsedSlides(slides);
    setErrorMessage(null);
    setFileName('Teks Ditempel');
  };

  // Confirm and Apply Slides to Project (NO TTS generated, pure script import)
  const handleApply = () => {
    if (parsedSlides.length === 0) return;
    onImportSlides(parsedSlides);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-sm font-bold text-slate-100">
                Import Naskah Word (.docx) Per Slide
              </h2>
              <p className="text-xs text-slate-400">
                Otomatis dipecah per slide berdasarkan pola &quot;SLIDE 1, SLIDE 2, ...&quot;
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2a3447] px-6 pt-3 bg-[#0c0e14]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload File Word (.docx)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Tempel Teks (Paste Manual)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Upload File Drag & Drop */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#f59e0b] bg-[#f59e0b]/10 scale-[0.99]'
                    : 'border-[#2a3447] bg-[#181e2b]/60 hover:border-[#f59e0b]/60 hover:bg-[#181e2b]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-amber-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs font-medium">Mengekstrak naskah dari file Word...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f59e0b]/10 text-[#f59e0b] mb-3 border border-[#f59e0b]/20">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-100">
                      Tarik &amp; Lepaskan File Word (.docx) ke sini
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      atau <span className="text-[#f59e0b] underline font-medium">Klik untuk memilih file</span> dari komputer Anda
                    </p>
                    <p className="mt-3 text-[11px] text-slate-500">
                      Mendukung format naskah dengan penanda: <code className="text-amber-400 font-mono">SLIDE 1</code>, <code className="text-amber-400 font-mono">SLIDE 2</code>, ..., <code className="text-amber-400 font-mono">SLIDE 110</code>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Paste Text Manual */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label htmlFor="pasted-script" className="block text-xs font-medium text-slate-300">
                Tempel seluruh naskah dari Microsoft Word (Ctrl + A lalu Ctrl + V):
              </label>
              <textarea
                id="pasted-script"
                rows={7}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="SLIDE 1&#10;&#10;Survei Industri Mikro dan Kecil 2026 Tahunan (VIMK26-S2)...&#10;&#10;SLIDE 2&#10;&#10;Pendataan Industri Mikro dan Kecil 2026 Tahunan..."
                className="w-full rounded-lg border border-[#2a3447] bg-[#0c0e14] p-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-[#f59e0b] font-mono leading-relaxed resize-none"
              />
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pastedText.trim()}
                className="flex items-center gap-1.5 rounded-md bg-[#181e2b] border border-[#2a3447] px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-[#222938] hover:border-[#f59e0b] disabled:opacity-40 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ekstrak &amp; Pecah Slide Sekarang</span>
              </button>
            </div>
          )}

          {/* Preview of Parsed Slides */}
          {parsedSlides.length > 0 && (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-300">
                      Berhasil Membaca {parsedSlides.length} Slide
                    </h3>
                    <p className="text-[11px] text-emerald-400/80">
                      File: {fileName || 'Dokumen Word'} • Siap dimuat ke editor
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-[#0c0e14] px-2.5 py-1 rounded border border-[#2a3447]">
                  <Layers className="h-3 w-3 text-amber-400" />
                  <span>Total {parsedSlides.length} Kartu Slide</span>
                </div>
              </div>

              {/* Safety notice as explicitly requested by user */}
              <div className="rounded bg-[#0c0e14] p-2.5 border border-[#2a3447] text-[11px] text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">ℹ️ Catatan:</span>
                <span>
                  Mengimpor naskah <strong>TIDAK akan men-generate audio secara otomatis</strong>. Naskah hanya akan diisi ke dalam kartu slide sehingga Anda dapat memeriksa ejaan, mengecek kamus fonetik, atau mengedit kalimat dengan santai.
                </span>
              </div>

              {/* Slide Snippets Preview */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedSlides.slice(0, 5).map((slide) => (
                  <div
                    key={slide.id}
                    className="rounded-lg border border-[#262f40] bg-[#131722] p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 mb-1">
                      <span>{slide.title}</span>
                      <span className="text-slate-500">#{slide.slideNumber}</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                      {slide.content}
                    </p>
                  </div>
                ))}

                {parsedSlides.length > 5 && (
                  <p className="text-center text-[11px] text-slate-400 py-1 italic">
                    ... dan {parsedSlides.length - 5} slide lainnya siap di-import.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#2a3447] px-6 py-3.5 bg-[#0c0e14]">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-[#2a3447] bg-[#181e2b] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#222938] hover:text-white transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={parsedSlides.length === 0}
            className="flex items-center gap-1.5 rounded-md bg-[#f59e0b] px-4 py-2 text-xs font-bold text-[#0c0e14] hover:bg-[#d97706] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <span>Terapkan {parsedSlides.length > 0 ? `${parsedSlides.length} Slide` : ''} ke Editor</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
