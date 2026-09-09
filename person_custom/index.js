import upsertPersonCustom from './transforms/inbound/upsert_tables.js';
import appendRemoteId from './transforms/appendRemoteId.js';
const metadata = {
  name: 'Custom Fields',
  prefix: 'person_custom',
  unique: false,
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  // Inbound people pipeline slots -> transform export keys. Core expands the
  // upsert once per installed row (one custom field table per table_prefix).
  inbound: {
    upsert: ['upsertPersonCustom']
  }
};
export const transforms = {
  upsertPersonCustom,
  appendRemoteId
};
export { metadata };
export default {
  metadata,
  transforms
};
