import { isBlankMd5, isBlankSha256 } from '../../hash.js';

export const type = 'upsert';
export const description =
  'Upsert person_hash_email / person_hash_phone from hashes on the batch. Never writes email or phone plaintext.';

export const bindings = {
  databaseEmailHashes: {
    path: 'sql.query',
    options: { table: 'person_hash_email', lookup: ['email_hash_v1'] }
  },
  databasePhoneHashes: {
    path: 'sql.query',
    options: { table: 'person_hash_phone', lookup: ['phone_hash_v1'] }
  },
  tablesToUpsert: { path: 'sql.tables.upsert' }
};

function usableSha256(value) {
  return Boolean(value) && !isBlankSha256(value);
}

function usableMd5(value) {
  if (value == null || value === '') return '';
  if (isBlankMd5(value)) return '';
  return value;
}

function findExisting(rows, personId, hashColumn, hashValue) {
  const matching = rows.filter((d) => d[hashColumn] === hashValue);
  const forPerson = matching.filter((d) => personId && d.person_id === personId);
  if (forPerson.length > 1) {
    throw new Error(
      `Cannot update ${hashColumn}, there are ${forPerson.length} database entries for person_id ${personId}`
    );
  }
  return forPerson[0] || null;
}

function pushHashRow(tablesToUpsert, table, existing, { person_id, hashColumn, hashValue, md5Column, md5Value, input_id }) {
  tablesToUpsert[table] = tablesToUpsert[table] || [];
  const md5 = md5Value || existing?.[md5Column] || '';
  tablesToUpsert[table].push({
    person_id: existing?.person_id || person_id,
    [hashColumn]: hashValue,
    [md5Column]: md5,
    source_input_id: existing?.source_input_id || input_id
  });
}

export async function transform({ batch, databaseEmailHashes, databasePhoneHashes, tablesToUpsert }) {
  if (batch.length === 0) return;
  const emailRows = databaseEmailHashes || [];
  const phoneRows = databasePhoneHashes || [];
  batch.forEach((row) => {
    if (!row.person_id) return;
    if (usableSha256(row.email_hash_v1)) {
      const existing = findExisting(emailRows, row.person_id, 'email_hash_v1', row.email_hash_v1);
      pushHashRow(tablesToUpsert, 'person_hash_email', existing, {
        person_id: row.person_id,
        hashColumn: 'email_hash_v1',
        hashValue: row.email_hash_v1,
        md5Column: 'email_hash_md5',
        md5Value: usableMd5(row.email_hash_md5),
        input_id: row.input_id
      });
    }
    if (usableSha256(row.phone_hash_v1)) {
      const existing = findExisting(phoneRows, row.person_id, 'phone_hash_v1', row.phone_hash_v1);
      pushHashRow(tablesToUpsert, 'person_hash_phone', existing, {
        person_id: row.person_id,
        hashColumn: 'phone_hash_v1',
        hashValue: row.phone_hash_v1,
        md5Column: 'phone_hash_md5',
        md5Value: usableMd5(row.phone_hash_md5),
        input_id: row.input_id
      });
    }
  });
}

export default {
  bindings,
  type,
  description,
  transform
};
