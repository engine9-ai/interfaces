import upsert from './transforms/inbound/upsert_tables.js';
import appendAddress from './transforms/outbound/appendAddress.js';
const metadata = {
  name: '@engine9/interfaces/person_address',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  }
};
export const transforms = {
  upsert,
  appendAddress
};
export { metadata };
export default {
  metadata,
  transforms
};
