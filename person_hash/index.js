import schema from './schema.js';
import search from './search.js';
import id from './transforms/inbound/extract_identifiers.js';
import upsert from './transforms/inbound/upsert_tables.js';
import appendEmailHash from './transforms/outbound/appendEmailHash.js';
import appendPhoneHash from './transforms/outbound/appendPhoneHash.js';

const metadata = {
  name: '@engine9/interfaces/person_hash',
  version: '1.0.0',
  unique: true,
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Named pipeline slots for extraTransforms / a future installed-plugin weaver.
  // Core must not hardcode this path in the standard inbound chain.
  inbound: {
    beforeIdentity: ['id'],
    beforeUpsert: ['upsert']
  }
};

export const transforms = {
  id,
  upsert,
  appendEmailHash,
  appendPhoneHash
};

export { metadata };
export { schema };
export { search };
export default {
  metadata,
  schema,
  transforms,
  search
};
