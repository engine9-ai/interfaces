import { TIMELINE_ENTRY_TYPES } from '@engine9/input-tools';

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
  if (!hasPlugin) {
    return {
      text: `Has a ${label} in the last ${days} days`,
      eql: {
        table: 'timeline',
        columns: ['person_id'],
        conditions: [
          { eql: `timeline.entry_type_id=${typeId}` },
          { eql: `timeline.ts >= date_sub(now(), interval ${days} day)` }
        ]
      }
    };
  }
  const safePluginId = String(pluginId).replace(/'/g, "''");
  return {
    text: `Has a ${label} from plugin ${safePluginId} in the last ${days} days`,
    eql: {
      table: 'timeline',
      joins: [
        {
          table: 'input',
          join_eql: 'timeline.input_id=input.id'
        }
      ],
      columns: ['person_id'],
      conditions: [
        { eql: `timeline.entry_type_id=${typeId}` },
        { eql: `input.plugin_id='${safePluginId}'` },
        { eql: `timeline.ts >= date_sub(now(), interval ${days} day)` }
      ]
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
