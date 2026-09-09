import schema from './schema.js';
import extractEmailHashes from './transforms/inbound/extract_identifiers.js';
import upsertPersonEmail from './transforms/inbound/upsert_tables.js';
import search from './search.js';
import appendEmail from './transforms/outbound/appendEmail.js';
import appendEmailHash from './transforms/outbound/appendEmailHash.js';
import segments from './segments.js';
import subscription_status from './reports/subscription_status.js';
const metadata = {
  name: '@engine9/interfaces/person_email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Inbound people pipeline slots -> transform export keys (woven by core when installed)
  inbound: {
    id: ['extractEmailHashes'],
    upsert: ['upsertPersonEmail']
  }
};
export const reports = {
  subscription_status
};
export const transforms = {
  extractEmailHashes,
  upsertPersonEmail,
  appendEmail,
  appendEmailHash
};
export { metadata };
export { schema };
export { search };
export { segments };
export default {
  metadata,
  reports,
  schema,
  search,
  segments,
  transforms
};
