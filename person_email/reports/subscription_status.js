const o = {
  name: 'Email Subscription Status',
  description: 'Subscription status counts by source plugin.',
  tags: ['Email'],
  data_sources: {
    default: {
      table: 'person_email'
    }
  },
  filters: {
    title: 'Filters',
    type: 'object',
    properties: {
      plugin_name: {
        type: 'string',
        title: 'Plugin name',
        description: 'Match plugin.name (contains).',
        filter: { column: 'plugin.name', operator: 'LIKE' }
      }
    }
  },
  sections: [
    {
      title: 'Breakdown by source plugin',
      components: [
        {
          id: 'by_plugin',
          component: 'Table',
          query: {
            table: 'person_email',
            joins: [
              { table: 'input', join_eql: 'person_email.source_input_id=input.id' },
              { table: 'plugin', join_eql: 'input.plugin_id=plugin.id' }
            ],
            columns: [
              'plugin.name as Plugin',
              'count(*) as emails',
              { eql: `sum(case when subscription_status='Subscribed' then 1 else 0 end)`, name: 'Subscribed' },
              `sum(case when subscription_status='Unsubscribed' then 1 else 0 end) as Unsubscribed`,
              `sum(case when subscription_status='Bouncing' then 1 else 0 end) as Bouncing`,
              `sum(case when subscription_status='Spam' then 1 else 0 end) as Spam`,
              {
                eql: `sum(case when subscription_status='Not Subscribed' then 1 else 0 end)`,
                name: 'Unknown Subscription'
              }
            ],
            groupBy: ['plugin.id'],
            orderBy: { eql: 'count(*)', order_by_direction: 'DESC' }
          }
        }
      ]
    }
  ]
};

export default o;
