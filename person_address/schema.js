export const tables = [
  {
    name: 'person_address',
    columns: {
      id: 'id',
      person_id: 'person_id',
      name: 'string',
      type: {
        type: 'string',
        values: ['', 'Home', 'School', 'Office']
      },
      status: 'string',
      street_1: 'string',
      street_2: 'string',
      street_3: 'string',
      city: 'string',
      region: 'string',
      postal_code: 'string',
      country: 'string',
      subscription_status: {
        type: 'string',
        nullable: false,
        default_value: 'Not Subscribed',
        values: ['Blocked', 'Bounced', 'Not Subscribed', 'Subscribed', 'Unsubscribed']
      },
      deliverability_score: {
        type: 'int',
        description:
          'Score representating deliverability status of address, e.g. undeliverable(0), deliverable(1), higher values mean different things',
        nullable: false,
        default_value: 1
      },
      preference_order: {
        type: 'int',
        description: 'Order in the preference stack, lower is better, -1 means set by user',
        nullable: false,
        default_value: 0
      },
      is_best_address: 'boolean',
      created_at: 'created_at',
      modified_at: 'modified_at',
      source_input_id: 'foreign_uuid'
    },
    indexes: [{ columns: 'person_id' }]
  }
];
export default {
  tables
};
