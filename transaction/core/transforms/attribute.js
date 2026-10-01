import { mergeIntoQueue, uuidIsValid } from '@engine9/input-tools';

/*
  Batch stand-in for TransactionBase.attribute.

  Runs after the transaction upsert when the inbound weaver includes it.
  A first pass usually finds no override rows. Run it again to re-attribute
  once transaction_metadata_override has a row for the remote transaction.

  A message matches when its source code equals the transaction source code
  (or transaction_source_code_override) and publish_date is earlier than the
  transaction timestamp plus 29 hours. When several messages match, the latest
  publish_date wins.
*/

const PUBLISH_GRACE_MS = 29 * 60 * 60 * 1000;

function sqlQuote(value) {
  return String(value).replace(/'/g, "''");
}

export const bindings = ({ pluginId } = {}) => {
  if (!pluginId) {
    throw new Error('pluginId is required for attribute lookups');
  }
  if (!uuidIsValid(pluginId)) {
    throw new Error(`pluginId must be a uuid for attribute lookups, got ${pluginId}`);
  }
  const safePluginId = sqlQuote(pluginId);
  return {
    // remote_entry_id = remote_transaction_id, transaction_bot_id = plugin.remote_plugin_id
    overrides: {
      path: 'sql.query',
      options: {
        table: 'transaction_metadata_override',
        columns: [
          'remote_transaction_id',
          'transaction_bot_id',
          'transaction_source_code_override',
          'override_message_id',
          'ignore_reason',
          { eql: 'source_code_dictionary.source_code_id', name: 'dictionary_source_code_id' },
          { eql: 'message_source_code.source_code', name: 'matched_source_code' },
          { eql: 'message_source_code.message_id', name: 'matched_message_id' },
          { eql: 'message_source_code.publish_date', name: 'matched_publish_date' },
          { eql: 'global_message.id', name: 'matched_message_uuid' },
          { eql: 'global_message.publish_date', name: 'matched_message_publish_date' },
          { eql: 'global_message.do_not_attribute', name: 'matched_do_not_attribute' }
        ],
        lookup: [{ personIdField: 'remote_entry_id', tableLookupField: 'remote_transaction_id' }],
        joins: [
          {
            table: 'plugin',
            join_eql: 'transaction_metadata_override.transaction_bot_id=plugin.remote_plugin_id'
          },
          {
            table: 'source_code_dictionary',
            type: 'left',
            join_eql:
              'transaction_metadata_override.transaction_source_code_override=source_code_dictionary.source_code'
          },
          {
            table: 'message_source_code',
            type: 'left',
            join_eql: 'transaction_metadata_override.transaction_source_code_override=message_source_code.source_code'
          },
          {
            table: 'global_message',
            type: 'left',
            join_eql: 'message_source_code.message_id=global_message.message_id'
          }
        ],
        conditions: [{ eql: `plugin.id='${safePluginId}'` }]
      }
    },
    messageSourceCodes: {
      path: 'sql.query',
      options: {
        table: 'message_source_code',
        columns: [
          'source_code',
          'message_id',
          'publish_date',
          { eql: 'global_message.id', name: 'message_uuid' },
          { eql: 'global_message.publish_date', name: 'message_publish_date' },
          { eql: 'global_message.do_not_attribute', name: 'do_not_attribute' }
        ],
        lookup: [{ personIdField: 'source_code', tableLookupField: 'source_code' }],
        joins: [
          {
            table: 'global_message',
            type: 'left',
            join_eql: 'message_source_code.message_id=global_message.message_id'
          }
        ]
      }
    },
    // remote_input_id is only on input, so the plugin join does not make `id` ambiguous
    pluginInputs: {
      path: 'sql.query',
      options: {
        table: 'input',
        columns: [
          { eql: 'input.id', name: 'input_id' },
          'remote_input_id',
          { eql: 'plugin.remote_plugin_id', name: 'remote_plugin_id' }
        ],
        lookup: [{ personIdField: 'remote_input_id', tableLookupField: 'remote_input_id' }],
        joins: [
          {
            table: 'plugin',
            join_eql: 'input.plugin_id=plugin.id'
          }
        ],
        conditions: [{ eql: `plugin.id='${safePluginId}'` }]
      }
    },
    tablesToUpsert: { path: 'sql.tables.upsert' }
  };
};

export const type = 'upsert';

function blankToNull(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
}

function positiveInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function integerMessageId(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string' && uuidIsValid(value)) return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function publishIsBefore(publishDate, ts) {
  if (publishDate == null || publishDate === '' || ts == null || ts === '') return false;
  const publishMs = new Date(publishDate).getTime();
  const tsMs = new Date(ts).getTime();
  if (Number.isNaN(publishMs) || Number.isNaN(tsMs)) return false;
  return publishMs < tsMs + PUBLISH_GRACE_MS;
}

function candidateFromMessageSource(row) {
  const sourceCode = blankToNull(row?.source_code);
  if (!sourceCode) return null;
  const messageId = integerMessageId(row.message_id);
  const messageUuid = uuidIsValid(row.message_uuid) ? row.message_uuid : null;
  if (messageId == null && !messageUuid) return null;
  return {
    source_code: sourceCode,
    message_id: messageId,
    message_uuid: messageUuid,
    publish_date: row.message_publish_date || row.publish_date || null,
    do_not_attribute: row.do_not_attribute
  };
}

function candidateFromOverride(row) {
  const sourceCode = blankToNull(row?.matched_source_code);
  if (!sourceCode) return null;
  return candidateFromMessageSource({
    source_code: sourceCode,
    message_id: row.matched_message_id,
    message_uuid: row.matched_message_uuid,
    publish_date: row.matched_publish_date,
    message_publish_date: row.matched_message_publish_date,
    do_not_attribute: row.matched_do_not_attribute
  });
}

function chooseMessage(candidates, ts, { respectDoNotAttribute }) {
  let best = null;
  let bestPublish = null;
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (respectDoNotAttribute && Number(candidate.do_not_attribute) === 1) continue;
    if (!publishIsBefore(candidate.publish_date, ts)) continue;
    const publishMs = new Date(candidate.publish_date).getTime();
    const messageKey = String(candidate.message_id ?? candidate.message_uuid ?? '');
    const bestKey = best ? String(best.message_id ?? best.message_uuid ?? '') : '';
    if (!best || publishMs > bestPublish || (publishMs === bestPublish && messageKey < bestKey)) {
      best = candidate;
      bestPublish = publishMs;
    }
  }
  return best;
}

function remotePluginIdFor(row, pluginInputs, overrideBotId) {
  const remoteInputId = blankToNull(row.remote_input_id);
  if (remoteInputId) {
    const match = pluginInputs.find((p) => String(p.remote_input_id ?? '') === remoteInputId);
    if (match?.remote_plugin_id) return String(match.remote_plugin_id);
  }
  const inputId = row.input_id;
  if (inputId) {
    const match = pluginInputs.find((p) => (p.input_id ?? p.id) === inputId && p.remote_plugin_id);
    if (match?.remote_plugin_id) return String(match.remote_plugin_id);
  }
  return overrideBotId ? String(overrideBotId) : null;
}

function mergeAttribution(existing, incoming) {
  return { ...existing, ...incoming };
}

function mergeTransactionUpdate(existing, incoming) {
  return { ...existing, ...incoming, id: existing.id ?? incoming.id };
}

/*
  Upsert already queued this batch object: write the attribution columns onto
  that object. A later attribute pass queues a narrow transaction update by id.
*/
function applyTransactionAttribution(tablesToUpsert, row, fields) {
  Object.assign(row, fields);
  tablesToUpsert.transaction = tablesToUpsert.transaction || [];
  const queued = tablesToUpsert.transaction.find((item) => item === row || (row.id != null && item.id === row.id));
  if (queued) {
    if (queued !== row) Object.assign(queued, fields);
    return;
  }
  if (row.id == null || row.id === '') {
    throw new Error('attribute requires a transaction id, or a transaction row already queued by upsert');
  }
  mergeIntoQueue(tablesToUpsert.transaction, { id: row.id, ...fields }, {
    keyFields: ['id'],
    merge: mergeTransactionUpdate,
    label: 'transaction'
  });
}

export async function transform({
  batch,
  tablesToUpsert,
  overrides = [],
  messageSourceCodes = [],
  pluginInputs = []
}) {
  if (!batch?.length) return;
  tablesToUpsert.attribution = tablesToUpsert.attribution || [];

  const overridesByRemote = new Map();
  for (const row of overrides) {
    const remoteId = blankToNull(row.remote_transaction_id);
    if (!remoteId) continue;
    if (!overridesByRemote.has(remoteId)) overridesByRemote.set(remoteId, []);
    overridesByRemote.get(remoteId).push(row);
  }

  const messagesByCode = new Map();
  for (const row of messageSourceCodes) {
    const candidate = candidateFromMessageSource(row);
    if (!candidate) continue;
    if (!messagesByCode.has(candidate.source_code)) messagesByCode.set(candidate.source_code, []);
    messagesByCode.get(candidate.source_code).push(candidate);
  }

  batch.forEach((row) => {
    const remoteId = blankToNull(row.remote_entry_id);
    const overrideRows = remoteId ? overridesByRemote.get(remoteId) || [] : [];
    const override = overrideRows[0] || null;
    const overrideCode = blankToNull(override?.transaction_source_code_override);
    // An override row with a blank code does not fall back to the transaction
    // source code. The legacy column is NOT NULL default '', and attribute()
    // treats any non-null override as the only code to match.
    const usingOverride = override != null;
    const effectiveCode = usingOverride ? overrideCode : blankToNull(row.source_code);

    let overrideSourceCodeId = positiveInt(override?.dictionary_source_code_id);
    if (!overrideSourceCodeId && usingOverride && overrideCode === blankToNull(row.source_code)) {
      overrideSourceCodeId = positiveInt(row.source_code_id);
    }

    const overrideMessages = overrideRows.map(candidateFromOverride).filter(Boolean);
    const lookedUp = effectiveCode ? messagesByCode.get(effectiveCode) || [] : [];
    const match = chooseMessage(usingOverride ? [...overrideMessages, ...lookedUp] : lookedUp, row.ts, {
      respectDoNotAttribute: !usingOverride
    });

    const recommendedUuid = match?.message_uuid || null;
    const fields = {
      override_source_code_id: overrideSourceCodeId,
      final_source_code_id: overrideSourceCodeId > 0 ? overrideSourceCodeId : positiveInt(row.source_code_id),
      recommended_message_id: recommendedUuid,
      override_message_id:
        row.override_message_id && uuidIsValid(row.override_message_id) ? row.override_message_id : null,
      final_message_id: null
    };
    fields.final_message_id = fields.override_message_id || recommendedUuid || null;
    applyTransactionAttribution(tablesToUpsert, row, fields);

    if (!match || !remoteId || match.message_id == null) return;
    const botId = remotePluginIdFor(row, pluginInputs, override?.transaction_bot_id);
    if (!botId) {
      throw new Error(
        `attribute matched a message for remote_entry_id ${remoteId} but plugin.remote_plugin_id was not loaded`
      );
    }
    mergeIntoQueue(
      tablesToUpsert.attribution,
      {
        transaction_bot_id: botId,
        remote_transaction_id: remoteId,
        recommended_message_id: match.message_id
      },
      {
        keyFields: ['transaction_bot_id', 'remote_transaction_id'],
        merge: mergeAttribution,
        label: 'attribution'
      }
    );
  });
}

export default {
  bindings,
  type,
  transform
};
