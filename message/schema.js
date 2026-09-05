export const tables = [
  {
    name: 'message',
    columns: {
      id: 'id_uuid',
      message_set_id: 'foreign_uuid',
      channel: 'string',
      name: 'string',
      status: 'string',
      publish_date: 'datetime',
      primary_source_code: { type: 'string', length: 180 },
      primary_source_code_override: { type: 'string', length: 180 },
      final_primary_source_code: { type: 'string', length: 180 },
      source_remote_id: 'string',
      source_submodule: 'string',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }, { columns: ['publish_date'] }, { columns: ['message_set_id'] }]
  },
  {
    name: 'message_set',
    columns: {
      id: 'id_uuid',
      campaign_id: 'foreign_uuid',
      name: 'string',
      remote_message_set_id: 'string',
      remote_message_set_name: 'string',
      message_template_id: 'foreign_uuid',
      type: 'string',
      status: 'string',
      schedule: 'string',
      source_code_format: 'string',
      // default_content: 'json', //unused?
      default_variables: 'json',
      required_targeting: 'json', // This is set initially, and can't be changed by users, for things such as Emailable people, etc
      targeting: 'json',
      sequencing: 'json', // sequence of messages
      send_strategy: 'string', // Sending strategy, such as Best open rate, best giving rate, etc
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: ['campaign_id', 'remote_message_set_id'], unique: true }
    ]
  },
  {
    name: 'campaign',
    columns: {
      id: 'id_uuid',
      name: 'string',
      channel: 'string',
      plugin_id: 'id_uuid', // can't be null, must have a value
      remote_campaign_id: 'string',
      remote_campaign_name: 'string',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: ['plugin_id', 'remote_campaign_id'], unique: true }
    ]
  },
  {
    name: 'message_content',
    columns: {
      id: 'id_uuid',
      message_id: 'foreign_uuid',
      content: 'json',
      remote_data: 'json',
      variables: 'json',
      targeting: 'json',
      estimated_targets: 'int',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }, { columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_override',
    columns: {
      id: 'id_uuid',
      message_id: 'foreign_uuid',
      overrides: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }, { columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_statistics',
    columns: {
      id: 'id_uuid',
      message_id: 'foreign_uuid',
      statistics: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }, { columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_queue',
    columns: {
      id: 'id_uuid',
      message_id: 'foreign_uuid',
      publish_metadata: 'json',
      error: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }, { columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_template',
    columns: {
      id: 'id_uuid',
      name: 'string',
      content: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: 'id', primary: true }]
  }
  // message_summary / global_message*_summary stay out of core until messaging is
  // finalized; Frakture deployments may still ship those views separately.
];
export default {
  tables
};
