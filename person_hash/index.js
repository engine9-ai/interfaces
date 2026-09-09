import schema from './schema.js';
import search from './search.js';
import extractContactHashes from './transforms/inbound/extract_identifiers.js';
import upsertPersonHash from './transforms/inbound/upsert_tables.js';
import appendEmailHash from './transforms/outbound/appendEmailHash.js';
import appendPhoneHash from './transforms/outbound/appendPhoneHash.js';

const metadata = {
  name: '@engine9/interfaces/person_hash',
  version: '1.0.0',
  unique: true,
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Inbound people pipeline slots -> transform export keys. Core weaves these in
  // whenever this plugin is installed; it never hardcodes this path.
  inbound: {
    id: ['extractContactHashes'],
    upsert: ['upsertPersonHash']
  }
};

export const transforms = {
  extractContactHashes,
  upsertPersonHash,
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
