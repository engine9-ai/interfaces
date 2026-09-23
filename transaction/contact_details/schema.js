// OpenID Connect profile scope fields (address, phone) plus domain-specific employer/occupation.
export const tables = [
  {
    name: 'transaction',
    prefix: false,
    columns: {
      street_1: 'string',
      street_2: 'string',
      city: 'string',
      region: 'string',
      postal_code: { type: 'string', length: 16 },
      country: 'string',
      email: 'string',
      phone: { type: 'string', length: 24 },
      employer: 'string',
      occupation: 'string'
    },
    indexes: []
  }
];

export default { tables };
