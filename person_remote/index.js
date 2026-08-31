import schema from './schema.js';
import metrics from './metrics.js';
import id from './transforms/inbound/extract_identifiers.js';
import upsert from './transforms/inbound/upsert_tables.js';
import appendRemotePersonId from './transforms/outbound/appendRemotePersonId.js';
const metadata = {
  name: '@engine9/interfaces/person_remote',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>=1.0.0'
  }
};
export const search = {
  all: {
    title: 'Remote people',
    name: 'All remote people',
    form: {
      title: 'Remote people',
      type: 'object',
      properties: {
        pluginId: {
          title: 'Plugin ID',
          type: 'string'
        }
      },
      required: []
    },
    optionsToEQL: (options) => ({
      table: 'person_remote',
      columns: ['person_id'],
      joins: [
        {
          table: 'input',
          join_eql: `person_remote.source_input_id=input.id AND input.plugin_id='${options.pluginId}'`
        }
      ]
    })
  }
};
export const transforms = {
  id,
  upsert,
  appendRemotePersonId
};
export { metadata };
export { schema };
export { metrics };
export default {
  metadata,
  schema,
  metrics,
  search,
  transforms
};
