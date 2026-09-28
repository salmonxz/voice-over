'use client';

import React from 'react';
import { X, Settings, Cpu, Check, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181e2b] border border-[#2a3447] text-[#f59e0b]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-sm font-bold text-slate-100">Pengaturan Engine Suara</h2>
              <p className="text-xs text-slate-400">Konfigurasi mesin sintesis audio presentasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup pengaturan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="rounded-lg border border-[#f59e0b]/50 bg-[#1e2635] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-xs font-semibold text-white">
                  Microsoft Edge Neural TTS (Native Engine)
                </span>
              </div>
              <span className="rounded bg-[#131722] px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-[#2a3447]">
                AKTIF & GRATIS
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Menggunakan model neural resmi vokal bahasa Indonesia langsung dari Microsoft Azure Speech Engine. Seluruh proses generate audio berjalan cepat, stabil, tanpa batasan token/kuota bulanan, dan tanpa memerlukan API Key eksternal.
            </p>
          </div>

          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#f59e0b]" />
              <span>Spesifikasi Vokal Studio</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-[#262f40]">
                <span className="text-slate-400">Vokal Pria:</span>
                <span className="font-medium text-slate-200">id-ID-ArdiNeural (Artikulasi Tegas, Presentasi Magang)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#262f40]">
                <span className="text-slate-400">Vokal Wanita:</span>
                <span className="font-medium text-slate-200">id-ID-GadisNeural (Ramah, Jernih, E-Learning)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#262f40]">
                <span className="text-slate-400">Format & Kualitas:</span>
                <span className="font-mono text-slate-200">MP3 24kHz 96kbps Mono (Optimal untuk Slide Video)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Status Layanan:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Siap Digunakan Tanpa Batas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#2a3447] px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-md bg-[#f59e0b] px-4 py-2 text-xs font-bold text-[#0c0e14] hover:bg-[#d97706] transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};

