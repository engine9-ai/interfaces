export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
const NAME_COLUMNS = ['given_name', 'family_name'];

export async function transform({ batch, tablesToUpsert }) {
  if (batch.length === 0) return;
  batch.forEach((o) => {
    const present = NAME_COLUMNS.filter((column) => Object.hasOwn(o, column));
    if (present.length === 0) return;
    if (!o.person_id) throw new Error('Cannot update name, no person_id');
    tablesToUpsert.person = tablesToUpsert.person || [];
    const row = { id: o.person_id };
    for (const column of present) row[column] = o[column];
    tablesToUpsert.person.push(row);
  });
}
export default {
  bindings,
  transform
};
