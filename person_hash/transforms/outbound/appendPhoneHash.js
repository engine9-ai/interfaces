import { hashPhone } from '../../hash.js';

export const description =
  'Append phone_hash_v1 / phone_hash_md5 from plaintext phone or person_hash_phone. Does not append phone.';

export const bindings = {
  hashes: {
    path: 'sql.query',
    options: {
      table: 'person_hash_phone',
      columns: ['person_id', 'phone_hash_v1', 'phone_hash_md5'],
      lookup: ['person_id']
    }
  }
};

export const transform = ({ batch, hashes = [] }) => {
  const byPerson = {};
  hashes.forEach((row) => {
    if (!byPerson[row.person_id]) byPerson[row.person_id] = row;
  });
  batch.forEach((row) => {
    if (!row.phone_hash_v1) {
      const fromPhone = hashPhone(row.phone);
      if (fromPhone) {
        row.phone_hash_v1 = fromPhone.phone_hash_v1;
        row.phone_hash_md5 = row.phone_hash_md5 || fromPhone.phone_hash_md5;
      }
    }
    const stored = byPerson[row.person_id];
    if (stored) {
      row.phone_hash_v1 = row.phone_hash_v1 || stored.phone_hash_v1 || null;
      row.phone_hash_md5 = row.phone_hash_md5 || stored.phone_hash_md5 || null;
    }
  });
};

export default {
  description,
  bindings,
  transform
};
