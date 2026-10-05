import Anthropic from '@anthropic-ai/sdk';
import type { ErrorCode } from '../../src/lib/types.js';

export class BadResponseError extends Error {}
export class MissingApiKeyError extends Error {}

export interface MappedError {
  status: number;
  code: ErrorCode;
  message: string;
}

/**
 * Translates whatever `requestRecommendations` throws into an HTTP status +
 * stable error code. The frontend maps `code` to a localized, friendly
 * message — this layer only needs to be correct, not pretty.
 */
export function mapAnthropicError(err: unknown): MappedError {
  if (err instanceof MissingApiKeyError) {
    return { status: 500, code: 'missing_api_key', message: err.message };
  }

  if (err instanceof BadResponseError) {
    return { status: 502, code: 'bad_response', message: err.message };
  }

  if (err instanceof Anthropic.APIError) {
    if (err.status === 401 || err.status === 403) {
      return { status: 500, code: 'missing_api_key', message: 'Anthropic API key was rejected (invalid or unauthorized).' };
    }
    if (err.status === 429) {
      return { status: 429, code: 'rate_limited', message: 'Rate limited by the Anthropic API.' };
    }
    if (err.status && err.status >= 500) {
      return { status: 502, code: 'upstream_error', message: `Anthropic API error (${err.status}).` };
    }
    return { status: 502, code: 'upstream_error', message: err.message };
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  return { status: 500, code: 'unknown_error', message };
}
