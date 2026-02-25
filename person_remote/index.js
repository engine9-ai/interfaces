import schema from './schema.js';
import metrics from './metrics.js';
import id from './transforms/inbound/extract_identifiers.js';
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
  appendRemotePersonId: {
    description: 'Prepend a remote_person_id field to data',
    bindings: {
      remoteIds: {
        path: 'sql.query',
        options: {
          table: 'person_identifier',
          columns: [
            'person_id',
            'id_value',
            { eql: 'input.id', name: 'input_id' },
            { eql: 'input.plugin_id', name: 'plugin_id' }
          ],
          lookup: ['person_id'],
          joins: [
            {
              table: 'input',
              join_eql: 'person_identifier.source_input_id=input.id'
            }
          ],
          conditions: [{ eql: "id_type='remote_person_id'" }]
        }
      }
    },
    transform: (opts) => {
      const { batch, remoteIds, options } = opts;
      const { pluginId } = options;
      const idMap = remoteIds.reduce((a, b) => {
        if (pluginId !== b.plugin_id) return a;
        // quick lookup map
        a[b.person_id] = a[b.person_id] || b.id_value.split('.').pop();
        return a;
      }, {});
      batch.forEach((data) => {
        data.remote_person_id = idMap[data.person_id] || null;
      });
    }
  }
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
