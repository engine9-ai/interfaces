export const bindings = {
  databaseRemotes: {
    path: 'sql.query',
    options: { table: 'person_remote', lookup: ['remote_person_id'] }
  },
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
export const type = 'upsert';
export async function transform({ batch, databaseRemotes, tablesToUpsert }) {
  batch.forEach((o) => {
    if (!o.remote_person_id || !o.person_id) return;
    const remotePersonId = String(o.remote_person_id).trim();
    if (!remotePersonId) return;
    tablesToUpsert.person_remote = tablesToUpsert.person_remote || [];
    const matchingRemotes = databaseRemotes.filter((d) => d.remote_person_id === remotePersonId);
    const personRemotes = matchingRemotes.filter((d) => d.person_id === o.person_id);
    if (personRemotes.length > 1) {
      const byInput = personRemotes.filter((d) => d.source_input_id === o.input_id);
      if (byInput.length > 1) {
        throw new Error(
          `Cannot update remote person id, there are 2 database entries for person_id ${o.person_id} with remote_person_id ${remotePersonId} and input_id ${o.input_id}`
        );
      }
    }
    const existing =
      personRemotes.find((d) => d.source_input_id === o.input_id) ||
      (personRemotes.length === 1 ? personRemotes[0] : null);
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
