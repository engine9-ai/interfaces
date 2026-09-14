import { addressNormalize } from '@zerodep/address-normalize';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json' with { type: 'json' };

countries.registerLocale(enLocale);

/** US state / DC / territory names and common aliases → ISO-3166-2 region codes */
const US_REGION_ALIASES = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  'district of columbia': 'DC',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'puerto rico': 'PR',
  guam: 'GU',
  'american samoa': 'AS',
  'us virgin islands': 'VI',
  'u.s. virgin islands': 'VI',
  'virgin islands': 'VI',
  'northern mariana islands': 'MP'
};

/** Canadian province / territory names → codes */
const CA_REGION_ALIASES = {
  alberta: 'AB',
  'british columbia': 'BC',
  manitoba: 'MB',
  'new brunswick': 'NB',
  'newfoundland and labrador': 'NL',
  newfoundland: 'NL',
  'northwest territories': 'NT',
  'nova scotia': 'NS',
  nunavut: 'NU',
  ontario: 'ON',
  'prince edward island': 'PE',
  quebec: 'QC',
  québec: 'QC',
  saskatchewan: 'SK',
  yukon: 'YT',
  'yukon territory': 'YT'
};

const VALID_US_REGIONS = new Set(Object.values(US_REGION_ALIASES));
const VALID_CA_REGIONS = new Set(Object.values(CA_REGION_ALIASES));

function emptyToNull(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

/**
 * Normalize a street / city string for storage and dedupe.
 * Does not validate deliverability — only standardizes abbreviations and punctuation.
 */
export function normalizeStreetLine(value) {
  const raw = emptyToNull(value);
  if (!raw) return null;
  try {
    const normalized = addressNormalize(raw);
    return emptyToNull(normalized);
  } catch {
    // e.g. ZeroDep 200-char limit — fall back to a light cleanup
    return emptyToNull(
      raw
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9#/\-.\s]/g, ' ')
        .replace(/\s+/g, ' ')
    );
  }
}

/**
 * Map country names / alpha-3 / numeric codes to ISO 3166-1 alpha-2.
 * Unknown values are uppercased (not rejected) so inbound data is not dropped.
 */
export function normalizeCountry(value, { defaultCountry = 'US' } = {}) {
  const raw = emptyToNull(value);
  if (!raw) return defaultCountry;

  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();

  if (countries.isValid(upper) && upper.length === 2) return upper;

  const fromAlpha3 = countries.alpha3ToAlpha2(upper);
  if (fromAlpha3) return fromAlpha3;

  if (/^\d{1,3}$/.test(upper)) {
    const fromNumeric = countries.numericToAlpha2(upper.padStart(3, '0'));
    if (fromNumeric) return fromNumeric;
  }

  const fromName = countries.getSimpleAlpha2Code(trimmed, 'en') || countries.getAlpha2Code(trimmed, 'en');
  if (fromName) return fromName;

  // Common non-ISO alias
  if (upper === 'UK') return 'GB';

  // Keep short codes; otherwise leave a cleaned uppercase token (do not invent a code)
  if (upper.length <= 3) return upper;
  return upper;
}

export function normalizeRegion(value, country) {
  const raw = emptyToNull(value);
  if (!raw) return null;
  const upper = raw.toUpperCase().replace(/\./g, '').trim();
  const lower = upper.toLowerCase();

  if (country === 'US') {
    if (VALID_US_REGIONS.has(upper)) return upper;
    if (US_REGION_ALIASES[lower]) return US_REGION_ALIASES[lower];
  }
  if (country === 'CA') {
    if (VALID_CA_REGIONS.has(upper)) return upper;
    if (CA_REGION_ALIASES[lower]) return CA_REGION_ALIASES[lower];
  }

  // Already a short code (e.g. NY, ON) or unknown — keep compact uppercase
  if (upper.length <= 3) return upper;
  return upper;
}

/**
 * Light postal cleanup: US ZIP+4 → ZIP5, CA → A1A 1A1, otherwise trim/uppercase.
 */
export function normalizePostalCode(value, country) {
  const raw = emptyToNull(value);
  if (!raw) return null;
  const upper = raw.toUpperCase().trim();

  if (country === 'US') {
    const digits = upper.replace(/\D/g, '');
    if (digits.length >= 5) return digits.slice(0, 5);
    return emptyToNull(upper.replace(/[^A-Z0-9]/g, ''));
  }

  if (country === 'CA') {
    const alnum = upper.replace(/[^A-Z0-9]/g, '');
    if (alnum.length === 6) return `${alnum.slice(0, 3)} ${alnum.slice(3)}`;
    return emptyToNull(alnum);
  }

  return emptyToNull(upper.replace(/\s+/g, ' '));
}

/**
 * Normalize address fields used by person_address upsert / hashing.
 * Mutates and returns a plain object of normalized fields (does not mutate input).
 */
export function normalizeAddressFields(addr = {}, { defaultCountry = 'US' } = {}) {
  const country = normalizeCountry(addr.country, { defaultCountry });
  return {
    street_1: normalizeStreetLine(addr.street_1),
    street_2: normalizeStreetLine(addr.street_2),
    street_3: normalizeStreetLine(addr.street_3),
    city: normalizeStreetLine(addr.city),
    region: normalizeRegion(addr.region, country),
    postal_code: normalizePostalCode(addr.postal_code, country),
    country
  };
}

/**
 * Dedupe hash for addresses: alnum of street_1 + street_2 + postal_code after normalize.
 */
export function hashAddress(addr, { defaultCountry = 'US' } = {}) {
  const n = normalizeAddressFields(addr, { defaultCountry });
  return [n.street_1, n.street_2, n.postal_code]
    .filter(Boolean)
    .join('')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

export default {
  normalizeStreetLine,
  normalizeCountry,
  normalizeRegion,
  normalizePostalCode,
  normalizeAddressFields,
  hashAddress
};
