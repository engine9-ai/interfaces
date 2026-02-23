import { getEntryTypeId, getTimelineEntryUUID } from '@engine9/input-tools';
/* appends a recurring int if recurs is specified */
function appendRecursId(d) {
  if (d.recurs_id !== undefined) return d;
  if (!d.recurs) return d;
  switch (d.recurs) {
    case 'semi-annually':
      d.recurs_id = 6;
      break;
    case 'annually':
      d.recurs_id = 5;
      break;
    case 'quarterly':
      d.recurs_id = 4;
      break;
    case 'monthly':
      d.recurs_id = 3;
      break;
    case 'weekly':
      d.recurs_id = 2;
      break;
    case 'daily':
      d.recurs_id = 1;
      break;
    default: {
      if (d.recurring_number > 1) d.recurs_id = 3;
      else d.recurs_id = 0;
    }
  }
  return d;
}
export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
export async function transform(opts) {
  const { batch, tablesToUpsert } = opts;
  if (batch.length === 0) return;
  tablesToUpsert.transaction = tablesToUpsert.transaction || [];
  batch.forEach((o) => {
    appendRecursId(o);
    o.entry_type_id = getEntryTypeId(o);
    o.id = getTimelineEntryUUID(o);
    tablesToUpsert.transaction.push(o);
  });
}
export default {
  bindings,
  transform
};
