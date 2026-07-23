import { hashAddress, normalizeAddressFields } from '../../normalize.js';

export const bindings = {
  existingAddresses: { path: 'sql.query', options: { table: 'person_address', lookup: ['person_id'] } },
  tablesToUpsert: { path: 'sql.tables.upsert' }
};

export async function transform({ batch, tablesToUpsert, existingAddresses, options = {} }) {
  const defaultCountry = options.defaultCountry || options.default_country || 'US';
  tablesToUpsert.person_address = tablesToUpsert.person_address || [];
  batch.forEach((o) => {
    const normalized = normalizeAddressFields(o, { defaultCountry });
    const hash = hashAddress(normalized, { defaultCountry });
    if (hash.length === 0) return;

    const matchingAddress = existingAddresses.find(
      (a) => a.person_id === o.person_id && hashAddress(a, { defaultCountry }) === hash
    );

    const record = {
      id: null,
      type: o.type || 'Home',
      person_id: o.person_id,
      street_1: normalized.street_1,
      street_2: normalized.street_2,
      street_3: normalized.street_3,
      city: normalized.city,
      region: normalized.region,
      postal_code: normalized.postal_code,
      country: normalized.country,
      subscription_status: 'Not Subscribed',
      source_input_id: o.input_id
    };
    if (matchingAddress) {
      /* Put logic here for dealing with overrides, subscription status, etc */
      if (matchingAddress.subscription_status === 'Unsubscribed') {
        record.subscription_status = 'Unsubscribed';
      }
      record.id = matchingAddress.id;
      record.source_input_id = matchingAddress.source_input_id; // keep this the same
      if (matchingAddress.type) record.type = matchingAddress.type;
    }
    tablesToUpsert.person_address.push(record);
  });
  return batch;
}

export default {
  bindings,
  transform
};
