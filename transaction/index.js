import schema from './schema.js';
import search from './search.js';
import metrics from './metrics.js';
import segments from './segments.js';
import upsert from './transforms/inbound/upsert_tables.js';
import appendTransactionSummary from './transforms/appendTransactionSummary.js';
const metadata = {
  name: '@engine9/interfaces/transaction',
  version: '1.1.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const transforms = {
  upsert,
  appendTransactionSummary
};
export { metadata };
export { schema };
export { metrics };
export { search };
export { segments };
export default {
  metadata,
  schema,
  metrics,
  transforms,
  search,
  segments
};
