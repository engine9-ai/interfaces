export const tables = [
  {
    name: 'person',
    columns: {
      id: 'id',
      given_name: 'string',
      family_name: 'string',
      created_at: 'created_at',
      modified_at: 'modified_at'
    }
  },
  {
    name: 'person_identifier',
    columns: {
      id: 'id',
      person_id: 'person_id',
      source_input_id: 'uuid',
      id_type: {
        type: 'enum',
        nullable: false,
        default_value: '',
        values: ['', 'remote_person_id', 'email_hash_v1', 'phone_hash_v1', 'delegate']
      },
      id_value: 'id_string'
    },
    indexes: [
      { columns: ['person_id'] },
      { columns: ['id_value'] },
      // useful for finding anyone related to an input
      // same input can't have the same id value twice
      { columns: ['source_input_id', 'id_value', 'person_id'], unique: true }
    ]
  }
  /*
    //sometimes useful, debating whether useful enough to be global
    create view person_identifier_summary
as select p.*,
input.remote_input_id,
input.remote_input_name,input_type,
plugin_id,plugin.path,plugin.name,plugin.remote_plugin_id
from person_identifier p
join input on (p.source_input_id=input.id)
join plugin on (input.plugin_id=plugin.id); */
];
export default {
  tables
};
