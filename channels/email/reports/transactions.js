const o = {
  name: 'Email Fundraising',
  description: 'Revenue performance by message and date, including basic performance stats.',
  tags: ['Email', 'Fundraising'],
  data_sources: {
    default: {
      table: 'global_message_summary',
      date_column: 'publish_date',
      conditions: [{ eql: "channel='email'" }]
    }
  },
  filters: {
    title: 'Filters',
    type: 'object',
    properties: {}
  },
  sections: [
    {
      title: 'Top Line',
      components: [
        {
          id: 'messages',
          component: 'StatCard',
          name: 'Messages',
          metric: { eql: 'count(distinct message_id)' }
        },
        {
          id: 'sent',
          component: 'StatCard',
          name: 'Sent',
          metric: { eql: 'sum(sent)' }
        },
        {
          id: 'open_rate',
          component: 'StatCard',
          name: 'Open Rate',
          metric: { eql: 'sum(impressions)/sum(sent)', format: 'percent' }
        },
        {
          id: 'click_rate',
          component: 'StatCard',
          name: 'Click Rate',
          metric: { eql: 'sum(clicks)/sum(sent)', format: 'percent' }
        },
        {
          id: 'transactions',
          component: 'StatCard',
          name: 'Transactions',
          metrics: [
            { name: 'Revenue', eql: 'sum(attributed_revenue)', format: 'currency' },
            { name: 'Transactions', eql: 'sum(attributed_transactions)' }
          ]
        },
        {
          id: 'average_gift',
          component: 'StatCard',
          name: 'Average Gift',
          metric: { eql: 'sum(attributed_revenue)/sum(attributed_transactions)', format: 'currency' }
        }
      ]
    },
    {
      title: 'Amount over time',
      components: [
        {
          id: 'amount_over_time',
          component: 'ComposedChart',
          dimension: { name: 'Week', eql: 'week(publish_date)' },
          metrics: [
            {
              name: 'Total Amount',
              eql: 'sum(attributed_revenue)',
              yaxis: 'right',
              type: 'bar',
              format: 'currency'
            },
            { name: 'Emails Sent', eql: 'sum(sent)' }
          ],
          sort: { eql: 'week(publish_date)' }
        }
      ]
    },
    {
      title: 'Email Rates',
      components: [
        {
          id: 'email_rates',
          component: 'ComposedChart',
          isDate: true,
          dimension: { eql: 'publish_date' },
          metrics: [
            { name: 'Open Rate', eql: 'sum(impressions)/sum(sent)', format: 'percent' },
            { name: 'Click Rate', eql: 'sum(clicks)/sum(sent)', format: 'percent', yaxis: 'right' }
          ],
          sort: { eql: 'publish_date' }
        }
      ]
    },
    {
      title: 'Revenue Performance Over Time',
      components: [
        {
          id: 'revenue_per_click',
          component: 'ComposedChart',
          isDate: true,
          dimension: { eql: 'publish_date' },
          metrics: [{ name: '$ Revenue/Click', eql: 'sum(attributed_revenue)/sum(clicks)', format: 'currency' }],
          sort: { eql: 'publish_date' }
        }
      ]
    },
    {
      title: 'Performance Metrics',
      components: [
        {
          id: 'performance',
          component: 'Table',
          dimensions: [
            { name: 'Send Date', eql: 'publish_date' },
            { name: 'Subject', eql: 'subject', col: 2 },
            { name: 'Source Code', eql: 'final_primary_source_code', col: 2 }
          ],
          metrics: [
            { name: 'Sent', eql: 'sent', format: 'number' },
            { name: 'Open Rate', eql: 'impressions/sent', format: 'percent' },
            { name: 'Click Rate', eql: 'clicks/sent', format: 'percent' },
            { name: 'Transactions', eql: 'sum(attributed_transactions)' },
            { name: 'Transactions/Opens', eql: 'sum(attributed_transactions)/sum(impressions)', format: 'percent' },
            { name: 'Revenue', eql: 'sum(attributed_revenue)', format: 'currency' },
            { name: 'Average', eql: 'sum(attributed_revenue)/sum(attributed_transactions)', format: 'currency' },
            { name: 'Revenue/Click', eql: 'sum(attributed_revenue)/sum(clicks)', format: 'currency' }
          ],
          orderBy: { eql: 'publish_date', order_by_direction: 'DESC' }
        }
      ]
    }
  ]
};

export default o;
