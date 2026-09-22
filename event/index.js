import schema from './schema.js';
import search from './search.js';

const metadata = {
  name: '@engine9/interfaces/event',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  },
  schemas: ['schema.js']
};

export { metadata, schema, search };
export default {
  metadata,
  schema,
  search
};
