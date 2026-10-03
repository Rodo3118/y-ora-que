import type { ErrorResponseBody, Filtros, Idioma, RecommendApiResponse, RecommendResponseBody } from './types';

export class ApiRequestError extends Error {
  code: ErrorResponseBody['error'] | 'network';

  constructor(code: ErrorResponseBody['error'] | 'network', message: string) {
    super(message);
    this.code = code;
  }
}

export async function fetchRecommendations(params: {
  texto: string;
  filtros: Filtros;
  idioma: Idioma;
}): Promise<RecommendResponseBody> {
  let response: Response;
  try {
    response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    throw new ApiRequestError('network', 'Network request failed.');
  }

  let data: RecommendApiResponse;
  try {
    data = (await response.json()) as RecommendApiResponse;
  } catch {
    throw new ApiRequestError('bad_response', 'Response was not valid JSON.');
  }

  if (!data.ok) {
    throw new ApiRequestError(data.error, data.message);
  }

  return data;
}
