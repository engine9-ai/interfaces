const SEGMENT_SEARCH_PATH = 'local$@engine9/interfaces/channels/email:search:emailEngagement';

/**
 * EQL over the message table: rows published in the last 90 days on the email channel.
 * `message.id` is the input_id used when the message is loaded as an input; stores are
 * scanned for timeline parquet.
 *
 * During a segment build the input ids returned here are copied into the DuckDB `input`
 * table.  The search EQL (see `emailEngagement` in `search.js`) always joins
 * `timeline.input_id = input.id`, so only timeline rows whose input is in **this**
 * universe are considered — even when `pluginId` is empty.  This means:
 *
 * - The **universe** controls *which* message/input stores supply timeline data.
 * - The **search** applies time-window and entry-type filters *within* that scope.
 *
 * Both layers are required for correct segment membership counts.
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

/**
 * Build a segment definition for email engagement (opens or clicks).
 *
 * `pluginId` is left empty intentionally: the search handler in `search.js`
 * always joins `timeline` → `input`, and the segment `universe` determines
 * which input rows are present in DuckDB.  This scopes the time-window query
 * to the correct set of message inputs without hard-coding a plugin id.
 */
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

/**
 * Rolling-window engagement segments.  `pluginId` is empty so scope follows the
 * segment `universe` (the `input` table join in the search EQL restricts to
 * universe-provided message input ids).
 */
export const email_openers_30d = emailEngagementSegment('30-day email openers', 30, 'EMAIL_OPEN');
export const email_openers_60d = emailEngagementSegment('60-day email openers', 60, 'EMAIL_OPEN');
export const email_openers_90d = emailEngagementSegment('90-day email openers', 90, 'EMAIL_OPEN');
export const email_clickers_30d = emailEngagementSegment('30-day email clickers', 30, 'EMAIL_CLICK');
export const email_clickers_60d = emailEngagementSegment('60-day email clickers', 60, 'EMAIL_CLICK');
export const email_clickers_90d = emailEngagementSegment('90-day email clickers', 90, 'EMAIL_CLICK');

export default {
  email_openers_30d,
  email_openers_60d,
  email_openers_90d,
  email_clickers_30d,
  email_clickers_60d,
  email_clickers_90d
};
