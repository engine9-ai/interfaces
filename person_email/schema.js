export const tables = [
  {
    name: 'person_email',
    columns: {
      id: 'id',
      person_id: 'person_id',
      email_type: {
        type: 'string',
        nullable: false,
        default_value: 'Personal',
        values: ['Personal', 'Work', 'Other']
      },
      email: 'string',
      subscription_status: {
        type: 'string',
        nullable: false,
        default_value: 'Not Subscribed',
        values: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing', 'Spam']
      },
      confirmation_status: {
        type: 'string',
        nullable: true,
        default_value: 'Not Confirmed',
        values: ['Not Confirmed', 'Confirmation Sent', 'Confirmed']
      },
      deliverability_score: {
        type: 'int',
        description:
          'Score representating deliverability status of email, e.g. undeliverable(0), deliverable(1), higher values mean different things',
        nullable: false,
        default_value: 1
      },
      preference_order: {
        type: 'int',
        description: 'Order in the preference stack, 0 is first',
        nullable: false,
        default_value: 0
      },
      email_hash_v1: 'hash',
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'person_id' }, { columns: ['email', 'person_id'], unique: true }]
  }
];
export default {
  tables
};
