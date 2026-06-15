/**
 * RFC 9457 Error Response Parser
 *
 * Normalizes backend error responses (RFC 9457 problem+json and legacy FastAPI/Pydantic)
 * into a consistent { title, detail, status, errors } shape.
 *
 * Always returns a valid result. Never throws. `errors` is always an array.
 */

/**
 * Parse an Axios error into a normalized error object.
 *
 * @param {Error} error - Axios error (or any error object with optional response)
 * @returns {{ title: string, detail: string, status: number|undefined, errors: Array<{pointer:string, detail:string, code:string|null}> }}
 */
export function parseApiError(error) {
  const data = error?.response?.data;

  // No data — network error (DNS failure, timeout, CORS)
  if (!data) {
    return {
      title: 'Error de Conexión',
      detail: 'No se pudo conectar con el servidor.',
      status: undefined,
      errors: [],
    };
  }

  // RFC 9457 shape: has type + title + status
  if (data.type && data.title && data.status !== undefined) {
    return {
      title: data.title,
      detail: typeof data.detail === 'string' ? data.detail : data.title,
      status: data.status,
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
  }

  // Legacy FastAPI/Pydantic: detail is an array with loc + msg
  if (Array.isArray(data.detail)) {
    const normalizedErrors = data.detail.map((err) => ({
      pointer: err.loc?.[err.loc.length - 1] || '',
      detail: err.msg || err.detail || '',
      code: err.type || null,
    }));
    return {
      title: 'Error de Validación',
      detail: data.detail[0]?.msg || data.detail[0]?.detail || 'Error de validación',
      status: error.response?.status,
      errors: normalizedErrors,
    };
  }

  // Legacy FastAPI/Pydantic: detail is a plain string
  if (typeof data.detail === 'string') {
    return {
      title: data.detail,
      detail: data.detail,
      status: error.response?.status,
      errors: [],
    };
  }

  // Unrecognized shape — warn and extract whatever we can
  console.warn('[parseApiError] Formato de error no reconocido:', data);
  return {
    title: typeof data.title === 'string' ? data.title : 'Error Desconocido',
    detail:
      typeof data.detail === 'string'
        ? data.detail
        : typeof data.message === 'string'
          ? data.message
          : 'Ha ocurrido un error inesperado.',
    status: data.status || error.response?.status,
    errors: Array.isArray(data.errors) ? data.errors : [],
  };
}

/**
 * Converts an RFC 9457 errors array (or legacy Pydantic detail array) into a
 * Record<fieldName, message> suitable for per-field form error display.
 *
 * @param {Array|undefined|null} errors - RFC 9457 errors array or old Pydantic detail array
 * @returns {Record<string, string>} field → message mapping; empty object for null/empty
 */
export function parseValidationErrors(errors) {
  if (!errors || !Array.isArray(errors) || errors.length === 0) {
    return {};
  }

  const result = {};
  for (const err of errors) {
    let field = '';

    // RFC 9457: pointer "#/name" → strip prefix
    if (typeof err.pointer === 'string') {
      field = err.pointer.replace(/^#\//, '');
    }
    // Legacy Pydantic: loc array ["body", "name"] → last element
    else if (Array.isArray(err.loc)) {
      field = err.loc[err.loc.length - 1] || '';
    }

    if (field) {
      result[field] = err.detail || err.msg || '';
    }
  }
  return result;
}
