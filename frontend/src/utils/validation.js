/**
 * Password validation helpers
 * Sourced from Section 16 of Frontend Guide and API_CONTRACT.md
 *
 * Rules:
 * 1. 8 to 72 bytes (measured with TextEncoder)
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one digit (0-9)
 * 5. At least one special character (any character that is not a letter or digit)
 */

export function getPasswordCriteria(password = '') {
  const str = String(password || '');
  const byteLength = new TextEncoder().encode(str).length;

  return {
    length: str.length >= 8 && byteLength <= 72,
    hasUpper: /[A-Z]/.test(str),
    hasLower: /[a-z]/.test(str),
    hasDigit: /\d/.test(str),
    hasSpecial: /[^A-Za-z0-9]/.test(str),
  };
}

/**
 * Single shared validation function used by both checklist and register submit
 */
export function isPasswordValid(password = '') {
  const criteria = getPasswordCriteria(password);
  return Object.values(criteria).every(Boolean);
}
