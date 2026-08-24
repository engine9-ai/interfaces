import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metadata as standard } from './standard/index.js';
import { metadata as limitedPii } from './limited-pii/index.js';

test('standard stack includes plaintext contact plugins and does not exclude them', () => {
  assert.equal(standard.name, '@engine9/interfaces/stacks/standard');
  assert.ok(standard.include.includes('@engine9/interfaces/person_email'));
  assert.ok(standard.include.includes('@engine9/interfaces/person_phone'));
  assert.ok(standard.include.includes('@engine9/interfaces/person_address'));
  assert.deepEqual(standard.exclude, []);
});

test('limited-pii stack includes person_hash and excludes plaintext contact plugins', () => {
  assert.equal(limitedPii.name, '@engine9/interfaces/stacks/limited-pii');
  assert.ok(limitedPii.include.includes('@engine9/interfaces/person_hash'));
  assert.ok(!limitedPii.include.includes('@engine9/interfaces/person_email'));
  assert.ok(!limitedPii.include.includes('@engine9/interfaces/person_phone'));
  assert.ok(!limitedPii.include.includes('@engine9/interfaces/person_address'));
  assert.ok(limitedPii.exclude.includes('@engine9/interfaces/person_email'));
  assert.ok(limitedPii.exclude.includes('@engine9/interfaces/person_phone'));
  assert.ok(limitedPii.exclude.includes('@engine9/interfaces/person_address'));
});
