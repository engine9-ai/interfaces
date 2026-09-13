import search from './search.js';
import segments, { personSegmentTableName, universeEmailPublished90d } from './segments.js';
import summary from './reports/summary.js';
import transactions from './reports/transactions.js';

const metadata = {
  name: '@engine9/interfaces/channels/email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  }
};

export const reports = {
  summary,
  transactions
};

export { metadata };
export { search };
export { segments };
export { personSegmentTableName };
export { universeEmailPublished90d };
export default {
  metadata,
  search,
  segments,
  reports,
  personSegmentTableName,
  universeEmailPublished90d
};
