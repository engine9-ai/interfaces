import upsert from './transforms/inbound/upsert_tables.js';
import appendRemoteId from './transforms/appendRemoteId.js';
const metadata = {
  name: 'Custom Fields',
  prefix: 'person_custom',
  unique: false,
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  }
};
export const transforms = {
  upsert,
  appendRemoteId
};
export { metadata };
export default {
  metadata,
  transforms
};
