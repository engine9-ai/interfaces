export const tables = [
  {
    name: 'person_hash_email',
    columns: {
      person_id: 'person_id',
      email_hash_v1: {
        type: 'hash',
        description: 'SHA-256 hex of the trimmed, lowercased email (identity match key)'
      },
      email_hash_md5: {
        type: 'hash',
        nullable: true,
        default_value: '',
        description: 'MD5 hex of the trimmed, lowercased email; empty when plaintext was not available'
      },
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: ['person_id', 'email_hash_v1'], primary: true },
      { columns: ['email_hash_v1'] },
      { columns: ['email_hash_md5'] }
    ]
  },
  {
    name: 'person_hash_phone',
    columns: {
      person_id: 'person_id',
      phone_hash_v1: {
        type: 'hash',
        description: 'SHA-256 hex of the normalized E.164-style phone (identity match key)'
      },
      phone_hash_md5: {
        type: 'hash',
        nullable: true,
        default_value: '',
        description: 'MD5 hex of the normalized phone; empty when plaintext was not available'
      },
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: ['person_id', 'phone_hash_v1'], primary: true },
      { columns: ['phone_hash_v1'] },
      { columns: ['phone_hash_md5'] }
    ]
  }
];
export default {
  tables
};
