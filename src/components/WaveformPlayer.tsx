'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  FastForward,
  Headphones,
} from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string | null;
  durationSeconds?: number;
  isGenerating?: boolean;
  onRegenerate: () => void;
  onOpenExport: () => void;
  title?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  durationSeconds = 0,
  isGenerating = false,
  onRegenerate,
  onOpenExport,
  title = 'Hasil Voice-Over',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#2a3447',
      progressColor: '#f59e0b',
      cursorColor: '#fbbf24',
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
      height: 64,
      normalize: true,
      url: audioUrl,
    });

    ws.on('ready', () => {
      setTotalDuration(ws.getDuration());
      ws.setVolume(volume);
      ws.setPlaybackRate(playbackRate);
    });

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleSeekReset = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(0);
      setCurrentTime(0);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume || 0.8);
    } else {
      if (wavesurferRef.current) wavesurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleRateCycle = () => {
    const rates = [1.0, 1.25, 1.5, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(nextRate);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <section aria-labelledby="player-empty-heading" className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[#2a3447] bg-[#131722] text-center p-4">
        <Headphones className="mb-2 h-5 w-5 text-slate-500" />
        <p id="player-empty-heading" className="text-xs font-medium text-slate-300">
          Belum ada rekaman suara yang dimuat
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Pilih slide atau naskah di atas lalu klik tombol &quot;Generate&quot; untuk mendengarkan hasil audio.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="player-heading" className="rounded-xl border border-[#2a3447] bg-[#131722] p-5">
      {/* Header Info */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          <h3 id="player-heading" className="text-xs font-semibold text-slate-200">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-slate-100">{formatTime(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="rounded-lg border border-[#262f40] bg-[#0c0e14] p-3">
        <div ref={containerRef} className="w-full cursor-pointer" />
      </div>

      {/* Player Controls Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={isGenerating}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f59e0b] text-[#0c0e14] transition-colors hover:bg-[#d97706] active:scale-95 disabled:opacity-50"
            title={isPlaying ? 'Jeda pemutaran' : 'Putar audio'}
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 ml-0.5 fill-current" />}
          </button>

          {/* Reset Seek */}
          <button
            type="button"
            onClick={handleSeekReset}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a3447] bg-[#181e2b] text-slate-300 transition-colors hover:bg-[#222938] hover:text-white"
            title="Kembali ke awal (00:00)"
            aria-label="Kembali ke awal"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleRateCycle}
            className="flex h-9 items-center gap-1 rounded-md border border-[#2a3447] bg-[#181e2b] px-2.5 text-xs font-mono font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white"
            title="Kecepatan putar playback"
          >
            <FastForward className="h-3.5 w-3.5 text-slate-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Volume / Mute */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white"
              title={isMuted ? 'Nyalakan suara' : 'Bisukan'}
              aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-[#f59e0b]"
              aria-label="Pengatur volume"
            />
          </div>
        </div>

        {/* Right Actions: Regenerate & Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-[#222938] hover:text-white disabled:opacity-50"
            title="Generate ulang audio ini"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin text-slate-400' : 'text-slate-400'}`} />
            <span>{isGenerating ? 'Memproses...' : 'Generate Ulang'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-md border border-[#2a3447] bg-[#181e2b] px-3.5 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-[#222938] hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-[#f59e0b]" />
            <span>Ekspor / Unduh Audio</span>
          </button>
        </div>
      </div>
    </section>
  );
};
