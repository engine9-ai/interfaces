const SEGMENT_SEARCH_PATH = 'local$@engine9/interfaces/channels/email:search:emailEngagement';

/**
 * EQL over the message table: rows published in the last 90 days on the email channel.
 * `message.id` is the input_id used when the message is loaded as an input; stores are scanned for timeline parquet.
 */
export const universeEmailPublished90d = {
  type: 'inputs',
  eql: {
    table: 'message',
    columns: [{ column: 'id', name: 'input_id' }],
    conditions: [
      { eql: `channel='email'` },
      { eql: `publish_date >= date_sub(now(), interval 90 day)` }
    ]
  }
};

/** Materialized membership table: person_segment_<table_prefix>_<segment_name> (trailing _ on prefix trimmed to avoid __). */
export function personSegmentTableName(tablePrefix, segmentName) {
  const pre = String(tablePrefix ?? '')
    .trim()
    .replace(/_+$/u, '');
  return `person_segment_${pre}_${segmentName}`;
}

function emailEngagementSegment(name, windowDays, timelineEntryType) {
  return {
    name,
    universe: [universeEmailPublished90d],
    search: {
      and: [
        {
          path: SEGMENT_SEARCH_PATH,
          options: {
            pluginId: '',
            windowDays,
            timelineEntryType
          }
        }
      ]
    }
  };
}

/** Rolling windows; leave `pluginId` empty so timeline scope follows the segment `universe` (message input ids). */
export const openers_30d = emailEngagementSegment('30-day email openers', 30, 'EMAIL_OPEN');
export const openers_60d = emailEngagementSegment('60-day email openers', 60, 'EMAIL_OPEN');
export const openers_90d = emailEngagementSegment('90-day email openers', 90, 'EMAIL_OPEN');
export const clickers_30d = emailEngagementSegment('30-day email clickers', 30, 'EMAIL_CLICK');
export const clickers_60d = emailEngagementSegment('60-day email clickers', 60, 'EMAIL_CLICK');
export const clickers_90d = emailEngagementSegment('90-day email clickers', 90, 'EMAIL_CLICK');

export default {
  openers_30d,
  openers_60d,
  openers_90d,
  clickers_30d,
  clickers_60d,
  clickers_90d
};
