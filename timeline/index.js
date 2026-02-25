import schema from './schema.js';
import upsert from './transforms/inbound/upsert_tables.js';
const metadata = {
  name: '@engine9/interfaces/timeline',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const transforms = {
  upsert
};
export { metadata };
export { schema };
export default {
  metadata,
  schema,
  transforms
};
