import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import upsertEmails from './transforms/inbound/upsert_tables.js';

describe('person_email upsert_tables', () => {
  it('merges duplicate email rows in one batch', async () => {
    const tablesToUpsert = {};
    await upsertEmails.transform({
      batch: [
        { person_id: 1, email: 'donor@example.com', input_id: 'input-a' },
        { person_id: 1, email: 'donor@example.com', input_id: 'input-b' }
      ],
      databaseEmails: [],
      tablesToUpsert
    });
    assert.equal(tablesToUpsert.person_email.length, 1);
    assert.equal(tablesToUpsert.person_email[0].source_input_id, 'input-a');
  });

  it('last batch row wins for subscription_status (Unsub then Sub in one file)', async () => {
    const tablesToUpsert = {};
    await upsertEmails.transform({
      batch: [
        {
          person_id: 2,
          email: 'toggle@example.com',
          input_id: 'input-a',
          entry_type: 'EMAIL_UNSUBSCRIBE',
          subscription_status: 'Unsubscribed'
        },
        {
          person_id: 2,
          email: 'toggle@example.com',
          input_id: 'input-b',
          subscription_status: 'Subscribed'
        }
      ],
      databaseEmails: [],
      tablesToUpsert
    });
    assert.equal(tablesToUpsert.person_email.length, 1);
    assert.equal(tablesToUpsert.person_email[0].subscription_status, 'Subscribed');
  });

  it('last batch row wins for subscription_status (Sub then Unsub in one file)', async () => {
    const tablesToUpsert = {};
    await upsertEmails.transform({
      batch: [
        {
          person_id: 3,
          email: 'toggle2@example.com',
          input_id: 'input-a',
          subscription_status: 'Subscribed'
        },
        {
          person_id: 3,
          email: 'toggle2@example.com',
          input_id: 'input-b',
          entry_type: 'EMAIL_UNSUBSCRIBE',
          subscription_status: 'Unsubscribed'
        }
      ],
      databaseEmails: [],
      tablesToUpsert
    });
    assert.equal(tablesToUpsert.person_email.length, 1);
    assert.equal(tablesToUpsert.person_email[0].subscription_status, 'Unsubscribed');
  });
});
