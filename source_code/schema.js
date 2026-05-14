export const tables = [
  {
    name: 'source_code_dictionary',
    columns: {
      source_code_id: 'id',
      source_code: {
        type: 'string',
        length: 180,
        nullable: false,
        default_value: ''
      },
      format: 'string',
      format_regex: 'string',
      source_code_channel: 'string',
      source_code_last_used: 'created_at', //by default, when this record is created it needs a last used.
      parsing: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'source_code_id', primary: true },
      { columns: 'source_code', unique: true },
      { columns: 'source_code_last_used' }
    ]
  }
];
export default {
  tables
};
