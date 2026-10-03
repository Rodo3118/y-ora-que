import type { RawRecommendation, Recommendation, Venue } from './types';

interface ValidateResult {
  recomendaciones: Recommendation[];
  descartados: number;
}

/**
 * Claude is only ever shown a short list of candidates, but we still re-check
 * every returned venue_id against the FULL catalog here. Anything not in the
 * real catalog — hallucinated id, typo, id from a different request — gets
 * dropped instead of shown to the user.
 */
export function validateRecommendations(
  raw: RawRecommendation[] | undefined,
  catalog: Venue[],
): ValidateResult {
  const byId = new Map(catalog.map((v) => [v.id, v]));
  const seen = new Set<string>();
  const out: Recommendation[] = [];
  let descartados = 0;

  for (const r of raw ?? []) {
    if (!r || typeof r.venue_id !== 'string') {
      descartados += 1;
      continue;
    }
    const venue = byId.get(r.venue_id);
    if (!venue || seen.has(r.venue_id)) {
      descartados += 1;
      continue;
    }
    seen.add(r.venue_id);
    out.push({
      venue_id: r.venue_id,
      razon: typeof r.razon === 'string' && r.razon.trim() ? r.razon.trim() : '',
      horario_sugerido:
        typeof r.horario_sugerido === 'string' && r.horario_sugerido.trim() ? r.horario_sugerido.trim() : '',
      orden: typeof r.orden === 'number' ? r.orden : out.length + 1,
      venue,
    });
  }

  out.sort((a, b) => a.orden - b.orden);

  return { recomendaciones: out.slice(0, 3), descartados };
}
