/**
 * CampusBite API Error Parser
 * Section 6 of Frontend Guide
 */

export function getErrorMessage(error) {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  // Check if error response exists from server
  if (error.response && error.response.data) {
    const detail = error.response.data.detail;

    // detail is a simple string error message (400, 401, 403, 404, 409, 429, 503)
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    // detail is a list of validation errors (FastAPI 422 Unprocessable Entity)
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (firstError && typeof firstError.msg === 'string') {
        return firstError.msg;
      }
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
