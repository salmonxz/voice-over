# 🎙️ IndoVoice Studio - Precision Voice-Over Workstation

Aplikasi web studio produksi *voice-over* berbasis naskah per slide dengan suara alami bahasa Indonesia, kontrol audio presisi setara DAW (Digital Audio Workstation), serta kamus pelafalan cerdas untuk kebutuhan presentasi dan materi edukasi.

---

> ⚠️ **CATATAN PENTING / DISCLAIMER**  
> Repositori dan aplikasi ini dibuat **hanya untuk kebutuhan magang (internship project)**, khususnya untuk memfasilitasi pembuatan rekaman naskah *voice-over* presentasi hasil kerja, sidang magang, sosialisasi teknis, dan video tutorial materi slide deck edukasi. Proyek ini didokumentasikan sebagai arsip dan portofolio implementasi tugas magang pribadi.

---

## 🌟 Fitur-Fitur Utama

### 1. 🗣️ Dual Indonesian Neural Voice (Alami & Bebas Kuota)
Ditenagai oleh **Microsoft Edge Neural TTS** yang menghasilkan intonasi bahasa Indonesia sangat jernih, alami, dan 100% gratis tanpa memerlukan langganan API berbayar:
- **Ardi (`id-ID-ArdiNeural`)**: Karakter vokal pria yang berwibawa, berat, artikulasi tegas, dan percaya diri. Sangat ideal untuk sidang magang, presentasi eksekutif, dan pembacaan laporan resmi.
- **Gadis (`id-ID-GadisNeural`)**: Karakter vokal wanita yang hangat, ramah, jernih, dan luwes. Sangat pas untuk tutorial *how-to*, panduan sistem, dan e-learning.
- Dilengkapi fitur **Voice Preview** instan untuk mendengarkan sampel suara sebelum melakukan sintesis.

### 2. 🎭 Preset Persona Siap Pakai
Disediakan preset gaya penyampaian yang telah dikalibrasi sesuai kebutuhan skenario presentasi:
- **Sidang & Pitch Magang (Rekomendasi Magang)**: Artikulasi tegas, tempo sedikit dinamis (+5%), percaya diri, dan mantap untuk demo proyek di hadapan mentor atau penguji.
- **Tutorial & Demo Aplikasi**: Tempo terjaga lebih perlahan (0.88x) dengan jeda lebih santai agar pendengar mudah mengikuti langkah-langkah teknis.
- **Executive & Corporate Summary**: Vokal lebih berat dengan nada rendah (-3 pitch) dan tempo tenang untuk audiens pimpinan dan stakeholder.
- **Host Podcast & Storytelling**: Santai, luwes, dan ekspresif dengan tempo lincah (1.15x).

### 3. 📑 Slide-by-Slide Script Editor (Deck Mode)
- **Struktur Per Slide**: Naskah dipartisi terpisah per slide (Slide 1, Slide 2, dst.), memudahkan sinkronisasi dengan slide deck PowerPoint/Canva.
- **Estimasi Durasi Real-Time**: Otomatis menghitung jumlah kata dan estimasi durasi bicara per slide maupun total durasi keseluruhan.
- **Custom Persona Per Slide**: Anda dapat mengganti pembicara atau gaya vokal pada slide tertentu saja (misal: Slide 1 dibawakan oleh Ardi, lalu Slide 2 tutorial oleh Gadis).
- **Tag Jeda Suara (`[pause:500ms]`)**: Sisipkan jeda nafas atau jeda pergantian poin secara presisi langsung di dalam naskah.
- **Fleksibilitas Generate**: Generate audio per slide secara terpisah atau tombol **Batch Generate** untuk memproses seluruh slide sekaligus.

### 4. 🎚️ Precision Audio Delivery Sliders (Kontrol Vokal DAW)
Kendali penuh terhadap karakteristik suara dengan *slider* presisi:
- **Kecepatan Bicara (Speed/Rate)**: Dari 0.5x (sangat lambat) hingga 2.0x (sangat cepat).
- **Tinggi Nada (Pitch)**: Penyesuaian nada vokal dari -10Hz hingga +10Hz.
- **Volume Suara**: Kontrol tingkat kenyaringan suara (0% - 100%).
- **Durasi Jeda (Pause Duration)**: Menentukan durasi hening antar paragraf/kalimat (100ms - 2000ms).

### 5. 📖 Smart Pronunciation Glossary (Kamus Pelafalan Istilah Khusus)
Mengatasi kendala umum TTS yang kerap salah melafalkan akronim, istilah teknis, atau singkatan dinas/instansi:
- Otomatis mengubah teks ke bentuk pelafalan fonetik sebelum disintesis oleh engine TTS.
- **Contoh Istilah Bawaan**:
  - `VIMK` $\rightarrow$ *"ve-i-em-ka"*
  - `BPS` $\rightarrow$ *"be-pe-es"*
  - `VIMK25-L2` $\rightarrow$ *"ve-i-em-ka dua lima el dua"*
  - `Kuesioner` $\rightarrow$ *"ku-e-sio-ner"*
- **Manajemen Mandiri**: Pengguna dapat mencari, menyaring berdasarkan kategori, menambahkan istilah baru, mengedit, menghapus, serta melakukan tes audio langsung di modal glossary.

### 6. 🌊 Interactive Waveform Player (Wavesurfer.js)
- Visualisasi gelombang audio interaktif (*waveform*) untuk memeriksa dinamika suara.
- Fitur navigasi *seek*, play/pause, volume slider, dan timecode presisi dalam format monospaced font.
- Dapat memutar audio per slide maupun memutar hasil gabungan seluruh slide (*Master Player*).

### 7. 📄 Import Naskah Word (.docx) Otomatis
- Pengguna dapat mengunggah file naskah presentasi berformat Microsoft Word (`.docx`).
- Menggunakan parser cerdas (Mammoth.js) untuk mengekstrak heading dan paragraf, lalu otomatis memecahnya menjadi blok-blok slide yang siap disintesis.

### 8. 📦 Ekspor Multi-Format & Sinkronisasi Subtitle (SRT)
- **Download MP3 Per Slide**: Mengunduh rekaman audio dari masing-masing slide secara terpisah.
- **Batch Export ZIP**: Mengunduh seluruh audio slide yang terarsip rapi dalam satu file `.zip` (didukung oleh JSZip).
- **Ekspor Subtitle SRT**: Menghasilkan file subtitle `.srt` tersinkronisasi otomatis dengan estimasi *timing* akurat untuk memudahkan pembuatan caption video presentasi.
- **Gabung Audio Master**: Menggabungkan seluruh slide menjadi satu file MP3 utuh.
- **Backup Project JSON**: Ekspor dan impor data proyek lengkap (naskah, audio, pengaturan persona) untuk backup atau dipindahkan ke perangkat lain.

### 9. 💾 Auto-Save & Penyimpanan Lokal Persisten
- Menggunakan kombinasi **IndexedDB** dan **LocalStorage** di sisi peramban (*browser*).
- Naskah, hasil render audio, glosarium, dan konfigurasi tersimpan otomatis tanpa khawatir kehilangan data saat halaman di-refresh atau browser ditutup.

### 10. 🎨 Desain Studio Profesional (Dark Theme & Anti-Slop)
- Desain antarmuka gelap (*grounded studio slate & charcoal*) yang elegan, tenang, dan kontras tinggi (memenuhi standar aksesibilitas WCAG AA/AAA).
- Dirancang bebas dari animasi distraksi berlebihan, banner promosi palsu, atau elemen dekoratif yang tidak fungsional (*anti-slop standard*).

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Audio Synthesis Engine**: `msedge-tts` (Microsoft Edge Neural Text-to-Speech)
- **Visualisasi Audio**: [Wavesurfer.js 7](https://wavesurfer.xyz/)
- **Document & File Parsing**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX parser) & [JSZip](https://stuk.github.io/jszip/)

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.17 atau lebih baru
- npm / yarn / pnpm

### Langkah Instalasi
1. **Clone repositori**:
   ```bash
   git clone https://github.com/salmonxz/voice-over.git
   cd voice-over
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **(Opsional) Pengaturan Lingkungan**:
   Secara *default*, aplikasi langsung menggunakan Microsoft Edge Neural TTS gratis tanpa memerlukan API key. Jika Anda ingin menyediakan opsi fallback ElevenLabs, buat file `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

5. **Buka di Peramban**:
   Akses [http://localhost:3000](http://localhost:3000) melalui browser Anda.

---

## 📂 Struktur Direktori

```text
voice-over/
├── src/
│   ├── app/
│   │   ├── api/tts/          # Endpoint API untuk sintesis Edge Neural TTS
│   │   ├── globals.css       # Style global & tokens studio workstation
│   │   ├── layout.tsx        # Root layout Next.js
│   │   └── page.tsx          # Halaman utama IndoVoice Studio Workstation
│   ├── components/
│   │   ├── DeliverySliders.tsx  # Kontrol tempo, pitch, jeda, & volume
│   │   ├── ExportModal.tsx      # Modal download MP3, ZIP, SRT, & master audio
│   │   ├── GlossaryModal.tsx    # Modal kamus pelafalan istilah khusus
│   │   ├── ImportDocxModal.tsx  # Modal parser file dokumen Word (.docx)
│   │   ├── Navbar.tsx           # Bar navigasi utama & status penyimpanan
│   │   ├── PersonaSelector.tsx  # Pilihan persona & tombol preview suara
│   │   ├── ScriptEditor.tsx     # Editor naskah deck slide & single script
│   │   ├── SettingsModal.tsx    # Modal pengaturan engine & konfigurasi
│   │   ├── SlidePersonaModal.tsx# Kustomisasi persona per individu slide
│   │   ├── TipsModal.tsx        # Panduan & tips voice-over presentasi
│   │   └── WaveformPlayer.tsx   # Player audio interaktif Wavesurfer.js
│   └── lib/
│       ├── audio-utils.ts       # Utilitas manipulasi & penggabungan audio
│       ├── document-parser.ts   # Logika pemecah teks dari docx ke slide
│       ├── edge-tts.ts          # Integrasi sintesis Microsoft Edge TTS
│       ├── glossary.ts          # Dataset istilah teknis & fungsi replace pelafalan
│       ├── personas.ts          # Definisi preset persona & daftar suara
│       ├── srt-generator.ts     # Generator subtitle file .srt berbasis durasi
│       ├── storage.ts           # Manajemen IndexedDB & LocalStorage
│       └── types.ts             # Definisi tipe data TypeScript
├── DESIGN.md                 # Dokumentasi standar desain UI/UX workstation
├── package.json              # Daftar dependensi & script proyek
└── README.md                 # Dokumentasi utama proyek
```

---

## 👤 Pembuat

- **Ryehan Alfiansyah** ([@salmonxz](https://github.com/salmonxz))
- Dibuat untuk keperluan pengerjaan tugas & presentasi magang.
