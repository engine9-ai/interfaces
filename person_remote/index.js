import schema from './schema.js';
import metrics from './metrics.js';
import id from './transforms/inbound/extract_identifiers.js';
import appendRemotePersonId from './transforms/outbound/appendRemotePersonId.js';
const metadata = {
  name: '@engine9/interfaces/person_remote',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export const search = {
  all: {
    form: {},
    name: 'All remote people',
    optionsToEQL: (options) => ({
      table: 'person_identifier',
      columns: ['person_id'],
      joins: [
        {
          table: 'input',
          join_eql: `source_input_id=input.id AND input.plugin_id='${options.pluginId}'`
        }
      ],
      conditions: [{ eql: "id_type='remote_person_id'" }]
    })
  }
};
export const transforms = {
  id,
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
