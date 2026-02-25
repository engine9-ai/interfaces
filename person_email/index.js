import schema from './schema.js';
import id from './transforms/inbound/extract_identifiers.js';
import upsert from './transforms/inbound/upsert_tables.js';
import search from './search.js';
import appendEmail from './transforms/outbound/appendEmail.js';
import appendEmailHash from './transforms/outbound/appendEmailHash.js';
import segments from './segments.js';
import subscription_status from './reports/subscription_status.js';
const metadata = {
  name: '@engine9/interfaces/person_email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const reports = {
  subscription_status
};
export const transforms = {
  id,
  upsert,
  appendEmail,
  appendEmailHash
};
export { metadata };
export { schema };
export { search };
export { segments };
export default {
  metadata,
  reports,
  schema,
  search,
  segments,
  transforms
};
