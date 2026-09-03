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
    assert.ok('email_hash_v1' in tablesToUpsert.person_email[0], 'email_hash_v1 key must always exist');
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

  it('queues email_hash_v1 as blank string when missing on some input rows', async () => {
    const tablesToUpsert = {};
    await upsertEmails.transform({
      batch: [
        { person_id: 10, email: 'a@example.com', input_id: 'input-a', email_hash_v1: 'hash-a' },
        { person_id: 11, email: 'b@example.com', input_id: 'input-b' }
      ],
      databaseEmails: [],
      tablesToUpsert
    });
    assert.equal(tablesToUpsert.person_email.length, 2);
    const rowA = tablesToUpsert.person_email.find((r) => r.person_id === 10);
    const rowB = tablesToUpsert.person_email.find((r) => r.person_id === 11);
    assert.equal(rowA.email_hash_v1, 'hash-a');
    assert.equal(rowB.email_hash_v1, '', 'missing email_hash_v1 should normalize to blank string');
  });
});
