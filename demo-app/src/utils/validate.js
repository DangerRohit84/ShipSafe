// utils/validate.js
// Input validation helpers — AFTER state pattern
// Used to reject bad input before it reaches DB queries

/**
 * Validates required string fields exist and are non-empty.
 * Returns { valid: true } or { valid: false, error: '...' }
 */
function requireFields(body, ...fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  return { valid: true };
}

/**
 * Validates a positive number (rejects 0, negative, NaN).
 */
function requirePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  return { valid: true };
}

/**
 * Validates string length within bounds.
 */
function requireLength(value, fieldName, min = 1, max = 255) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max} characters` };
  }
  return { valid: true };
}

/**
 * Validates email format.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { requireFields, requirePositiveNumber, requireLength, isValidEmail };
