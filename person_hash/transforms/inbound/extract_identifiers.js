import {
  hashEmail,
  hashPhone,
  isBlankSha256,
  resolvePhoneFromRow
} from '../../hash.js';

export const type = 'id';
export const description =
  'Extract email_hash_v1 / phone_hash_v1 identifiers from plaintext or existing hashes. Does not persist email or phone.';

function pushIdentifier(row, path, typeName, value) {
  if (!value || isBlankSha256(value)) return;
  row.identifiers = row.identifiers || [];
  if (row.identifiers.some((id) => id.type === typeName && id.value === value)) return;
  row.identifiers.push({ path, type: typeName, value });
}

function applyEmailHashes(row) {
  const fromEmail = hashEmail(row.email);
  if (fromEmail) {
    row.email = String(row.email).trim();
    row.email_hash_v1 = fromEmail.email_hash_v1;
    row.email_hash_md5 = fromEmail.email_hash_md5;
    pushIdentifier(row, 'person_hash_email', 'email_hash_v1', fromEmail.email_hash_v1);
    return;
  }
  if (row.email_hash_v1 && !isBlankSha256(row.email_hash_v1)) {
    pushIdentifier(row, 'person_hash_email', 'email_hash_v1', row.email_hash_v1);
  }
}

function applyPhoneHashes(row) {
  const rawPhone = resolvePhoneFromRow(row);
  if (!row.phone && rawPhone) {
    row.phone = rawPhone;
    row.phone_type = row.phone_type || 'Cell';
  }
  const fromPhone = hashPhone(row.phone);
  if (fromPhone) {
    row.phone = fromPhone.phone;
    row.phone_hash_v1 = fromPhone.phone_hash_v1;
    row.phone_hash_md5 = fromPhone.phone_hash_md5;
    pushIdentifier(row, 'person_hash_phone', 'phone_hash_v1', fromPhone.phone_hash_v1);
    return;
  }
  if (row.phone_hash_v1 && !isBlankSha256(row.phone_hash_v1)) {
    pushIdentifier(row, 'person_hash_phone', 'phone_hash_v1', row.phone_hash_v1);
    return;
  }
  if (row.phone && String(row.phone).replace(/[^0-9+]*/g, '').trim().length > 0) {
    // Too short to hash — drop plaintext so it cannot be stored downstream.
    row.phone = null;
    row.phone_hash_v1 = null;
    row.phone_hash_md5 = null;
  }
}

export async function transform({ batch }) {
  batch.forEach((row) => {
    applyEmailHashes(row);
    applyPhoneHashes(row);
  });
}

export default {
  type,
  description,
  transform
};
