export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
export async function transform({ batch, tablesToUpsert }) {
  tablesToUpsert.timeline = tablesToUpsert.timeline || [];
  batch.forEach((o) => {
    if (o.timeline_id) {
      tablesToUpsert.timeline.push({
        id: o.timeline_id,
        ts: o.ts || new Date(),
        input_id: o.input_id,
        entry_type_id: o.entry_type_id,
        person_id: o.person_id,
        source_code_id: o.source_code_id
      });
    }
  });
}
export default {
  bindings,
  transform
};
