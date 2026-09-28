'use client';

import React from 'react';
import { X, HelpCircle, Lightbulb, Video, Mic2, Clock } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="tips-modal-title">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181e2b] border border-[#2a3447] text-[#f59e0b]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 id="tips-modal-title" className="text-sm font-bold text-slate-100">Panduan Teknis Voice-Over Magang</h2>
              <p className="text-xs text-slate-400">Teknik intonasi dan pengolahan naskah presentasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup panduan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-xs">
          {/* Tip 1 */}
          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5">
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-1">
              <Clock className="h-4 w-4 text-[#f59e0b]" />
              <span>1. Gunakan Jeda Nafas Sebelum Angka & Data Kunci</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Manusia selalu mengambil jeda mikro sebelum menyebutkan data penting. Sisipkan tag <code className="bg-[#131722] border border-[#2a3447] text-[#f59e0b] px-1 py-0.5 rounded font-mono">[pause:500ms]</code> sebelum menyebutkan persentase capaian Anda (misal: <em>&quot;...berhasil menghemat biaya cloud hingga [pause:500ms] 40 persen per bulan.&quot;</em>).
            </p>
          </div>

          {/* Tip 2 */}
          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5">
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-1">
              <Mic2 className="h-4 w-4 text-emerald-400" />
              <span>2. Manfaatkan Kamus Fonetik untuk Istilah Asing</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Istilah seperti <strong>UI/UX, KPI, Framework, atau CI/CD</strong> dapat dikoreksi pelafalannya di menu <em>Kamus Fonetik</em> agar terbaca fasih dalam kalimat bahasa Indonesia.
            </p>
          </div>

          {/* Tip 3 */}
          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5">
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-1">
              <Video className="h-4 w-4 text-sky-400" />
              <span>3. Gunakan Slide Deck Mode untuk Video Editing Cepat</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Saat membuat video di CapCut atau Premiere, unduh audio per slide dalam bentuk <strong>Bundle ZIP</strong>. Jika ada revisi pada satu slide saja, Anda cukup meng-generate ulang slide tersebut tanpa merombak timeline lainnya.
            </p>
          </div>

          {/* Tip 4 */}
          <div className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5">
            <div className="flex items-center gap-2 text-slate-100 font-semibold mb-1">
              <Lightbulb className="h-4 w-4 text-purple-400" />
              <span>4. Sesuaikan Tempo dengan Kompleksitas Materi</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Untuk slide pembuka/perkenalan, gunakan tempo <strong>100% - 105%</strong> agar terdengar bersemangat. Saat memaparkan arsitektur teknis atau metodologi, turunkan ke <strong>92% - 96%</strong> agar audiens mudah mencerna.
            </p>
          </div>
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
