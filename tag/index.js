import schema from './schema.js';
const metadata = {
  name: '@engine9/interfaces/tag',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export { metadata };
export { schema };
export default {
  metadata,
  schema
};
