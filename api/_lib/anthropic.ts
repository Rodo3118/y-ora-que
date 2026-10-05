import Anthropic from '@anthropic-ai/sdk';
import { BadResponseError, MissingApiKeyError } from './errors.js';
import type { AiRecommendationPayload, Filtros, Idioma, Venue } from '../../src/lib/types.js';

/** Single place to bump the model version. */
export const CLAUDE_MODEL = 'claude-sonnet-5';

const MAX_TOKENS = 1200;

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError('ANTHROPIC_API_KEY is not set on the server.');
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

const RECOMMEND_TOOL: Anthropic.Tool = {
  name: 'recommend_venues',
  description:
    'Devuelve exactamente 3 recomendaciones de lugares tomadas SOLO de la lista de candidatos dada, en el orden sugerido para el plan, junto con un resumen breve del plan.',
  input_schema: {
    type: 'object',
    properties: {
      plan_resumen: {
        type: 'string',
        description: 'Resumen de 1-2 frases del plan completo (el hilo entre los 3 lugares).',
      },
      recommendations: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            venue_id: {
              type: 'string',
              description: 'Debe ser exactamente uno de los "id" de la lista de candidatos.',
            },
            razon: {
              type: 'string',
              description: '1-2 frases explicando por qué este lugar encaja con lo que pidió el usuario.',
            },
            horario_sugerido: {
              type: 'string',
              description: 'Horario sugerido para visitar este lugar dentro del plan, ej. "5:30 pm".',
            },
            orden: {
              type: 'integer',
              description: 'Posición de este lugar en el plan (1, 2 o 3).',
            },
          },
          required: ['venue_id', 'razon', 'horario_sugerido', 'orden'],
        },
      },
    },
    required: ['plan_resumen', 'recommendations'],
  },
};

function compactVenue(v: Venue) {
  return {
    id: v.id,
    nombre: v.nombre,
    categoria: v.categoria,
    zona: v.zona,
    precio: v.precio,
    ideal_para: v.ideal_para,
    horario: v.horario,
    descripcion: v.descripcion,
    tags: v.tags,
  };
}

function buildUserPrompt(texto: string, filtros: Filtros, idioma: Idioma, candidates: Venue[]): string {
  const filtrosDesc =
    Object.entries(filtros)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'ninguno';

  return [
    `Idioma de respuesta requerido: ${idioma === 'en' ? 'inglés' : 'español'}.`,
    `Lo que se le antoja al usuario: "${texto}"`,
    `Filtros opcionales aplicados: ${filtrosDesc}`,
    '',
    'Lista de lugares candidatos (SOLO puedes elegir "venue_id" de esta lista, no inventes otros):',
    JSON.stringify(candidates.map(compactVenue), null, 2),
    '',
    'Elige exactamente 3 lugares distintos de la lista. Ordénalos en un plan realista (orden y horario_sugerido coherentes entre sí y con el horario de cada lugar). Da una razón breve y específica por lugar.',
  ].join('\n');
}

const SYSTEM_PROMPT = `Eres el motor de recomendaciones de "¿Y ora qué?", una app para planear salidas en Zacatecas, México.
Reglas estrictas:
1. SOLO puedes recomendar lugares cuyo "id" aparezca en la lista de candidatos que se te da en cada mensaje. Nunca inventes lugares ni uses un id fuera de esa lista.
2. Siempre debes llamar a la herramienta "recommend_venues" con exactamente 3 recomendaciones distintas.
3. El campo "razon" debe ser específico sobre por qué ese lugar en particular encaja con lo que pidió el usuario y sus filtros, no una descripción genérica del lugar.
4. El plan debe tener sentido como itinerario (orden lógico y horarios_sugeridos que no se contradigan entre sí ni con el horario real del lugar).
5. Responde en el idioma indicado en el mensaje del usuario.`;

export async function requestRecommendations(params: {
  texto: string;
  filtros: Filtros;
  idioma: Idioma;
  candidates: Venue[];
}): Promise<AiRecommendationPayload> {
  const client = getClient();
  const { texto, filtros, idioma, candidates } = params;

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    tools: [RECOMMEND_TOOL],
    tool_choice: { type: 'tool', name: 'recommend_venues' },
    messages: [{ role: 'user', content: buildUserPrompt(texto, filtros, idioma, candidates) }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === 'recommend_venues',
  );

  if (!toolUse) {
    throw new BadResponseError('Claude did not return a recommend_venues tool call.');
  }

  const input = toolUse.input as Partial<AiRecommendationPayload> | undefined;
  if (!input || !Array.isArray(input.recommendations) || typeof input.plan_resumen !== 'string') {
    throw new BadResponseError('Claude tool call input was malformed.');
  }

  return { plan_resumen: input.plan_resumen, recommendations: input.recommendations };
}
