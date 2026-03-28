import schema from './schema.js';

const metadata = {
  name: '@engine9/interfaces/segment_stats',
  version: '1.0.0',
  schemas: ['schema.js'],
  dependencies: {
    '@engine9/interfaces/segment': '>1.0.0'
  }
};

export { metadata };
export { schema };
export default {
  metadata,
  schema
};
