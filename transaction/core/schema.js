export const tables = [
  {
    name: 'transaction',
    columns: {
      id: 'id_uuid',
      ts: 'datetime',
      input_id: 'uuid', // keep as uuid because it's required
      entry_type_id: 'int',
      person_id: 'person_id',
      amount: 'currency',
      remote_entry_id: 'string',
      remote_page_name: 'string',
      remote_recurring_id: 'string',
      recurs_id: {
        type: 'int',
        nullable: false,
        default_value: 0
      },
      recurring_number: 'int',
      refund_amount: 'currency',
      given_name: 'string',
      family_name: 'string',
      email: 'string',
      source_code_id: 'source_code_id',
      override_source_code_id: 'source_code_id',
      final_source_code_id: 'source_code_id',
      recommended_message_id: 'uuid',
      override_message_id: 'uuid',
      final_message_id: 'uuid',
      extra: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: 'ts' },
      { columns: 'person_id' },
      { columns: 'remote_entry_id' },
      { columns: 'modified_at' }
    ]
  }
];
export default {
  tables
};
