import { getEntryTypeId, getTimelineEntryUUID } from '@engine9/input-tools';
/* appends a recurs_id no matter what */
function appendRecursId(d) {
  //If there's a recurs_id that's positive, use it.
  if (parseInt(d.recurs_id)) {
    d.recurs_id = parseInt(d.recurs_id);
    return d;
  }
  //Otherwise set it based on the 'recurs' flag
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
  const { batch, tablesToUpsert, pluginId } = opts;
  if (batch.length === 0) return;
  tablesToUpsert.transaction = tablesToUpsert.transaction || [];
  const hasRecurs = batch.some((b) => b.recurs !== undefined || b.recurs_id !== undefined);

  batch.forEach((o) => {
    if (hasRecurs) {
      appendRecursId(o);
    }
    o.entry_type_id = getEntryTypeId(o);
    o.id = getTimelineEntryUUID(o, { defaults: { plugin_id: pluginId } });
    tablesToUpsert.transaction.push(o);
  });
}
export default {
  bindings,
  transform
};
