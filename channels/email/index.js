import search from './search.js';
import segments, { personSegmentTableName, universeEmailPublished90d } from './segments.js';

const metadata = {
  name: '@engine9/interfaces/channels/email',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0',
    '@engine9/interfaces/timeline': '>1.0.0',
    '@engine9/interfaces/message': '>1.0.0'
  },
  /** Stable prefix for `segment.remote_segment_id` rows (SchemaWorker.deployPluginSegmentRowsFromModule). */
  segmentRemotePrefix: 'channels_email:interface:'
};

/**
 * Segment search runs against the messaging/timeline plugin, not this interface row.
 * Used by SchemaWorker.install when deploying all `segments` entries to the `segment` table.
 */
export async function resolveSegmentPluginId({ sqlWorker }) {
  const tryPaths = [
    'engine9-testing/sql-plugin-timeline',
    '@engine9-testing/sql-plugin-timeline',
    '@engine9/plugins/e9email'
  ];
  for (const p of tryPaths) {
    const {
      data: [{ id } = {}]
    } = await sqlWorker.query({ sql: 'select id from plugin where path = ? limit 1', values: [p] });
    if (id) return id;
  }
  return null;
}

export { metadata };
export { search };
export { segments };
export { personSegmentTableName };
export { universeEmailPublished90d };
export default {
  metadata,
  search,
  segments,
  personSegmentTableName,
  universeEmailPublished90d,
  resolveSegmentPluginId
};
