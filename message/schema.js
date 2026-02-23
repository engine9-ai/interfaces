export const tables = [
  {
    name: 'message',
    columns: {
      id: 'id_uuid',
      message_set_id: 'foreign_id',
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
      id: 'id',
      campaign_id: 'foreign_id',
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
    indexes: [{ columns: ['campaign_id', 'remote_message_set_id'], unique: true }]
  },
  {
    name: 'campaign',
    columns: {
      id: 'id',
      name: 'string',
      channel: 'string',
      plugin_id: 'id_uuid', // can't be null, must have a value
      remote_campaign_id: 'string',
      remote_campaign_name: 'string',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: ['plugin_id', 'remote_campaign_id'], unique: true }]
  },
  {
    name: 'message_content',
    columns: {
      id: 'id',
      message_id: 'foreign_uuid',
      content: 'json',
      remote_data: 'json',
      variables: 'json',
      targeting: 'json',
      estimated_targets: 'int',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_override',
    columns: {
      id: 'id',
      message_id: 'foreign_uuid',
      overrides: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_statistics',
    columns: {
      id: 'id',
      message_id: 'foreign_uuid',
      statistics: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: ['message_id'], unique: true }]
  },
  {
    name: 'message_queue',
    columns: {
      id: 'id',
      message_id: 'foreign_uuid',
      publish_metadata: 'json',
      error: 'json',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [{ columns: ['message_id'], unique: true }]
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
  },
  {
    name: 'message_summary',
    type: 'view',
    sql: `select m.id as id,
m.label,
m.subject,
m.channel,
m.channel_label,
m.type,
m.status,
m.publish_date,
m.message_set_id,
m.campaign_id,
m.campaign_name,
m.adset_id,
m.adset_name,
m.from_name,
m.preview_url,
m.primary_source_code,
m.primary_source_code_override,
m.final_primary_source_code,
m.submodule,
m.remote_id,
m.do_not_attribute,
m.message_id as message_id_int,
mc.variables,
mc.targeting,
mc.estimated_targets,
msg.created_at,
msg.modified_at,
stats.*,
plugin.id as plugin_id,
plugin.path as plugin_name,
plugin.remote_plugin_id as remote_plugin_id
from 
global_message m
left join message msg on (m.id=msg.id)
left join plugin on (m.bot_id=plugin.remote_plugin_id)
left join message_content mc on (m.id=mc.message_id)
left join global_message_stats stats on (m.message_id=stats.message_id)`
  }
];
export default {
  tables
};
