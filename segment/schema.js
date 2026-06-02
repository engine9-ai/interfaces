export const tables = [
  {
    name: 'segment_folder',
    columns: {
      id: 'id_uuid',
      name: 'string',
      description: 'text',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }]
  },
  {
    name: 'segment',
    columns: {
      id: 'id_uuid',
      plugin_id: 'id_uuid', // can't be null, must have a value
      submodule: 'string',
      segment_folder_id: 'foreign_uuid',
      remote_segment_id: 'string',
      legacy_id: 'int',
      name: 'string',
      category: 'string', // A arbitrary type, user facing, not to be used for logic
      definition_path: 'string', // a definition file path, will be used for configuring
      stars: 'int', //number of stars, good for UI organizing
      search: 'json',
      build_type: {
        type: 'enum',
        nullable: false,
        default_value: 'list',
        values: [
          'list', //static list of people
          'search', // built by the defined search
          'scheduled_search', // built on a schedule by the search
          'remote_count', // no person records, just counts, pulled from remote site
          'remote', // pulled from remote plugin site
          'manual' // created outside normal processing
        ]
      },
      build_schedule: 'string',
      build_status: 'string',
      build_status_modified_at: 'modified_at',
      build_table: 'string',
      last_built: 'datetime',
      people: 'int', // engine9 count
      reported_people: 'int', // reported by outside parties
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      // if there is a remote_segment_id, it should be unique for the plugin
      { columns: ['plugin_id', 'remote_segment_id'], unique: true }
    ]
  },
  // Used for some smaller segments, and a cache of segments
  {
    name: 'person_segment',
    columns: {
      id: 'id',
      person_id: 'person_id',
      segment_id: 'foreign_uuid'
    },
    indexes: [{ columns: 'segment_id,person_id', unique: true }, { columns: 'person_id' }]
  }
];
export default {
  tables
};
