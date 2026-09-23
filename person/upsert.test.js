import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import upsertPerson from './transforms/inbound/upsert_tables.js';

describe('person upsert_tables', () => {
  it('queues a name column only when that key is present', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 1, email: 'ada@example.com', given_name: 'Ada' }],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert.person, [{ id: 1, given_name: 'Ada' }]);
    assert.equal('family_name' in tablesToUpsert.person[0], false);
  });

  it('queues family_name alone when given_name is omitted', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 2, email: 'lovelace@example.com', family_name: 'Lovelace' }],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert.person, [{ id: 2, family_name: 'Lovelace' }]);
    assert.equal('given_name' in tablesToUpsert.person[0], false);
  });

  it('queues both names when both keys are present', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 3, given_name: 'Ada', family_name: 'Lovelace' }],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert.person, [{ id: 3, given_name: 'Ada', family_name: 'Lovelace' }]);
  });

  it('keeps an explicit null so that column clears', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 4, given_name: 'Ada', family_name: null }],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert.person, [{ id: 4, given_name: 'Ada', family_name: null }]);
  });

  it('clears a name when that key is present and null and the other name is omitted', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 5, family_name: null }],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert.person, [{ id: 5, family_name: null }]);
  });

  it('omits the person upsert when neither name key is present', async () => {
    const tablesToUpsert = {};
    await upsertPerson.transform({
      batch: [{ person_id: 6, email: 'ada@example.com' }, { email: 'no-id@example.com' }],
      tablesToUpsert
    });
    assert.equal('person' in tablesToUpsert, false);
  });

  it('throws when a name is present and person_id is missing', async () => {
    await assert.rejects(
      () =>
        upsertPerson.transform({
          batch: [{ given_name: 'Ada' }],
          tablesToUpsert: {}
        }),
      /no person_id/
    );
  });
});
