import nodecrypto from 'node:crypto';

const { createHash } = nodecrypto;

export const MIN_EMAIL_LENGTH = 5;
export const MIN_PHONE_LENGTH = 8;

/** SHA-256 hex digest of an empty string — must never be stored as an identifier. */
export const BLANK_SHA256_HEX = createHash('sha256').update('').digest('hex');
/** MD5 hex digest of an empty string — must never be stored as a hash. */
export const BLANK_MD5_HEX = createHash('md5').update('').digest('hex');

export function digestHex(algorithm, value) {
  return createHash(algorithm).update(String(value), 'utf8').digest('hex');
}

export function isBlankSha256(value) {
  return Boolean(value) && value === BLANK_SHA256_HEX;
}

export function isBlankMd5(value) {
  return Boolean(value) && value === BLANK_MD5_HEX;
}

/**
 * Trim + lowercase. Matching and hashing always use this form;
 * callers that persist plaintext should keep the original casing.
 */
export function normalizeEmail(email) {
  if (email == null) return '';
  return String(email).trim().toLowerCase();
}

/**
 * SHA-256 (`email_hash_v1`) and MD5 (`email_hash_md5`) of the normalized email.
 * Returns null when the email is missing or shorter than MIN_EMAIL_LENGTH.
 */
export function hashEmail(email) {
  const hashable = normalizeEmail(email);
  if (hashable.length < MIN_EMAIL_LENGTH) return null;
  return {
    email_hash_v1: digestHex('sha256', hashable),
    email_hash_md5: digestHex('md5', hashable)
  };
}

/**
 * Prefer `phone`, then mobile/cell aliases used on inbound person rows.
 */
export function resolvePhoneFromRow(row) {
  if (!row) return '';
  if (row.phone) return row.phone;
  return row.cell || row.mobile || row.mobile_phone || '';
}

/**
 * Strip to digits and `+`. US 10-digit numbers get `+1`; 11-digit numbers
 * starting with `1` get a leading `+`. Numbers already prefixed with `+`
 * are left as-is. Returns '' when the cleaned value is too short.
 */
export function normalizePhone(phone) {
  let cleaned = String(phone || '')
    .replace(/[^0-9+]*/g, '')
    .trim();
  if (!cleaned || cleaned.length < MIN_PHONE_LENGTH) return '';
  if (cleaned.indexOf('+') < 0) {
    if (cleaned.length === 10) cleaned = `+1${cleaned}`;
    else if (cleaned.length === 11 && cleaned.slice(0, 1) === '1') cleaned = `+${cleaned}`;
  }
  return cleaned;
}

/**
 * SHA-256 (`phone_hash_v1`) and MD5 (`phone_hash_md5`) of the normalized phone.
 * Returns null when the phone is missing or too short.
 */
export function hashPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return {
    phone: normalized,
    phone_hash_v1: digestHex('sha256', normalized),
    phone_hash_md5: digestHex('md5', normalized)
  };
}

export default {
  MIN_EMAIL_LENGTH,
  MIN_PHONE_LENGTH,
  BLANK_SHA256_HEX,
  BLANK_MD5_HEX,
  digestHex,
  isBlankSha256,
  isBlankMd5,
  normalizeEmail,
  hashEmail,
  resolvePhoneFromRow,
  normalizePhone,
  hashPhone
};
