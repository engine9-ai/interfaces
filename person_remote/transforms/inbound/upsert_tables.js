export const bindings = ({ pluginId } = {}) => {
  if (!pluginId) {
    throw new Error('pluginId is required for person_remote upsert lookup');
  }
  return {
    databaseRemotes: {
      path: 'sql.query',
      options: {
        table: 'person_remote',
        columns: ['*'],
        lookup: ['remote_person_id'],
        joins: [
          {
            table: 'input',
            join_eql: 'person_remote.source_input_id=input.id'
          }
        ],
        conditions: [
          {
            type: 'EQUALS',
            values: [{ ref: 'input.plugin_id' }, { value: { value: pluginId } }]
          }
        ]
      }
    },
    tablesToUpsert: { path: 'sql.tables.upsert' }
  };
};
export const type = 'upsert';
export async function transform({ batch, databaseRemotes, tablesToUpsert }) {
  batch.forEach((o) => {
    if (!o.remote_person_id || !o.person_id) return;
    const remotePersonId = String(o.remote_person_id).trim();
    if (!remotePersonId) return;
    tablesToUpsert.person_remote = tablesToUpsert.person_remote || [];
    // databaseRemotes is already scoped to this plugin_id via the input join
    const matchingRemotes = databaseRemotes.filter((d) => d.remote_person_id === remotePersonId);
    const personRemotes = matchingRemotes.filter((d) => d.person_id === o.person_id);
    const existing =
      personRemotes.find((d) => d.source_input_id === o.input_id) || personRemotes[0] || null;
    const { id, ...rest } = o;
    if (id) {
      // this is undoubtedly NOT the ID of the person_remote record
    }
    if (existing) {
      if (!existing.source_input_id) {
        throw new Error(
          'Invalid source_input_id for existing person_remote record:' + JSON.stringify(existing)
        );
      }
      tablesToUpsert.person_remote.push({
        ...rest,
        id: existing.id,
        person_id: existing.person_id,
        remote_person_id: existing.remote_person_id,
        source_input_id: existing.source_input_id
      });
    } else {
      tablesToUpsert.person_remote.push({
        ...rest,
        id: null,
        person_id: o.person_id,
        remote_person_id: remotePersonId,
        source_input_id: o.input_id
      });
    }
  });
}
export default {
  bindings,
  type,
  transform
};
