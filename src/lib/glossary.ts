import { GlossaryEntry } from './types';

export const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  // Tech & Development Loanwords
  { id: 'g1', original: 'UI/UX', replacement: 'yu-ai yu-eks', category: 'tech', enabled: true },
  { id: 'g2', original: 'API', replacement: 'A-P-I', category: 'tech', enabled: true },
  { id: 'g3', original: 'APIs', replacement: 'A-P-I-s', category: 'tech', enabled: true },
  { id: 'g4', original: 'Frontend', replacement: 'front end', category: 'tech', enabled: true },
  { id: 'g5', original: 'Backend', replacement: 'bek end', category: 'tech', enabled: true },
  { id: 'g6', original: 'Fullstack', replacement: 'ful stek', category: 'tech', enabled: true },
  { id: 'g7', original: 'CI/CD', replacement: 'si-ai si-di', category: 'tech', enabled: true },
  { id: 'g8', original: 'DevOps', replacement: 'dev ops', category: 'tech', enabled: true },
  { id: 'g9', original: 'Framework', replacement: 'freim wok', category: 'tech', enabled: true },
  { id: 'g10', original: 'Database', replacement: 'deita beis', category: 'tech', enabled: true },
  { id: 'g11', original: 'Deploy', replacement: 'di-ploy', category: 'tech', enabled: true },
  { id: 'g12', original: 'Deployment', replacement: 'di-ploy-men', category: 'tech', enabled: true },
  { id: 'g13', original: 'Workflow', replacement: 'wek flow', category: 'tech', enabled: true },
  { id: 'g14', original: 'Bug', replacement: 'bag', category: 'tech', enabled: true },
  { id: 'g15', original: 'Bugs', replacement: 'bags', category: 'tech', enabled: true },
  { id: 'g16', original: 'Feature', replacement: 'ficer', category: 'tech', enabled: true },
  { id: 'g17', original: 'Sprint', replacement: 'sprint', category: 'tech', enabled: true },
  { id: 'g18', original: 'Agile', replacement: 'e-jail', category: 'tech', enabled: true },
  { id: 'g19', original: 'MVP', replacement: 'em-vi-pi', category: 'tech', enabled: true },
  { id: 'g20', original: 'PRD', replacement: 'pi-ar-di', category: 'tech', enabled: true },
  { id: 'g21', original: 'AI', replacement: 'e-ai', category: 'tech', enabled: true },
  { id: 'g22', original: 'SQL', replacement: 'es-kyu-el', category: 'tech', enabled: true },
  { id: 'g23', original: 'Next.js', replacement: 'neks dot j-es', category: 'tech', enabled: true },

  // Business & Metrics
  { id: 'g24', original: 'KPI', replacement: 'kei-pi-ai', category: 'business', enabled: true },
  { id: 'g25', original: 'ROI', replacement: 'ar-o-ai', category: 'business', enabled: true },
  { id: 'g26', original: 'B2B', replacement: 'bi tu bi', category: 'business', enabled: true },
  { id: 'g27', original: 'B2C', replacement: 'bi tu si', category: 'business', enabled: true },
  { id: 'g28', original: 'SaaS', replacement: 'sas', category: 'business', enabled: true },
  { id: 'g29', original: 'Stakeholder', replacement: 'steik holder', category: 'business', enabled: true },
  { id: 'g30', original: 'Stakeholders', replacement: 'steik holders', category: 'business', enabled: true },
  { id: 'g31', original: 'Pitch deck', replacement: 'pic dek', category: 'business', enabled: true },
  { id: 'g32', original: 'Timeline', replacement: 'taim lain', category: 'business', enabled: true },
  { id: 'g33', original: 'Milestone', replacement: 'mail stoun', category: 'business', enabled: true },
  { id: 'g34', original: 'Deadline', replacement: 'ded lain', category: 'business', enabled: true },
  { id: 'g35', original: 'Feedback', replacement: 'fid bek', category: 'business', enabled: true },
  { id: 'g36', original: 'Q1', replacement: 'kyu wan', category: 'business', enabled: true },
  { id: 'g37', original: 'Q2', replacement: 'kyu tu', category: 'business', enabled: true },
  { id: 'g38', original: 'Q3', replacement: 'kyu tri', category: 'business', enabled: true },
  { id: 'g39', original: 'Q4', replacement: 'kyu for', category: 'business', enabled: true },

  // Indonesian Abbreviations, Institutions & Survey Codes
  { id: 'g40', original: 'dll.', replacement: 'dan lain-lain', category: 'indonesian', enabled: true },
  { id: 'g41', original: 'dll', replacement: 'dan lain-lain', category: 'indonesian', enabled: true },
  { id: 'g42', original: 'dsb.', replacement: 'dan sebagainya', category: 'indonesian', enabled: true },
  { id: 'g43', original: 'dst.', replacement: 'dan seterusnya', category: 'indonesian', enabled: true },
  { id: 'g44', original: 'tsb.', replacement: 'tersebut', category: 'indonesian', enabled: true },
  { id: 'g45', original: 'yg', replacement: 'yang', category: 'indonesian', enabled: true },
  { id: 'g46', original: 'dgn', replacement: 'dengan', category: 'indonesian', enabled: true },
  { id: 'g47', original: 'utk', replacement: 'untuk', category: 'indonesian', enabled: true },
  { id: 'g48', original: 'PT.', replacement: 'Perseroan Terbatas', category: 'indonesian', enabled: true },
  { id: 'g49', original: 'PT', replacement: 'P-T', category: 'indonesian', enabled: true },
  { id: 'g50', original: 'SDM', replacement: 'es-de-em', category: 'indonesian', enabled: true },
  { id: 'g51', original: 'BUMN', replacement: 'be-u-em-en', category: 'indonesian', enabled: true },
  { id: 'g52', original: 'KTP', replacement: 'ka-te-pe', category: 'indonesian', enabled: true },
  { id: 'g53', original: 'WFH', replacement: 'we-ef-ha', category: 'indonesian', enabled: true },
  { id: 'g54', original: 'WFO', replacement: 'we-ef-o', category: 'indonesian', enabled: true },
  { id: 'g55', original: 'BPS', replacement: 'B-P-S', category: 'indonesian', enabled: true },
  { id: 'g56', original: 'VIMK26-L2', replacement: 'Ve-I-Em-Ka 26 L dua', category: 'indonesian', enabled: true },
  { id: 'g57', original: 'VIMK25-L2', replacement: 'Ve-I-Em-Ka 25 L dua', category: 'indonesian', enabled: true },
  { id: 'g58', original: 'VIMK26-S2', replacement: 'Ve-I-Em-Ka 26 S dua', category: 'indonesian', enabled: true },
  { id: 'g59', original: 'VIMK2026-S2', replacement: 'Ve-I-Em-Ka 2026 S dua', category: 'indonesian', enabled: true },
  { id: 'g60', original: 'VIMK26', replacement: 'Ve-I-Em-Ka 26', category: 'indonesian', enabled: true },
  { id: 'g61', original: 'VIMK25', replacement: 'Ve-I-Em-Ka 25', category: 'indonesian', enabled: true },
  { id: 'g62', original: 'VIMK', replacement: 'Ve-I-Em-Ka', category: 'indonesian', enabled: true },
];

/**
 * Sanitizes glossary entries to eliminate Roman numeral collisions (e.g. legacy V-I-M-K read as "enam").
 * Custom entries created by the user are preserved EXACTLY as written without modification.
 */
export function sanitizeGlossaryEntries(entries: GlossaryEntry[]): GlossaryEntry[] {
  if (!Array.isArray(entries)) return DEFAULT_GLOSSARY;

  return entries.map(entry => {
    if (!entry || !entry.replacement) return entry;

    // NEVER modify custom entries created by the user
    if (entry.category === 'custom') {
      return entry;
    }

    let rep = entry.replacement;

    // Migrate Roman numeral VI collision in legacy default entries (v-i-m-k -> Ve-I-Em-Ka)
    if (/(?:v[- ]?i[- ]?m[- ]?k|v\s*i-mk)/i.test(rep)) {
      rep = rep.replace(/(?:v[- ]?i[- ]?m[- ]?k|v\s*i-mk)/gi, 'Ve-I-Em-Ka');
    }

    if (rep !== entry.replacement) {
      return { ...entry, replacement: rep };
    }
    return entry;
  });
}

/**
 * Normalizes Indonesian currency formats like Rp 150.000 or Rp. 25.000 to spoken Indonesian words
 */
function normalizeCurrencyAndNumbers(text: string): string {
  // Replace Rp. or Rp with word rupiah placed after, preserving trailing sentence punctuation
  return text.replace(/Rp\.?\s*([0-9]+(?:[.,][0-9]+)*)/gi, (match, amount) => {
    return `${amount} rupiah`;
  });
}

/**
 * Builds a smart regex that correctly respects word and hyphen boundaries
 * allowing acronyms before numbers/hyphens (e.g. VIMK26, VIMK26-L2) to match smoothly.
 */
function buildGlossaryRegex(original: string): RegExp {
  const isShortAcronym = original.length <= 3 && original === original.toUpperCase();
  const flags = isShortAcronym ? 'g' : 'gi';
  const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const startsWithLetter = /^[a-zA-Z]/.test(original);
  const startsWithDigit = /^[0-9]/.test(original);
  const endsWithLetter = /[a-zA-Z]$/.test(original);
  const endsWithDigit = /[0-9]$/.test(original);

  const lookbehind = startsWithLetter ? '(?<![a-zA-Z])' : startsWithDigit ? '(?<![0-9])' : '';
  const lookahead = endsWithLetter ? '(?![a-zA-Z])' : endsWithDigit ? '(?![0-9])' : '';

  return new RegExp(`${lookbehind}${escaped}${lookahead}`, flags);
}

/**
 * Applies glossary rules to input text
 */
export function applyGlossary(text: string, glossary: GlossaryEntry[]): string {
  if (!text) return '';
  let processed = normalizeCurrencyAndNumbers(text);

  const cleanGlossary = sanitizeGlossaryEntries(glossary || []);

  const activeRules = cleanGlossary.filter(
    entry => entry && entry.enabled && entry.original?.trim() && entry.replacement?.trim()
  );

  // Sort by original length descending to prevent substring collisions (e.g. "VIMK26-L2" before "VIMK26" before "VIMK")
  activeRules.sort((a, b) => b.original.length - a.original.length);

  for (const rule of activeRules) {
    const rawOrig = rule.original.trim();
    if (!rawOrig) continue;

    const regex = buildGlossaryRegex(rawOrig);
    processed = processed.replace(regex, rule.replacement.trim());
  }

  // Final guard: Only replace residual unmapped raw text 'V-I-M-K' if it risks Roman numeral VI ("enam")
  processed = processed
    .replace(/(?:v[- ]?i[- ]?m[- ]?k|v\s*i-mk)/gi, 'Ve-I-Em-Ka');

  return processed;
}

export interface GlossaryMatch {
  rule: GlossaryEntry;
  matchCount: number;
}

/**
 * Finds which glossary rules match in a given text and their occurrences
 */
export function findGlossaryMatches(text: string, glossary: GlossaryEntry[]): GlossaryMatch[] {
  if (!text) return [];
  const activeRules = (glossary || []).filter(
    entry => entry && entry.enabled && entry.original?.trim() && entry.replacement?.trim()
  );
  activeRules.sort((a, b) => b.original.length - a.original.length);

  const matches: GlossaryMatch[] = [];

  for (const rule of activeRules) {
    const rawOrig = rule.original.trim();
    if (!rawOrig) continue;

    const regex = buildGlossaryRegex(rawOrig);
    const occurrences = (text.match(regex) || []).length;
    if (occurrences > 0) {
      matches.push({ rule, matchCount: occurrences });
    }
  }

  return matches;
}
