export const description =
  'Set a remote person id field on each row (default remote_person_id). Use options.pluginId or options.pluginIds (first match wins in list order) and optional outputField.';

export const bindings = {
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
};

export const transform = (opts) => {
  const { batch, remoteIds, options = {} } = opts;
  const { pluginId, pluginIds, outputField = 'remote_person_id' } = options;
  const orderedPluginIds =
    pluginIds && pluginIds.length > 0 ? pluginIds : pluginId ? [pluginId] : [];
  if (orderedPluginIds.length === 0) {
    throw new Error('appendRemotePersonId requires options.pluginId or options.pluginIds');
  }
  const byPerson = {};
  for (const b of remoteIds) {
    if (!orderedPluginIds.includes(b.plugin_id)) continue;
    const v = b.id_value.split('.').pop();
    if (!byPerson[b.person_id]) byPerson[b.person_id] = {};
    if (!byPerson[b.person_id][b.plugin_id]) byPerson[b.person_id][b.plugin_id] = v;
  }
  batch.forEach((data) => {
    let val = null;
    const per = byPerson[data.person_id];
    if (per) {
      for (const pid of orderedPluginIds) {
        if (per[pid]) {
          val = per[pid];
          break;
        }
      }
    }
    data[outputField] = val || null;
  });
};

export default {
  description,
  bindings,
  transform
};
