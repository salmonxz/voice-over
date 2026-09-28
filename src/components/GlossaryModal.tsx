'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Search,
  BookOpen,
  Trash2,
  RotateCcw,
  Pencil,
  Check,
  CheckCircle2,
  Volume2,
  Loader2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { GlossaryEntry } from '@/lib/types';
import { DEFAULT_GLOSSARY, findGlossaryMatches } from '@/lib/glossary';
import { saveGlossaryToStorage } from '@/lib/storage';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryEntry[];
  setGlossary: React.Dispatch<React.SetStateAction<GlossaryEntry[]>>;
  scriptText?: string;
  activeVoice?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  glossary,
  setGlossary,
  scriptText = '',
  activeVoice = 'id-ID-ArdiNeural',
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'business' | 'indonesian' | 'custom'>('all');

  // New entry form state
  const [newOriginal, setNewOriginal] = useState('');
  const [newReplacement, setNewReplacement] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOriginal, setEditOriginal] = useState('');
  const [editReplacement, setEditReplacement] = useState('');

  // Vocal gender state for pronunciation testing (allows auditioning in female podcast voice or male voice)
  const [testGender, setTestGender] = useState<'pria' | 'wanita'>(
    activeVoice?.toLowerCase().includes('gadis') ? 'wanita' : 'pria'
  );

  useEffect(() => {
    if (activeVoice) {
      setTestGender(activeVoice.toLowerCase().includes('gadis') ? 'wanita' : 'pria');
    }
  }, [activeVoice]);

  // Audio testing preview state
  const [testingWord, setTestingWord] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Status message for save feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    const timer = setTimeout(() => {
      setStatusMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  };

  // Keyboard navigation for closing or cancelling edit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingId, onClose]);

  // Clean audio on unmount or close
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // Real-time match detection for the term being typed in newOriginal
  const matchInfo = useMemo(() => {
    const trimmed = newOriginal.trim();
    if (!scriptText || trimmed.length < 2) return null;
    const matches = findGlossaryMatches(scriptText, [
      { id: 'temp', original: trimmed, replacement: 'temp', category: 'custom', enabled: true },
    ]);
    return matches[0]?.matchCount || 0;
  }, [newOriginal, scriptText]);

  if (!isOpen) return null;

  // Test pronunciation audio via Edge TTS using the user's selected audition voice
  const handleTestAudio = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (testingWord === trimmed && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
      setTestingWord(null);
      return;
    }

    try {
      setTestingWord(trimmed);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }

      const voice = testGender === 'wanita' ? 'id-ID-GadisNeural' : 'id-ID-ArdiNeural';
      const rate = testGender === 'wanita' ? 1.06 : 1.0;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          voice,
          rate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Gagal menghasilkan sampel suara.');
      }

      const audio = new Audio(data.audioBase64);
      audioPreviewRef.current = audio;
      audio.onended = () => setTestingWord(null);
      audio.onerror = () => setTestingWord(null);
      await audio.play();
    } catch (err) {
      console.warn('Test audio preview error:', err);
      setTestingWord(null);
    }
  };

  // Helper to commit state AND persist immediately to LocalStorage
  const updateAndPersistGlossary = (newEntries: GlossaryEntry[], feedbackMsg?: string) => {
    setGlossary(newEntries);
    saveGlossaryToStorage(newEntries);
    if (feedbackMsg) {
      showStatus(feedbackMsg);
    }
  };

  const handleToggleEntry = (id: string) => {
    const updated = glossary.map(e => (e.id === id ? { ...e, enabled: !e.enabled } : e));
    updateAndPersistGlossary(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = newOriginal.trim();
    const rep = newReplacement.trim();
    if (!orig || !rep) return;

    // Check if word already exists
    const existingIndex = glossary.findIndex(
      e => e.original.toLowerCase() === orig.toLowerCase()
    );

    if (existingIndex >= 0) {
      // If already exists, update its replacement and ensure enabled
      const updated = [...glossary];
      updated[existingIndex] = {
        ...updated[existingIndex],
        original: orig,
        replacement: rep,
        enabled: true,
      };
      updateAndPersistGlossary(updated, `Pelafalan untuk "${orig}" berhasil diperbarui.`);
    } else {
      const newEntry: GlossaryEntry = {
        id: `custom_${Date.now()}`,
        original: orig,
        replacement: rep,
        category: 'custom',
        enabled: true,
      };
      const updated = [newEntry, ...glossary];
      updateAndPersistGlossary(updated, `Istilah "${orig}" berhasil disimpan ke kamus.`);
    }

    setNewOriginal('');
    setNewReplacement('');
    if (activeTab !== 'all' && activeTab !== 'custom') {
      setActiveTab('custom');
    }
  };

  const handleStartEdit = (entry: GlossaryEntry) => {
    setEditingId(entry.id);
    setEditOriginal(entry.original);
    setEditReplacement(entry.replacement);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditOriginal('');
    setEditReplacement('');
  };

  const handleSaveEdit = (id: string) => {
    const orig = editOriginal.trim();
    const rep = editReplacement.trim();
    if (!orig || !rep) return;

    const updated = glossary.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          original: orig,
          replacement: rep,
        };
      }
      return entry;
    });

    updateAndPersistGlossary(updated, `Perubahan pada "${orig}" berhasil disimpan.`);
    setEditingId(null);
  };

  const handleDeleteEntry = (id: string) => {
    const entry = glossary.find(e => e.id === id);
    const updated = glossary.filter(e => e.id !== id);
    updateAndPersistGlossary(updated, entry ? `"${entry.original}" dihapus dari kamus.` : undefined);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan kamus fonetik ke daftar standar awal? Koreksi kustom akan direset.')) {
      updateAndPersistGlossary(DEFAULT_GLOSSARY, 'Kamus fonetik dikembalikan ke setelan awal.');
      setEditingId(null);
    }
  };

  const counts = {
    all: glossary.length,
    tech: glossary.filter(e => e.category === 'tech').length,
    business: glossary.filter(e => e.category === 'business').length,
    indonesian: glossary.filter(e => e.category === 'indonesian').length,
    custom: glossary.filter(e => e.category === 'custom').length,
  };

  const filteredEntries = glossary.filter(entry => {
    const matchesSearch =
      entry.original.toLowerCase().includes(search.toLowerCase()) ||
      entry.replacement.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || entry.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="glossary-modal-title">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[#2a3447] bg-[#131722] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3447] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#181e2b] border border-[#2a3447] text-[#f59e0b]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 id="glossary-modal-title" className="text-sm font-bold text-slate-100">Kamus Fonetik & Pelafalan Istilah</h2>
              <p className="text-xs text-slate-400">
                Koreksi pelafalan singkatan dan istilah teknis agar terdengar fasih & natural
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-[#181e2b] hover:text-white transition-colors"
            aria-label="Tutup kamus"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Voice Switcher for Auditioning & Testing Pronunciation */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2a3447] bg-[#181e2b] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[#f59e0b] shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-200">Suara untuk Uji Dengar (Uji Suara):</span>
                <span className="block text-[11px] text-slate-400">Pilih vokal untuk mendengar hasil pelafalan istilah</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTestGender('wanita')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  testGender === 'wanita'
                    ? 'bg-purple-600/30 border border-purple-400 text-purple-200 shadow-sm'
                    : 'bg-[#131722] border border-[#2a3447] text-slate-400 hover:text-white'
                }`}
                title="Dengarkan dengan vokal Gadis (Host Podcast Wanita)"
              >
                <span>🎙️ Wanita (Gadis - Podcast)</span>
              </button>
              <button
                type="button"
                onClick={() => setTestGender('pria')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  testGender === 'pria'
                    ? 'bg-amber-600/30 border border-[#f59e0b] text-amber-200 shadow-sm'
                    : 'bg-[#131722] border border-[#2a3447] text-slate-400 hover:text-white'
                }`}
                title="Dengarkan dengan vokal Ardi (Pria)"
              >
                <span>🎙️ Pria (Ardi)</span>
              </button>
            </div>
          </div>

          {/* Add custom entry form */}
          <form onSubmit={handleAddCustom} className="rounded-lg border border-[#262f40] bg-[#181e2b] p-3.5 space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-200">
              Tambah Koreksi Pelafalan Baru
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[140px]">
                <input
                  type="text"
                  placeholder="Kata Asli (misal: VIMK26-S2)"
                  value={newOriginal}
                  onChange={e => setNewOriginal(e.target.value)}
                  className="w-full rounded-md border border-[#2a3447] bg-[#131722] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex-[1.2] min-w-[170px] flex gap-1.5">
                <input
                  type="text"
                  placeholder="Cara Ucap (misal: Ve-I-Em-K 26 S dua)"
                  value={newReplacement}
                  onChange={e => setNewReplacement(e.target.value)}
                  className="w-full rounded-md border border-[#2a3447] bg-[#131722] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f59e0b]"
                />
                <button
                  type="button"
                  onClick={() => handleTestAudio(newReplacement)}
                  disabled={!newReplacement.trim()}
                  className="flex items-center gap-1 rounded border border-[#2a3447] bg-[#131722] px-2.5 py-1.5 text-xs text-slate-300 hover:border-[#f59e0b] hover:text-[#f59e0b] disabled:opacity-40 transition-colors shrink-0"
                  title={`Dengarkan pelafalan ini dengan ${testGender === 'wanita' ? 'Wanita (Gadis)' : 'Pria (Ardi)'}`}
                >
                  {testingWord === newReplacement.trim() ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b]" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-[#f59e0b]" />
                  )}
                  <span>Uji Suara ({testGender === 'wanita' ? 'Wanita' : 'Pria'})</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newOriginal.trim() || !newReplacement.trim()}
                className="flex items-center gap-1 rounded-md bg-[#f59e0b] px-3.5 py-1.5 text-xs font-bold text-[#0c0e14] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </button>
            </div>

            {/* Smart Matching Hint */}
            {matchInfo !== null && (
              <div className="text-[11px] pt-1">
                {matchInfo > 0 ? (
                  <p className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Kata "{newOriginal.trim()}" cocok dengan {matchInfo} kemunculan di naskah slide Anda.</span>
                  </p>
                ) : (
                  <p className="text-amber-400/90 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      Istilah "{newOriginal.trim()}" belum ditemukan di naskah slide. Pastikan ejaan sama persis dengan yang tertulis di slide (misal di naskah Anda: "VIMK26-S2").
                    </span>
                  </p>
                )}
              </div>
            )}
          </form>

          {/* Quick Guide on Writing Natural Phonetic Spellings */}
          <div className="rounded-lg border border-[#262f40] bg-[#131722] p-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-[#f59e0b] mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Panduan Ejaan Fonetik Agar Suara Natural & Bebas Salah Angka Romawi:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="rounded bg-[#0c0e14] p-2 border border-[#2a3447]/60">
                <span className="font-semibold text-slate-200">1. Singkatan Huruf & Hindari Angka Romawi:</span>
                <p className="mt-0.5">
                  Untuk huruf &quot;V&quot; agar tidak tertukar angka Romawi VI (&quot;enam&quot;), gunakan ejaan vokal: <code className="text-[#f59e0b]">Ve-I-Em-Ka</code> atau <code className="text-[#f59e0b]">B-P-S</code>.
                </p>
              </div>
              <div className="rounded bg-[#0c0e14] p-2 border border-[#2a3447]/60">
                <span className="font-semibold text-slate-200">2. Kode Kuesioner & Angka:</span>
                <p className="mt-0.5">
                  Tulis kode dokumen secara fasih: contoh <code className="text-[#f59e0b]">Ve-I-Em-Ka 26 L dua</code> untuk &quot;VIMK26-L2&quot;, atau <code className="text-[#f59e0b]">Ve-I-Em-Ka 26 S dua</code> untuk &quot;VIMK26-S2&quot;.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(['all', 'tech', 'business', 'indonesian', 'custom'] as const).map(tab => {
                const label = tab === 'all' ? 'Semua' : tab;
                const count = counts[tab];
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-2.5 py-1 capitalize transition-colors flex items-center gap-1.5 ${
                      activeTab === tab
                        ? 'bg-[#1e2635] text-slate-100 font-semibold border border-[#3f4d67]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative min-w-[160px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari istilah..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md border border-[#2a3447] bg-[#131722] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          {/* List of Entries */}
          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {activeTab === 'custom' ? (
                  <p>Belum ada istilah kustom. Tambahkan kata singkatan atau istilah teknis pada formulir di atas.</p>
                ) : (
                  <p>Tidak ada istilah yang cocok.</p>
                )}
              </div>
            ) : (
              filteredEntries.map(entry => {
                const isEditing = editingId === entry.id;

                if (isEditing) {
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-[#f59e0b] bg-[#1a2232] p-2.5 shadow-md"
                    >
                      <div className="mb-1.5 flex items-center justify-between text-[11px] text-amber-400 font-medium">
                        <span>Edit Istilah & Pelafalan:</span>
                        <span className="font-mono uppercase text-[10px] text-slate-400">{entry.category}</span>
                      </div>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleSaveEdit(entry.id);
                        }}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editOriginal}
                          onChange={e => setEditOriginal(e.target.value)}
                          placeholder="Kata Asli"
                          className="flex-1 min-w-[110px] rounded border border-[#2a3447] bg-[#131722] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f59e0b]"
                          autoFocus
                        />
                        <span className="text-slate-400 font-bold">→</span>
                        <div className="flex-1 min-w-[130px] flex gap-1">
                          <input
                            type="text"
                            value={editReplacement}
                            onChange={e => setEditReplacement(e.target.value)}
                            placeholder="Cara Ucap"
                            className="w-full rounded border border-[#2a3447] bg-[#131722] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f59e0b]"
                          />
                          <button
                            type="button"
                            onClick={() => handleTestAudio(editReplacement)}
                            disabled={!editReplacement.trim()}
                            className="rounded border border-[#2a3447] bg-[#131722] px-2 py-1 text-slate-300 hover:text-[#f59e0b] disabled:opacity-40"
                            title="Uji suara pelafalan ini"
                          >
                            {testingWord === editReplacement.trim() ? (
                              <Loader2 className="h-3 w-3 animate-spin text-[#f59e0b]" />
                            ) : (
                              <Volume2 className="h-3 w-3 text-[#f59e0b]" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="submit"
                            disabled={!editOriginal.trim() || !editReplacement.trim()}
                            className="flex items-center gap-1 rounded bg-[#f59e0b] px-3 py-1.5 text-xs font-bold text-[#0c0e14] hover:bg-[#d97706] disabled:opacity-50 transition-colors"
                            title="Simpan perubahan"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 rounded border border-[#2a3447] bg-[#131722] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#1e2635] hover:text-white transition-colors"
                            title="Batal"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Batal</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-[#262f40] bg-[#181e2b] px-3 py-2 text-xs hover:border-[#333f56] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={entry.enabled}
                        onChange={() => handleToggleEntry(entry.id)}
                        className="rounded accent-[#f59e0b] cursor-pointer"
                        title={entry.enabled ? 'Nonaktifkan istilah ini' : 'Aktifkan istilah ini'}
                        aria-label={`Aktifkan pelafalan ${entry.original}`}
                      />
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${entry.enabled ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
                          {entry.original}
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className={`font-mono ${entry.enabled ? 'text-slate-300' : 'text-slate-500'}`}>
                          {entry.replacement}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio preview button on every row */}
                      <button
                        type="button"
                        onClick={() => handleTestAudio(entry.replacement)}
                        className="rounded p-1 text-slate-400 hover:bg-[#131722] hover:text-[#f59e0b] transition-colors"
                        title={`Uji suara "${entry.replacement}"`}
                        aria-label={`Uji suara ${entry.original}`}
                      >
                        {testingWord === entry.replacement ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b]" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <span className="rounded bg-[#131722] border border-[#2a3447] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
                        {entry.category}
                      </span>

                      {/* Edit Button for every entry */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(entry)}
                        className="rounded p-1 text-slate-400 hover:bg-[#131722] hover:text-[#f59e0b] transition-colors"
                        title="Edit istilah atau pelafalan"
                        aria-label={`Edit ${entry.original}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button for custom entries */}
                      {entry.category === 'custom' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="rounded p-1 text-slate-400 hover:bg-[#131722] hover:text-rose-400 transition-colors"
                          title="Hapus istilah kustom"
                          aria-label={`Hapus ${entry.original}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2a3447] px-6 py-3 text-xs">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset ke Bawaan</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#222938] border border-[#3f4d67] px-4 py-1.5 font-medium text-white hover:bg-[#2b3548] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
