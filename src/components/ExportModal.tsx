'use client';

import React, { useState } from 'react';
import { X, Download, FileAudio, FileText, Archive, CheckCircle2, Music } from 'lucide-react';
import { SlideBlock } from '@/lib/types';
import {
  downloadBlob,
  downloadText,
  downloadSlidesZip,
  dataUrlToArrayBuffer,
  audioBufferToWav,
  mergeAudioBuffers,
} from '@/lib/audio-utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAudioUrl: string | null;
  srtContent?: string;
  slides: SlideBlock[];
  mode: 'single' | 'deck';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeAudioUrl,
  srtContent,
  slides,
  mode,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadMp3 = () => {
    if (!activeAudioUrl) return;
    const arrayBuffer = dataUrlToArrayBuffer(activeAudioUrl);
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    downloadBlob(blob, `IndoVoice_VoiceOver_${Date.now()}.mp3`);
    setDownloadSuccess('File MP3 berhasil diunduh.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadWav = async () => {
    if (!activeAudioUrl) return;
    try {
      setIsProcessing(true);
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = dataUrlToArrayBuffer(activeAudioUrl);
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      const wavBuffer = audioBufferToWav(decoded);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      downloadBlob(blob, `IndoVoice_Studio_${Date.now()}.wav`);
      setDownloadSuccess('File WAV Studio Lossless berhasil diunduh.');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('WAV export error:', e);
      alert('Gagal mengekspor format WAV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSrt = () => {
    if (!srtContent) {
      alert('Konten subtitle belum tersedia. Silakan generate audio terlebih dahulu.');
      return;
    }
    downloadText(srtContent, `IndoVoice_Subtitles_${Date.now()}.srt`);
    setDownloadSuccess('File Subtitle (.SRT) berhasil diunduh.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadDeckZip = async () => {
    const slidesWithAudio = slides.filter(s => Boolean(s.audioUrl));
    if (slidesWithAudio.length === 0) {
      alert('Belum ada slide yang memiliki audio.');
      return;
    }
    try {
      setIsProcessing(true);
      await downloadSlidesZip(slidesWithAudio, srtContent, 'IndoVoice_Presentasi_Magang');
      setDownloadSuccess('Bundle ZIP seluruh slide berhasil diunduh.');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('ZIP export error:', e);
      alert('Gagal membuat file ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadMergedSlides = async () => {
    const validUrls = slides.filter(s => Boolean(s.audioUrl)).map(s => s.audioUrl!);
    if (validUrls.length === 0) {
      alert('Belum ada slide dengan audio untuk digabungkan.');
      return;
    }
    try {
      setIsProcessing(true);
      const mergedBlob = await mergeAudioBuffers(validUrls, 0.6); // 600ms gap between slides
      downloadBlob(mergedBlob, `IndoVoice_Presentasi_Gabungan_${Date.now()}.wav`);
      setDownloadSuccess('Semua audio slide berhasil digabungkan dan diunduh.');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('Merge error:', e);
      alert('Gagal menggabungkan audio slide.');
    } finally {
      setIsProcessing(false);
    }
  };

  const slidesWithAudioCount = slides.filter(s => Boolean(s.audioUrl)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181e2b] border border-[#2a3447] text-[#f59e0b]">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-sm font-bold text-slate-100">Pusat Ekspor Audio & Subtitle</h2>
              <p className="text-xs text-slate-400">Siap digunakan di CapCut, Premiere, atau DaVinci</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup ekspor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Toast */}
        {downloadSuccess && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-[#14261c] border border-emerald-500/40 p-3 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          {/* Format 1: MP3 */}
          <button
            type="button"
            onClick={handleDownloadMp3}
            disabled={!activeAudioUrl || isProcessing}
            className="flex w-full items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] p-3 text-left transition-colors hover:bg-[#222938] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[#131722] border border-[#2a3447] text-slate-200">
                <FileAudio className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">Audio Format MP3 (Standar)</div>
                <p className="text-[11px] text-slate-400">Kompresi seimbang, kompatibel universal</p>
              </div>
            </div>
            <span className="rounded bg-[#131722] border border-[#2a3447] px-2 py-1 text-[10px] font-mono text-slate-300">.MP3</span>
          </button>

          {/* Format 2: WAV */}
          <button
            type="button"
            onClick={handleDownloadWav}
            disabled={!activeAudioUrl || isProcessing}
            className="flex w-full items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] p-3 text-left transition-colors hover:bg-[#222938] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[#131722] border border-[#2a3447] text-slate-200">
                <Music className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">Audio Format WAV (Studio Lossless)</div>
                <p className="text-[11px] text-slate-400">Kualitas murni tanpa reduksi kompresi</p>
              </div>
            </div>
            <span className="rounded bg-[#131722] border border-[#2a3447] px-2 py-1 text-[10px] font-mono text-slate-300">.WAV</span>
          </button>

          {/* Format 3: Subtitles SRT */}
          <button
            type="button"
            onClick={handleDownloadSrt}
            disabled={!srtContent || isProcessing}
            className="flex w-full items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] p-3 text-left transition-colors hover:bg-[#222938] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[#131722] border border-[#2a3447] text-slate-200">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">Subtitle Tersinkron (.SRT)</div>
                <p className="text-[11px] text-slate-400">Siap diimpor ke timeline video editing</p>
              </div>
            </div>
            <span className="rounded bg-[#131722] border border-[#2a3447] px-2 py-1 text-[10px] font-mono text-slate-300">.SRT</span>
          </button>

          {/* Slide Deck Extras */}
          {mode === 'deck' && (
            <div className="border-t border-[#262f40] pt-3 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400">
                Opsi Slide Deck ({slidesWithAudioCount} audio siap):
              </div>

              {/* Download ZIP */}
              <button
                type="button"
                onClick={handleDownloadDeckZip}
                disabled={slidesWithAudioCount === 0 || isProcessing}
                className="flex w-full items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] p-3 text-left transition-colors hover:bg-[#222938] disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#131722] border border-[#2a3447] text-[#f59e0b]">
                    <Archive className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Bundle ZIP Per Slide</div>
                    <p className="text-[11px] text-slate-400">File Slide_01.mp3 terpisah per bagian</p>
                  </div>
                </div>
                <span className="rounded bg-[#131722] border border-[#2a3447] px-2 py-1 text-[10px] font-mono text-slate-300">.ZIP</span>
              </button>

              {/* Merge All Slides */}
              <button
                type="button"
                onClick={handleDownloadMergedSlides}
                disabled={slidesWithAudioCount === 0 || isProcessing}
                className="flex w-full items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] p-3 text-left transition-colors hover:bg-[#222938] disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#131722] border border-[#2a3447] text-slate-200">
                    <FileAudio className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Gabung Semua Slide Jadi 1 Audio</div>
                    <p className="text-[11px] text-slate-400">Jeda transisi 0.6 detik antar-slide otomatis</p>
                  </div>
                </div>
                <span className="rounded bg-[#131722] border border-[#2a3447] px-2 py-1 text-[10px] font-mono text-slate-300">GABUNG</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#2a3447] px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#2a3447] bg-[#181e2b] px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#222938] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
