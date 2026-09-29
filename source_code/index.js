import schema from './schema.js';
import metrics from './metrics.js';
const metadata = {
  name: '@engine9/interfaces/source_code',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
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
