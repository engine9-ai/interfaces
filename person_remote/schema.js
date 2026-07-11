export const tables = [
  {
    name: 'person_remote',
    columns: {
      id: 'id',
      person_id: 'person_id',
      remote_person_id: 'string',
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'person_id' },
      { columns: ['source_input_id', 'remote_person_id', 'person_id'], unique: true }
    ]
  }
];
export default {
  tables
};
