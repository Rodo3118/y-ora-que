export type Categoria = 'cultura' | 'comida' | 'café' | 'bar' | 'naturaleza' | 'familia';
export type Precio = '$' | '$$' | '$$$';
export type IdealPara = 'pareja' | 'amigos' | 'familia' | 'solo';
export type HoraDelDia = 'mañana' | 'tarde' | 'noche';
export type Idioma = 'es' | 'en';

export interface Venue {
  id: string;
  nombre: string;
  categoria: Categoria;
  zona: string;
  precio: Precio;
  ideal_para: IdealPara[];
  horario: string;
  descripcion: string;
  tags: string[];
  verificar?: Record<string, boolean>;
}

export interface Filtros {
  presupuesto?: Precio;
  con_quien?: IdealPara;
  hora_del_dia?: HoraDelDia;
  zona?: string;
}

export interface RecommendRequestBody {
  texto: string;
  filtros?: Filtros;
  idioma?: Idioma;
}

export interface RawRecommendation {
  venue_id: string;
  razon: string;
  horario_sugerido: string;
  orden: number;
}

export interface AiRecommendationPayload {
  plan_resumen: string;
  recommendations: RawRecommendation[];
}

export interface Recommendation extends RawRecommendation {
  venue: Venue;
}

export interface RecommendResponseBody {
  ok: true;
  plan_resumen: string;
  recomendaciones: Recommendation[];
  meta: {
    candidatos_evaluados: number;
    descartados_invalidos: number;
  };
}

export type ErrorCode =
  | 'invalid_request'
  | 'method_not_allowed'
  | 'missing_api_key'
  | 'rate_limited'
  | 'upstream_error'
  | 'bad_response'
  | 'no_recommendations'
  | 'unknown_error';

export interface ErrorResponseBody {
  ok: false;
  error: ErrorCode;
  message: string;
}

export type RecommendApiResponse = RecommendResponseBody | ErrorResponseBody;
