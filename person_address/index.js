import upsert from './transforms/inbound/upsert_tables.js';
const metadata = {
  name: '@engine9/interfaces/person_name',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const transforms = {
  upsert
};
export { metadata };
export default {
  metadata,
  transforms
};
