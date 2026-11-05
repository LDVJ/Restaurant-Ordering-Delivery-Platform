/**
 * CampusBite API Error Parser
 * Section 6 of Frontend Guide & Backend Error Structure
 */

export function getErrorMessage(error) {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  // Check if error response exists from server
  if (error.response && error.response.data) {
    const data = error.response.data;

    // Custom backend format: { detail: "Validation failed", errors: [{ field, message }] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (first && typeof first.message === 'string') {
        return first.message;
      }
    }

    const detail = data.detail;

    // detail is a simple string error message (400, 401, 403, 404, 409, 429, 503)
    if (typeof detail === 'string' && detail.trim().length > 0 && detail !== 'Validation failed') {
      return detail;
    }

    // detail is a list of validation errors (standard FastAPI 422 Unprocessable Entity)
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (firstError) {
        if (typeof firstError.msg === 'string') {
          return firstError.msg;
        }
        if (typeof firstError.message === 'string') {
          return firstError.message;
        }
      }
    }

    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }
  }

  // Network error or server unreachable
  if (error.request && !error.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  // If a standard Error object message is present and meaningful
  if (error.message && typeof error.message === 'string' && error.message !== 'Error') {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
