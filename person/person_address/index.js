import upsertPersonAddress from './transforms/inbound/upsert_tables.js';
import normalize from './transforms/inbound/normalize.js';
import appendAddress from './transforms/outbound/appendAddress.js';
import schema from './schema.js';

const metadata = {
  name: '@engine9/interfaces/person_address',
  version: '1.1.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Inbound people pipeline slots -> transform export keys (woven by core when installed).
  // `normalize` stays a standalone export; upsert already normalizes inline.
  inbound: {
    upsert: ['upsertPersonAddress']
  }
};

export const transforms = {
  normalize,
  upsertPersonAddress,
  appendAddress
};

export { metadata };
export { schema };
export default {
  metadata,
  schema,
  transforms
};
