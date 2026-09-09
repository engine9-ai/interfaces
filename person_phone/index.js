import schema from './schema.js';
import search from './search.js';
import segments from './segments.js';
import extractPhoneHashes from './transforms/inbound/extract_identifiers.js';
import upsertPersonPhone from './transforms/inbound/upsert_tables.js';
import appendPhoneHash from './transforms/outbound/appendPhoneHash.js';
const metadata = {
  name: '@engine9/interfaces/person_phone',
  version: '1.0.1',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Inbound people pipeline slots -> transform export keys (woven by core when installed)
  inbound: {
    id: ['extractPhoneHashes'],
    upsert: ['upsertPersonPhone']
  }
};
export const transforms = {
  extractPhoneHashes,
  upsertPersonPhone,
  appendPhoneHash
};
export { metadata };
export { schema };
export { search };
export { segments };
export default {
  metadata,
  schema,
  transforms,
  search,
  segments
};
