import schema from './schema.js';
import search from './search.js';
import segments from './segments.js';
import id from './transforms/inbound/extract_identifiers.js';
import upsert from './transforms/inbound/upsert_tables.js';
import appendPhoneHash from './transforms/outbound/appendPhoneHash.js';
const metadata = {
  name: '@engine9/interfaces/person_email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const transforms = {
  id,
  upsert,
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
