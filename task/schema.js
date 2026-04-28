export const tables = [
  {
    name: 'task_run',
    columns: {
      id: 'id_uuid',
      account_id: 'string',
      originator: { type: 'string', nullable: false, default_value: 'sql' },
      flow_run_id: 'id_uuid',
      task_key: 'string',
      dynamic_key: { type: 'string', nullable: false, default_value: '0' },
      name: 'string',
      cache_key: 'string',
      cache_expiration: 'datetime',
      task_version: 'string',
      empirical_policy: 'json',
      tags: 'json',
      labels: 'json',
      state_id: 'id_uuid',
      state_type: {
        type: 'enum',
        nullable: false,
        default_value: 'PENDING',
        values: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'CRASHED']
      },
      state_name: 'string',
      state: 'json',
      task_inputs: 'json',
      run_count: 'int',
      flow_run_run_count: 'int',
      expected_start_time: 'datetime',
      next_scheduled_start_time: 'datetime',
      start_time: 'datetime',
      end_time: 'datetime',
      total_run_time: 'double',
      estimated_run_time: 'double',
      estimated_start_time_delta: 'double',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: ['account_id'] },
      { columns: ['originator'] },
      { columns: ['flow_run_id'] },
      { columns: ['state_type'] },
      { columns: ['task_key'] },
      { columns: ['created_at'] }
    ]
  }
];

export default {
  tables
};
