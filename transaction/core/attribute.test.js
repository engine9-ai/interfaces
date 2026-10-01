import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import attribute from './transforms/attribute.js';
import upsert from './transforms/inbound/upsert_tables.js';

const pluginId = '00000000-0000-4000-8000-000000000001';
const inputId = '00000000-0000-4000-8000-000000000002';
const transactionId = '00000000-0000-4000-8000-000000000010';
const messageUuid = '00000000-0000-4000-8000-000000000003';
const laterMessageUuid = '00000000-0000-4000-8000-000000000004';

function row(extra = {}) {
  return {
    id: transactionId,
    ts: '2024-06-15T12:00:00.000Z',
    person_id: 7,
    remote_entry_id: 'txn-1',
    remote_input_id: 'form-1',
    input_id: inputId,
    source_code: 'SC_EG_123',
    source_code_id: 42,
    amount: 25,
    ...extra
  };
}

function pluginInputs() {
  return [{ input_id: inputId, remote_input_id: 'form-1', remote_plugin_id: 'bot-9' }];
}

function message(extra = {}) {
  return {
    source_code: 'SC_EG_123',
    message_id: 88,
    publish_date: '2024-06-01T00:00:00.000Z',
    message_uuid: messageUuid,
    message_publish_date: '2024-06-01T00:00:00.000Z',
    ...extra
  };
}

describe('transaction attribute', () => {
  it('requires a uuid pluginId on the lookup bindings', () => {
    assert.throws(() => attribute.bindings({}), /pluginId is required/);
    assert.throws(() => attribute.bindings({ pluginId: 'bot-9' }), /must be a uuid/);
  });

  it('patches a transaction already queued by upsert and writes attribution', async () => {
    const batch = [row()];
    const tablesToUpsert = { transaction: batch };
    await attribute.transform({
      batch,
      tablesToUpsert,
      pluginInputs: pluginInputs(),
      messageSourceCodes: [message()]
    });
    assert.equal(tablesToUpsert.transaction.length, 1);
    assert.equal(tablesToUpsert.transaction[0], batch[0]);
    assert.equal(batch[0].amount, 25);
    assert.equal(batch[0].recommended_message_id, messageUuid);
    assert.equal(batch[0].final_message_id, messageUuid);
    assert.equal(batch[0].final_source_code_id, 42);
    assert.equal('entry_type_id' in batch[0], false);
    assert.deepEqual(tablesToUpsert.attribution, [
      {
        transaction_bot_id: 'bot-9',
        remote_transaction_id: 'txn-1',
        recommended_message_id: 88
      }
    ]);
  });

  it('re-attributes an existing transaction from an override', async () => {
    const tablesToUpsert = {};
    await attribute.transform({
      batch: [row({ source_code: 'SC_ORIGINAL', source_code_id: 7 })],
      tablesToUpsert,
      pluginInputs: pluginInputs(),
      overrides: [
        {
          remote_transaction_id: 'txn-1',
          transaction_bot_id: 'bot-9',
          transaction_source_code_override: 'SC_OVERRIDE',
          dictionary_source_code_id: 99,
          matched_source_code: 'SC_OVERRIDE',
          matched_message_id: 55,
          matched_publish_date: '2024-06-02T00:00:00.000Z',
          matched_message_uuid: laterMessageUuid,
          matched_message_publish_date: '2024-06-02T00:00:00.000Z'
        }
      ],
      messageSourceCodes: [message({ source_code: 'SC_ORIGINAL', message_id: 11, message_uuid: messageUuid })]
    });
    assert.deepEqual(tablesToUpsert.transaction, [
      {
        id: transactionId,
        override_source_code_id: 99,
        final_source_code_id: 99,
        recommended_message_id: laterMessageUuid,
        override_message_id: null,
        final_message_id: laterMessageUuid
      }
    ]);
    assert.equal(tablesToUpsert.attribution[0].recommended_message_id, 55);
  });

  it('matches a message published inside the 29 hour window and rejects one past it', async () => {
    const within = {};
    await attribute.transform({
      batch: [row()],
      tablesToUpsert: within,
      pluginInputs: pluginInputs(),
      messageSourceCodes: [message({ message_id: 11, publish_date: '2024-06-16T16:00:00.000Z', message_publish_date: null })]
    });
    assert.equal(within.attribution.length, 1);

    const past = {};
    await attribute.transform({
      batch: [row()],
      tablesToUpsert: past,
      pluginInputs: pluginInputs(),
      messageSourceCodes: [message({ message_id: 11, publish_date: '2024-06-16T17:00:01.000Z', message_publish_date: null })]
    });
    assert.equal(past.attribution.length, 0);
    assert.equal(past.transaction[0].recommended_message_id, null);
  });

  it('picks the latest publish_date and skips do_not_attribute on the transaction source code', async () => {
    const tablesToUpsert = {};
    await attribute.transform({
      batch: [row()],
      tablesToUpsert,
      pluginInputs: pluginInputs(),
      messageSourceCodes: [
        message({ message_id: 11, publish_date: '2024-06-01T00:00:00.000Z', message_publish_date: '2024-06-01T00:00:00.000Z' }),
        message({
          message_id: 22,
          publish_date: '2024-06-10T00:00:00.000Z',
          message_publish_date: '2024-06-10T00:00:00.000Z',
          message_uuid: laterMessageUuid
        }),
        message({
          message_id: 33,
          publish_date: '2024-06-12T00:00:00.000Z',
          message_publish_date: '2024-06-12T00:00:00.000Z',
          message_uuid: '00000000-0000-4000-8000-000000000005',
          do_not_attribute: 1
        })
      ]
    });
    assert.equal(tablesToUpsert.transaction[0].recommended_message_id, laterMessageUuid);
    assert.equal(tablesToUpsert.attribution[0].recommended_message_id, 22);
  });

  it('does not fall back to the transaction source code when the override code is blank', async () => {
    const tablesToUpsert = {};
    await attribute.transform({
      batch: [row()],
      tablesToUpsert,
      pluginInputs: pluginInputs(),
      overrides: [
        {
          remote_transaction_id: 'txn-1',
          transaction_bot_id: 'bot-9',
          transaction_source_code_override: ''
        }
      ],
      messageSourceCodes: [message()]
    });
    assert.equal(tablesToUpsert.attribution.length, 0);
    assert.equal(tablesToUpsert.transaction[0].recommended_message_id, null);
  });

  it('does not attribute when the override code has no message', async () => {
    const tablesToUpsert = {};
    await attribute.transform({
      batch: [row()],
      tablesToUpsert,
      pluginInputs: pluginInputs(),
      overrides: [
        {
          remote_transaction_id: 'txn-1',
          transaction_bot_id: 'bot-9',
          transaction_source_code_override: 'SC_OVERRIDE'
        }
      ],
      messageSourceCodes: [message()]
    });
    assert.equal(tablesToUpsert.attribution.length, 0);
    assert.equal(tablesToUpsert.transaction[0].recommended_message_id, null);
  });

  it('throws when a legacy message id matches but remote_plugin_id was not loaded', async () => {
    await assert.rejects(
      () =>
        attribute.transform({
          batch: [
            row({
              remote_input_id: 'missing-form',
              input_id: '00000000-0000-4000-8000-000000000099'
            })
          ],
          tablesToUpsert: {},
          pluginInputs: pluginInputs(),
          messageSourceCodes: [message({ message_id: 11, message_uuid: null, message_publish_date: null })]
        }),
      /remote_plugin_id was not loaded/
    );
  });
});

describe('transaction upsert_tables', () => {
  it('maps recurs onto recurs_id', async () => {
    const tablesToUpsert = {};
    await upsert.transform({
      batch: [
        {
          ts: '2024-06-15T12:00:00.000Z',
          person_id: 7,
          entry_type: 'TRANSACTION',
          remote_entry_id: 'txn-week',
          recurs: 'weekly'
        }
      ],
      tablesToUpsert,
      pluginId
    });
    assert.equal(tablesToUpsert.transaction[0].recurs_id, 2);
    assert.equal(tablesToUpsert.transaction[0].entry_type_id, 10);
  });
});
