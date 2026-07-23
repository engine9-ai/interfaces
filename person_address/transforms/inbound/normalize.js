import { normalizeAddressFields } from '../../normalize.js';

export const description =
  'Normalize postal address fields (street abbreviations, region codes, country ISO alpha-2, postal). Does not validate deliverability.';

/**
 * Mutate batch rows in place with normalized address components.
 */
export async function transform({ batch, options = {} }) {
  const defaultCountry = options.defaultCountry || options.default_country || 'US';
  batch.forEach((row) => {
    const hasAddressHint = row.street_1 || row.street_2 || row.postal_code || row.city || row.region || row.country;
    if (!hasAddressHint) return;
    const normalized = normalizeAddressFields(row, { defaultCountry });
    Object.assign(row, normalized);
  });
  return batch;
}

export default {
  description,
  transform
};
