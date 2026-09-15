import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hashAddress,
  normalizeAddressFields,
  normalizeCountry,
  normalizePostalCode,
  normalizeRegion,
  normalizeStreetLine
} from './normalize.js';

describe('person_address normalize', () => {
  it('normalizes street abbreviations without validating deliverability', () => {
    assert.equal(normalizeStreetLine('1234 Main Street south-west, apt 14-a'), '1234 MAIN ST SW APT 14-A');
    assert.equal(normalizeStreetLine('p.o.b 1234'), 'PO BOX 1234');
  });

  it('normalizes country names and codes to ISO alpha-2', () => {
    assert.equal(normalizeCountry('USA'), 'US');
    assert.equal(normalizeCountry('United States'), 'US');
    assert.equal(normalizeCountry('840'), 'US');
    assert.equal(normalizeCountry('UK'), 'GB');
    assert.equal(normalizeCountry('Canada'), 'CA');
    assert.equal(normalizeCountry(null), 'US');
  });

  it('normalizes US/CA regions', () => {
    assert.equal(normalizeRegion('California', 'US'), 'CA');
    assert.equal(normalizeRegion('ny', 'US'), 'NY');
    assert.equal(normalizeRegion('Ontario', 'CA'), 'ON');
  });

  it('normalizes postal codes', () => {
    assert.equal(normalizePostalCode('10001-1234', 'US'), '10001');
    assert.equal(normalizePostalCode('m5v0h5', 'CA'), 'M5V 0H5');
  });

  it('hashes equivalent addresses the same after normalize', () => {
    const a = hashAddress({
      street_1: '123 Main Street',
      street_2: 'Apt 2',
      postal_code: '10001-9999',
      country: 'USA'
    });
    const b = hashAddress({
      street_1: '123 MAIN ST',
      street_2: 'APT 2',
      postal_code: '10001',
      country: 'US'
    });
    assert.equal(a, b);
    assert.ok(a.length > 0);
  });

  it('returns normalized field set', () => {
    const n = normalizeAddressFields({
      street_1: '1005 N Gravenstein Highway',
      city: 'Sebastopol',
      region: 'California',
      postal_code: '95472-1234',
      country: 'United States of America'
    });
    assert.equal(n.country, 'US');
    assert.equal(n.region, 'CA');
    assert.equal(n.postal_code, '95472');
    assert.equal(n.city, 'SEBASTOPOL');
    assert.match(n.street_1, /GRAVENSTEIN/);
  });
});
