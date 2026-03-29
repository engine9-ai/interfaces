import { TIMELINE_ENTRY_TYPES } from '@engine9/input-tools';

/**
 * Build EQL for email engagement (opens / clicks) within a rolling window.
 *
 * The search always joins `timeline` → `input` on `timeline.input_id = input.id`.
 * During a segment build the DuckDB `input` table is populated exclusively with
 * the input ids discovered by the segment's `universe` entry (e.g.
 * `universeEmailPublished90d`), so the join scopes results to the universe even
 * when no explicit `pluginId` is provided.  When `pluginId` IS set, an additional
 * `input.plugin_id` filter is applied.
 */
function buildEmailEngagementEql({ pluginId, windowDays, timelineEntryType }) {
  const typeId = TIMELINE_ENTRY_TYPES[timelineEntryType];
  if (typeof typeId !== 'number') {
    throw new Error(`Invalid timelineEntryType for email engagement: ${timelineEntryType}`);
  }
  const days = parseInt(windowDays, 10);
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error('windowDays must be a positive number');
  }
  const label =
    timelineEntryType === 'EMAIL_OPEN'
      ? 'email open'
      : timelineEntryType === 'EMAIL_CLICK'
        ? 'email click'
        : timelineEntryType;
  const hasPlugin = pluginId != null && String(pluginId).trim() !== '';
  const conditions = [
    { eql: `timeline.entry_type_id=${typeId}` },
    { eql: `timeline.ts >= date_sub(now(), interval ${days} day)` }
  ];
  if (hasPlugin) {
    const safePluginId = String(pluginId).replace(/'/g, "''");
    conditions.push({ eql: `input.plugin_id='${safePluginId}'` });
  }
  const text = hasPlugin
    ? `Has a ${label} from plugin ${String(pluginId)} in the last ${days} days`
    : `Has a ${label} in the last ${days} days (scoped to universe inputs)`;
  return {
    text,
    eql: {
      table: 'timeline',
      joins: [
        {
          table: 'input',
          join_eql: 'timeline.input_id=input.id'
        }
      ],
      columns: ['person_id'],
      conditions
    }
  };
}

export const emailEngagement = {
  form: {
    title: 'Email engagement (opens / clicks)',
    type: 'object',
    properties: {
      pluginId: {
        title: 'Plugin ID',
        type: 'string'
      },
      windowDays: {
        title: 'Window (days)',
        type: 'number',
        enum: [30, 60, 90]
      },
      timelineEntryType: {
        title: 'Engagement type',
        type: 'string',
        enum: ['EMAIL_OPEN', 'EMAIL_CLICK']
      }
    },
    required: ['windowDays', 'timelineEntryType']
  },
  optionsToEQL(options) {
    return buildEmailEngagementEql(options);
  }
};

export default {
  emailEngagement
};
