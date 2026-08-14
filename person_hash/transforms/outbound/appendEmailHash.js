import { hashEmail } from '../../hash.js';

export const description =
  'Append email_hash_v1 / email_hash_md5 from plaintext email or person_hash_email. Does not append email.';

export const bindings = {
  hashes: {
    path: 'sql.query',
    options: {
      table: 'person_hash_email',
      columns: ['person_id', 'email_hash_v1', 'email_hash_md5'],
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
    if (!row.email_hash_v1) {
      const fromEmail = hashEmail(row.email);
      if (fromEmail) {
        row.email_hash_v1 = fromEmail.email_hash_v1;
        row.email_hash_md5 = row.email_hash_md5 || fromEmail.email_hash_md5;
      }
    }
    const stored = byPerson[row.person_id];
    if (stored) {
      row.email_hash_v1 = row.email_hash_v1 || stored.email_hash_v1 || null;
      row.email_hash_md5 = row.email_hash_md5 || stored.email_hash_md5 || null;
    }
  });
};

export default {
  description,
  bindings,
  transform
};
