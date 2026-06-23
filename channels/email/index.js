import search from './search.js';
import segments, { personSegmentTableName, universeEmailPublished90d } from './segments.js';

const metadata = {
  name: '@engine9/interfaces/channels/email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0',
    '@engine9/interfaces/timeline': '>=1.0.0',
    '@engine9/interfaces/message': '>=1.0.0'
  }
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
  personSegmentTableName,
  universeEmailPublished90d
};
