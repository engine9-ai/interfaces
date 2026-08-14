function hashCondition(column, value) {
  return {
    type: 'EQUALS',
    values: [
      { ref: { column } },
      { value: { value } }
    ]
  };
}

function hashColumnForValue(value, shaColumn, md5Column) {
  const hex = String(value || '').trim().toLowerCase();
  if (hex.length === 32) return md5Column;
  return shaColumn;
}

export const emailHashes = {
  form: {
    title: 'Email hashes',
    type: 'object',
    properties: {
      emailHash: {
        title: 'Email hash (SHA-256 or MD5 hex)',
        type: 'string'
      }
    }
  },
  optionsToEQL(options) {
    const { emailHash } = options;
    const conditions = [];
    let text = 'Has an email hash';
    if (emailHash) {
      const column = hashColumnForValue(emailHash, 'email_hash_v1', 'email_hash_md5');
      conditions.push(hashCondition(column, String(emailHash).trim().toLowerCase()));
      text = `Has email hash ${emailHash}`;
    }
    return {
      text,
      eql: {
        table: 'person_hash_email',
        columns: ['person_id'],
        conditions
      }
    };
  }
};

export const phoneHashes = {
  form: {
    title: 'Phone hashes',
    type: 'object',
    properties: {
      phoneHash: {
        title: 'Phone hash (SHA-256 or MD5 hex)',
        type: 'string'
      }
    }
  },
  optionsToEQL(options) {
    const { phoneHash } = options;
    const conditions = [];
    let text = 'Has a phone hash';
    if (phoneHash) {
      const column = hashColumnForValue(phoneHash, 'phone_hash_v1', 'phone_hash_md5');
      conditions.push(hashCondition(column, String(phoneHash).trim().toLowerCase()));
      text = `Has phone hash ${phoneHash}`;
    }
    return {
      text,
      eql: {
        table: 'person_hash_phone',
        columns: ['person_id'],
        conditions
      }
    };
  }
};

export default {
  emailHashes,
  phoneHashes
};
