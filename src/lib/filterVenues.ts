import type { Filtros, Precio, Venue } from './types';

const PRICE_RANK: Record<Precio, number> = { $: 1, $$: 2, $$$: 3 };

// Antojo keywords -> boosts on categoria/tags/ideal_para. Lightweight, deterministic,
// runs in code BEFORE the LLM ever sees a request — keeps the candidate list small
// and keeps the model from "discovering" venues outside the curated catalog.
const KEYWORD_BOOSTS: Array<{ pattern: RegExp; categorias?: string[]; tags?: string[]; idealPara?: string[] }> = [
  { pattern: /cita|romantic|romántic|pareja|date night/, idealPara: ['pareja'], tags: ['tranquilo', 'ambiente', 'vista'] },
  { pattern: /amigos|friends|peda|cruda|antro|bar/, idealPara: ['amigos'], categorias: ['bar'] },
  { pattern: /familia|family|niños|niñas|kids|hijos/, idealPara: ['familia'], categorias: ['familia'] },
  { pattern: /solo|sola|solx|by myself|alone/, idealPara: ['solo'] },
  { pattern: /barato|gratis|cheap|free|económic/, tags: ['gratis', 'barato'] },
  { pattern: /tranquilo|relax|chill|calm|quiet/, tags: ['tranquilo'] },
  { pattern: /aventura|adventure|activo|active/, tags: ['aventura'] },
  { pattern: /café|coffee|dulce/, categorias: ['café'] },
  { pattern: /comer|cenar|hambre|food|lunch|dinner|eat/, categorias: ['comida'] },
  { pattern: /museo|arte|museum|art|cultura|history|historia/, categorias: ['cultura'] },
  { pattern: /noche|night|bar|mezcal/, categorias: ['bar'], tags: ['noche'] },
  { pattern: /aire libre|naturaleza|outdoor|nature|mirador|vista/, categorias: ['naturaleza'] },
  { pattern: /compras|shopping|artesan/, tags: ['compras', 'artesanía'] },
];

const DIACRITICS_PATTERN = new RegExp('[̀-ͯ]', 'g');

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '');
}

function relevanceScore(venue: Venue, texto: string): number {
  const normText = normalize(texto);
  let score = 0;

  for (const boost of KEYWORD_BOOSTS) {
    if (!boost.pattern.test(normText)) continue;
    if (boost.categorias?.includes(venue.categoria)) score += 3;
    if (boost.idealPara?.some((p) => venue.ideal_para.includes(p as Venue['ideal_para'][number]))) score += 2;
    if (boost.tags?.some((t) => venue.tags.includes(t))) score += 2;
  }

  // Direct word overlap against nombre/tags/descripcion as a tie-breaker.
  const haystack = normalize(`${venue.nombre} ${venue.tags.join(' ')} ${venue.descripcion}`);
  const words = normText.split(/\s+/).filter((w) => w.length > 3);
  for (const w of words) {
    if (haystack.includes(w)) score += 1;
  }

  return score;
}

const MAX_CANDIDATES = 12;

/**
 * Narrows the full catalog down to a relevant subset using plain code (budget,
 * company, zone as hard filters; keyword relevance as a soft ranker) — this is
 * what runs *before* any call to Claude, so the model only ever sees a short,
 * pre-qualified list instead of the entire catalog.
 */
export function filterCandidates(catalog: Venue[], filtros: Filtros, texto: string): Venue[] {
  let pool = catalog;

  if (filtros.presupuesto) {
    pool = pool.filter((v) => PRICE_RANK[v.precio] <= PRICE_RANK[filtros.presupuesto as Precio]);
  }
  if (filtros.con_quien) {
    pool = pool.filter((v) => v.ideal_para.includes(filtros.con_quien as Venue['ideal_para'][number]));
  }
  if (filtros.zona) {
    pool = pool.filter((v) => v.zona === filtros.zona);
  }

  // Filters too narrow (or a mismatched combo) shouldn't dead-end the request —
  // fall back to the full catalog so the LLM still has real options to reason over.
  if (pool.length === 0) {
    pool = catalog;
  }

  const ranked = pool
    .map((v) => ({ v, score: relevanceScore(v, texto) }))
    .sort((a, b) => b.score - a.score);

  const candidates = ranked.slice(0, MAX_CANDIDATES).map((r) => r.v);
  return candidates.length > 0 ? candidates : catalog.slice(0, MAX_CANDIDATES);
}
