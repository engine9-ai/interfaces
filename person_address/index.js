import upsert from './transforms/inbound/upsert_tables.js';
import normalize from './transforms/inbound/normalize.js';
import appendAddress from './transforms/outbound/appendAddress.js';
import schema from './schema.js';

const metadata = {
  name: '@engine9/interfaces/person_address',
  version: '1.1.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  }
};

export const transforms = {
  normalize,
  upsert,
  appendAddress
};

export { metadata };
export { schema };
export default {
  metadata,
  schema,
  transforms
};
