import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import {
  BLANK_MD5_HEX,
  BLANK_SHA256_HEX,
  hashEmail,
  hashPhone,
  normalizeEmail,
  normalizePhone,
  resolvePhoneFromRow
} from './hash.js';
import extractIdentifiers from './transforms/inbound/extract_identifiers.js';
import upsertHashes from './transforms/inbound/upsert_tables.js';

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
function md5(value) {
  return createHash('md5').update(value, 'utf8').digest('hex');
}

describe('person_hash helpers', () => {
  it('hashes trimmed lowercased email with sha256 and md5', () => {
    const hashes = hashEmail('  TeSt@Example.COM  ');
    assert.equal(hashes.email_hash_v1, sha256('test@example.com'));
    assert.equal(hashes.email_hash_md5, md5('test@example.com'));
    assert.equal(normalizeEmail('  TeSt@Example.COM  '), 'test@example.com');
  });

  it('rejects short emails', () => {
    assert.equal(hashEmail('a@b'), null);
    assert.equal(hashEmail(''), null);
    assert.equal(hashEmail(null), null);
  });

  it('normalizes US phones and hashes the E.164 form', () => {
    const hashes = hashPhone('202-555-0143');
    assert.equal(hashes.phone, '+12025550143');
    assert.equal(hashes.phone_hash_v1, sha256('+12025550143'));
    assert.equal(hashes.phone_hash_md5, md5('+12025550143'));
    assert.equal(normalizePhone('+12025550143'), '+12025550143');
    assert.equal(normalizePhone('12025550143'), '+12025550143');
  });

  it('rejects short phones', () => {
    assert.equal(hashPhone('555-1212'), null);
    assert.equal(normalizePhone('555-1212'), '');
  });

  it('resolves mobile aliases', () => {
    assert.equal(resolvePhoneFromRow({ mobile_phone: '2025550143' }), '2025550143');
    assert.equal(resolvePhoneFromRow({ phone: '1', cell: '2' }), '1');
  });

  it('exposes blank digests', () => {
    assert.equal(BLANK_SHA256_HEX, sha256(''));
    assert.equal(BLANK_MD5_HEX, md5(''));
  });
});

describe('person_hash extract_identifiers', () => {
  it('extracts identifiers from plaintext and does not require person_email', async () => {
    const batch = [{ email: 'Alice@Example.com', phone: '202-555-0143' }];
    await extractIdentifiers.transform({ batch });
    assert.equal(batch[0].email_hash_v1, sha256('alice@example.com'));
    assert.equal(batch[0].email_hash_md5, md5('alice@example.com'));
    assert.equal(batch[0].phone, '+12025550143');
    assert.equal(batch[0].phone_hash_v1, sha256('+12025550143'));
    assert.deepEqual(
      batch[0].identifiers.map((id) => id.type),
      ['email_hash_v1', 'phone_hash_v1']
    );
    assert.equal(batch[0].identifiers[0].path, 'person_hash_email');
    assert.equal(batch[0].identifiers[1].path, 'person_hash_phone');
  });

  it('accepts hash-only inbound without computing md5', async () => {
    const emailHash = sha256('only-hash@example.com');
    const batch = [{ email_hash_v1: emailHash }];
    await extractIdentifiers.transform({ batch });
    assert.equal(batch[0].email_hash_v1, emailHash);
    assert.equal(batch[0].email_hash_md5, undefined);
    assert.equal(batch[0].identifiers[0].value, emailHash);
  });

  it('keeps an existing phone hash when the phone value is too short', async () => {
    const phoneHash = sha256('+12025550143');
    const batch = [{ phone: '123', phone_hash_v1: phoneHash }];
    await extractIdentifiers.transform({ batch });
    assert.equal(batch[0].phone_hash_v1, phoneHash);
    assert.equal(batch[0].identifiers[0].type, 'phone_hash_v1');
  });

  it('does not push blank hashes', async () => {
    const batch = [{ email_hash_v1: BLANK_SHA256_HEX, phone_hash_v1: BLANK_SHA256_HEX }];
    await extractIdentifiers.transform({ batch });
    assert.equal((batch[0].identifiers || []).length, 0);
  });
});

describe('person_hash upsert', () => {
  it('writes hash columns only and preserves source_input_id', async () => {
    const emailHash = sha256('a@example.com');
    const tablesToUpsert = {};
    await upsertHashes.transform({
      batch: [
        {
          person_id: 9,
          input_id: 'new-input',
          email: 'a@example.com',
          email_hash_v1: emailHash,
          email_hash_md5: md5('a@example.com'),
          given_name: 'Ada'
        }
      ],
      databaseEmailHashes: [
        {
          person_id: 9,
          email_hash_v1: emailHash,
          email_hash_md5: '',
          source_input_id: 'original-input'
        }
      ],
      databasePhoneHashes: [],
      tablesToUpsert
    });
    assert.deepEqual(Object.keys(tablesToUpsert), ['person_hash_email']);
    assert.deepEqual(tablesToUpsert.person_hash_email[0], {
      person_id: 9,
      email_hash_v1: emailHash,
      email_hash_md5: md5('a@example.com'),
      source_input_id: 'original-input'
    });
    assert.equal('email' in tablesToUpsert.person_hash_email[0], false);
    assert.equal('given_name' in tablesToUpsert.person_hash_email[0], false);
  });

  it('skips rows without person_id or usable hashes', async () => {
    const tablesToUpsert = {};
    await upsertHashes.transform({
      batch: [{ email_hash_v1: sha256('x@y.com') }, { person_id: 1 }],
      databaseEmailHashes: [],
      databasePhoneHashes: [],
      tablesToUpsert
    });
    assert.deepEqual(tablesToUpsert, {});
  });
});
