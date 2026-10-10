// ─── Error Message Extraction ─────────────────────────────────────────────────

/**
 * Axios generates generic messages like "Request failed with status code 404"
 * or "Network Error" that are not useful for end users. When we see one of
 * these we prefer the caller's fallback message instead.
 */
const isGenericAxiosMessage = (message: string): boolean => {
  const trimmed = message.trim();
  return (
    /^request failed with status code \d+$/i.test(trimmed) ||
    trimmed === 'Network Error'
  );
};

/**
 * Extract a human readable message from an API response body. The body may be
 * a parsed object ({ status: false, message: '...' }) or a raw JSON string
 * when the server responds with a non-JSON content type.
 */
const extractFromPayload = (payload: unknown): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null;
    }
    try {
      return extractFromPayload(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim();
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error.trim();
    }
  }

  return null;
};

/**
 * Get a user-friendly error message from any thrown value (axios error,
 * Error instance, plain { status, message } object, ...).
 *
 * Always prefers the message sent by the API (e.g. "Order not found.") and
 * never surfaces raw axios noise like "Request failed with status code 404".
 * Returns `fallback` when no meaningful message can be found.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as Record<string, any> | null | undefined;

  // 1. API error body: error.response.data.message (object or raw JSON string)
  const fromResponse = extractFromPayload(err?.response?.data);
  if (fromResponse) {
    return fromResponse;
  }

  // 2. Normalized payloads: error.data.message
  const fromData = extractFromPayload(err?.data);
  if (fromData) {
    return fromData;
  }

  // 3. error.message (Error instances, interceptor-normalized axios errors,
  //    plain { status, message } objects) — skip generic axios noise
  const direct = extractFromPayload(err);
  if (direct && !isGenericAxiosMessage(direct)) {
    return direct;
  }

  return fallback;
};
