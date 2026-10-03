import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requestRecommendations } from './_lib/anthropic';
import { mapAnthropicError } from './_lib/errors';
import { filterCandidates } from '../src/lib/filterVenues';
import { validateRecommendations } from '../src/lib/validate';
import { getCatalog } from '../src/lib/venues';
import type { Filtros, Idioma, RecommendApiResponse, RecommendRequestBody } from '../src/lib/types';

const MAX_TEXTO_LENGTH = 400;

function isValidFiltros(value: unknown): value is Filtros {
  return typeof value === 'object' && value !== null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'method_not_allowed', message: 'Use POST.' } satisfies RecommendApiResponse);
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Partial<RecommendRequestBody>;
  const texto = typeof body.texto === 'string' ? body.texto.trim() : '';

  if (!texto) {
    res.status(400).json({ ok: false, error: 'invalid_request', message: '"texto" is required.' } satisfies RecommendApiResponse);
    return;
  }
  if (texto.length > MAX_TEXTO_LENGTH) {
    res
      .status(400)
      .json({ ok: false, error: 'invalid_request', message: `"texto" must be at most ${MAX_TEXTO_LENGTH} characters.` } satisfies RecommendApiResponse);
    return;
  }

  const filtros: Filtros = isValidFiltros(body.filtros) ? body.filtros : {};
  const idioma: Idioma = body.idioma === 'en' ? 'en' : 'es';

  const catalog = getCatalog();
  const candidates = filterCandidates(catalog, filtros, texto);

  try {
    const aiResult = await requestRecommendations({ texto, filtros, idioma, candidates });
    const { recomendaciones, descartados } = validateRecommendations(aiResult.recommendations, catalog);

    if (recomendaciones.length === 0) {
      res
        .status(502)
        .json({ ok: false, error: 'no_recommendations', message: 'AI response had no valid catalog matches.' } satisfies RecommendApiResponse);
      return;
    }

    res.status(200).json({
      ok: true,
      plan_resumen: aiResult.plan_resumen,
      recomendaciones,
      meta: { candidatos_evaluados: candidates.length, descartados_invalidos: descartados },
    } satisfies RecommendApiResponse);
  } catch (err) {
    const mapped = mapAnthropicError(err);
    console.error('[api/recommend]', mapped.code, mapped.message, err);
    res.status(mapped.status).json({ ok: false, error: mapped.code, message: mapped.message } satisfies RecommendApiResponse);
  }
}
