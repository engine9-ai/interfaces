import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import upsertPhone from './transforms/inbound/upsert_tables.js';

describe('person_phone upsert_tables', () => {
  it('normalizes optional schema columns so every queued row has stable keys', async () => {
    const tablesToUpsert = {};
    await upsertPhone.transform({
      batch: [
        {
          person_id: 1,
          phone: '+12025550143',
          input_id: 'input-a',
          sms_status: 'Subscribed',
          phone_type: 'Cell',
          preference_order: 2,
          phone_hash_v1: 'hash-a',
          remote_phone_id: 'remote-1',
          sms_deliverability_score: 7,
          call_status: 'Subscribed'
        },
        {
          person_id: 2,
          phone: '+12025550144',
          input_id: 'input-b',
          sms_status: 'Subscribed',
          phone_type: 'Cell',
          preference_order: 2
          // intentionally omit phone_hash_v1 / remote_phone_id / sms_deliverability_score / call_status
        }
      ],
      databasePhones: [],
      tablesToUpsert
    });

    assert.equal(tablesToUpsert.person_phone.length, 2);
    const rowMissing = tablesToUpsert.person_phone.find((r) => r.person_id === 2);
    assert.ok(rowMissing, 'expected queued row for person_id 2');

    assert.ok('phone_hash_v1' in rowMissing, 'phone_hash_v1 key must exist');
    assert.ok('remote_phone_id' in rowMissing, 'remote_phone_id key must exist');
    assert.ok('sms_deliverability_score' in rowMissing, 'sms_deliverability_score key must exist');
    assert.ok('call_status' in rowMissing, 'call_status key must exist');

    assert.equal(rowMissing.phone_hash_v1, '', 'missing phone_hash_v1 normalizes to blank string');
    assert.equal(rowMissing.remote_phone_id, null, 'missing remote_phone_id normalizes to null');
    assert.equal(rowMissing.sms_deliverability_score, 100, 'missing sms_deliverability_score normalizes to 100');
    assert.equal(rowMissing.call_status, 'Not Subscribed', 'missing call_status normalizes to Not Subscribed');
  });
});
