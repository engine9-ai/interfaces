import schema from './schema.js';
import metrics from './metrics.js';
const metadata = {
  name: '@engine9/interfaces/source_code',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export { metadata };
export { schema };
export { metrics };
export default {
  metadata,
  schema,
  metrics
};
