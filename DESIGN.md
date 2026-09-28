# DESIGN.md - IndoVoice Studio Design System

## 1. Product Identity & Purpose
IndoVoice Studio is an Indonesian voice-over production tool tailored for presentations, internship defenses, and educational slide decks. It is designed as a **Precision Audio Studio Workstation**—tactile, calm, reliable, and functional—inspired by professional digital audio workstations (DAWs) and modern high-productivity creator tools.

## 2. Design Dials
- **ENERGY**: 2 (Balanced, professional studio focus)
- **RHYTHM**: 2 (Clear visual hierarchy separating rack settings, slide editor, and master waveform)
- **MOTION**: 1 (Fast, tactile interactions; no endless looping animations, no bouncing)

## 3. Color Palette (Restrained Studio Hierarchy)
- **Base Surfaces**:
  - App Background: `#0c0e14` (Deep Charcoal Black)
  - Panel Background: `#131722` (Grounded Slate Base)
  - Card/Item Background: `#1a202c` (Studio Surface)
  - Hover/Active Surface: `#222938`
  - Border Primary: `#2d3748` (Crisp 1px border)
  - Border Subtle: `#1f2735`
- **Text & Content**:
  - Primary Text: `#f8fafc` (High contrast WCAG AAA)
  - Secondary Text: `#94a3b8` (WCAG AA compliant)
  - Muted/Metadata: `#64748b`
- **One Deliberate Accent (Studio Gold / Amber)**:
  - Primary Accent: `#f59e0b` (Amber 500)
  - Accent Muted/Background: `rgba(245, 158, 11, 0.12)`
  - Accent Active/Hover: `#d97706` (Amber 600)
  - Functional Indicators:
    - Success/Saved: `#10b981` (Emerald)
    - Warning/Caution: `#f59e0b` (Amber)
    - Danger/Error: `#ef4444` (Rose)

## 4. Typography
- **Headings & UI**: Inter / Clean system sans-serif with natural sentence casing (no wide-tracked uppercase screaming).
- **Timecodes & Metrics**: Monospaced font for rates, percentages, pause times, and duration (`font-mono`).

## 5. Anti-Slop Rules Applied
- **R-01 & R-13**: Zero harsh blue-to-purple or cyan neon gradients; zero page-wide glowing shadows.
- **R-04**: No random `<Sparkles />` AI stars on buttons or headers.
- **R-07**: Clean solid studio surfaces, no decorative fake background grids.
- **R-09**: No generic "AI Powered" capsule badges.
- **R-10**: No frosted glassmorphism on every surface. Surfaces are solid and readable.
- **R-11**: Deliberate border radii (`rounded-lg` for controls, `rounded-xl` for panels). No uniform pill buttons everywhere.
- **R-19**: No endless `animate-pulse` or bouncing indicators on static elements.
- **R-25 & R-32**: WCAG AA contrast on all labels, clearly visible focus rings for keyboard accessibility.
