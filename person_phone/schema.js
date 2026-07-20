export const tables = [
  {
    name: 'person_phone',
    columns: {
      id: 'id',
      person_id: 'person_id',
      phone_type: {
        type: 'string',
        nullable: false,
        default_value: 'Personal',
        values: ['Personal', 'Cell', 'Home', 'Work', 'Fax', 'Other']
      },
      phone: 'string',
      preference_order: {
        type: 'int',
        nullable: false,
        default_value: 0,
        description: 'Order in the preference stack, 0 is first'
      },
      sms_status: {
        type: 'string',
        nullable: false,
        default_value: 'Not Subscribed',
        values: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing']
      },
      sms_deliverability_score: {
        type: 'int',
        description:
          'SMS deliverability score on a 1–100 scale (100 = most deliverable / verified cell). Use lower values for weaker confidence; 0 may appear from legacy sources meaning undeliverable.',
        nullable: false,
        default_value: 100
      },
      call_status: {
        type: 'string',
        nullable: false,
        default_value: 'Not Subscribed',
        values: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing']
      },
      remote_phone_id: {
        type: 'string',
        nullable: true,
        description: 'Remote system phone record id when available'
      },
      phone_hash_v1: 'hash',
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'person_id' },
      { columns: ['phone', 'person_id'], unique: true },
      { columns: 'remote_phone_id' }
    ]
  }
];
export default {
  tables
};
