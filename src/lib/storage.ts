import { SlideBlock, EngineType, GlossaryEntry, DeliverySettings } from './types';
import { RECOVERED_SLIDES } from './recovered-slides';
import { DEFAULT_GLOSSARY, sanitizeGlossaryEntries } from './glossary';

const DB_NAME = 'indovoice_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const PROJECT_KEY = 'current_project';

export const GLOSSARY_STORAGE_KEY = 'indovoice_glossary';

/**
 * Saves phonetic glossary entries reliably to LocalStorage
 */
export function saveGlossaryToStorage(entries: GlossaryEntry[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(GLOSSARY_STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (err) {
    console.warn('LocalStorage glossary save failed:', err);
  }
}

/**
 * Loads phonetic glossary entries from LocalStorage or returns DEFAULT_GLOSSARY
 */
export function loadGlossaryFromStorage(): GlossaryEntry[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(GLOSSARY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any default entries that are missing in saved
          const existingOriginals = new Set(
            parsed.map((e: GlossaryEntry) => e?.original?.trim().toLowerCase())
          );
          const missingDefaults = DEFAULT_GLOSSARY.filter(
            def => !existingOriginals.has(def.original.trim().toLowerCase())
          );
          const combined = [...parsed, ...missingDefaults];
          return sanitizeGlossaryEntries(combined);
        }
      }
    }
  } catch (err) {
    console.warn('LocalStorage glossary load failed:', err);
  }
  return DEFAULT_GLOSSARY;
}

interface StoredProject {
  id: string;
  slides: SlideBlock[];
  singleText?: string;
  mode: 'single' | 'deck';
  engine?: EngineType;
  glossary?: GlossaryEntry[];
  deliverySettings?: DeliverySettings;
  updatedAt: number;
}

// Open / initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save complete project (including audio) to IndexedDB
export async function saveProjectToStorage(data: {
  slides: SlideBlock[];
  singleText?: string;
  mode: 'single' | 'deck';
  engine?: EngineType;
  glossary?: GlossaryEntry[];
  deliverySettings?: DeliverySettings;
}): Promise<void> {
  // 1. Save lightweight version to LocalStorage (strip audio to prevent QuotaExceededError)
  try {
    const lightSlides = data.slides.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('indovoice_slides_light', JSON.stringify(lightSlides));
    localStorage.setItem('indovoice_mode', data.mode);
    if (data.singleText) localStorage.setItem('indovoice_single_text', data.singleText);
    if (data.engine) localStorage.setItem('indovoice_engine', data.engine);
    if (data.glossary) saveGlossaryToStorage(data.glossary);
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  // 2. Save full project (including audios) to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredProject = {
      id: PROJECT_KEY,
      slides: data.slides,
      singleText: data.singleText,
      mode: data.mode,
      engine: data.engine,
      glossary: data.glossary,
      deliverySettings: data.deliverySettings,
      updatedAt: Date.now(),
    };

    store.put(record);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }
}

// Load project from IndexedDB or LocalStorage fallback
export async function loadProjectFromStorage(): Promise<{
  slides: SlideBlock[];
  singleText?: string;
  mode?: 'single' | 'deck';
  engine?: EngineType;
  glossary: GlossaryEntry[];
  deliverySettings?: DeliverySettings;
  isRecoveredDefault?: boolean;
}> {
  const fallbackGlossary = loadGlossaryFromStorage();

  // 1. Try IndexedDB first
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(PROJECT_KEY);

    const result = await new Promise<StoredProject | undefined>((resolve, reject) => {
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => reject(getReq.error);
    });

    if (result && Array.isArray(result.slides) && result.slides.length > 0) {
      return {
        slides: result.slides,
        singleText: result.singleText,
        mode: result.mode || 'deck',
        engine: result.engine,
        glossary: (result.glossary && Array.isArray(result.glossary) && result.glossary.length > 0)
          ? sanitizeGlossaryEntries(result.glossary)
          : fallbackGlossary,
        deliverySettings: result.deliverySettings,
        isRecoveredDefault: false,
      };
    }
  } catch (err) {
    console.warn('IndexedDB load failed, falling back:', err);
  }

  // 2. Try LocalStorage light slides
  try {
    const savedLight = localStorage.getItem('indovoice_slides_light');
    const savedMode = (localStorage.getItem('indovoice_mode') as 'single' | 'deck') || 'deck';
    const savedSingle = localStorage.getItem('indovoice_single_text') || undefined;
    const savedEngine = (localStorage.getItem('indovoice_engine') as EngineType) || undefined;
    const savedGlossary = loadGlossaryFromStorage();

    if (savedLight) {
      const parsed = JSON.parse(savedLight);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          slides: parsed,
          singleText: savedSingle,
          mode: savedMode,
          engine: savedEngine,
          glossary: savedGlossary,
          isRecoveredDefault: false,
        };
      }
    }
  } catch (err) {
    console.warn('LocalStorage load failed:', err);
  }

  // 3. Fallback to recovered 20 slides if no previous data
  return {
    slides: RECOVERED_SLIDES,
    mode: 'deck',
    glossary: fallbackGlossary,
    isRecoveredDefault: true,
  };
}

// Export project as JSON download
export function exportProjectToJson(slides: SlideBlock[], filename = 'indovoice_proyek_slides.json') {
  const data = {
    appName: 'IndoVoice Studio',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalSlides: slides.length,
    slides,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import project from JSON file
export function importProjectFromJson(file: File): Promise<SlideBlock[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else if (parsed && Array.isArray(parsed.slides)) {
          resolve(parsed.slides);
        } else {
          reject(new Error('Format file JSON tidak sesuai'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
