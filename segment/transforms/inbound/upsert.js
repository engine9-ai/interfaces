import { mergeIntoQueue } from '@engine9/input-tools';

export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' },
  uuidIsValid: { path: '@engine9/input-tools:uuidIsValid' }
};
export async function transform({ batch, tablesToUpsert, uuidIsValid, options }) {
  const { segmentIds } = options;
  const globalSegments = String(segmentIds || '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  batch.forEach((o) => {
    const localSegmentIds = String(o.segment_ids || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const allSegmentIds = [].concat(globalSegments).concat(localSegmentIds);
    if (allSegmentIds.length === 0) return;
    const invalid = allSegmentIds.filter((uuid) => !uuidIsValid(uuid));
    if (invalid.length > 0) throw new Error(`There are some invalid segment_ids:${invalid.join(',')}`);
    tablesToUpsert.person_segment = tablesToUpsert.person_segment || [];
    allSegmentIds.forEach((sid) =>
      mergeIntoQueue(
        tablesToUpsert.person_segment,
        {
          id: null,
          person_id: o.person_id,
          segment_id: sid
        },
        {
          keyFields: ['segment_id', 'person_id'],
          merge: (existing) => existing,
          label: 'person_segment'
        }
      )
    );
  });
  return batch;
}
export default {
  bindings,
  transform
};
