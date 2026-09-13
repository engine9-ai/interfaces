const o = {
  name: 'Email Engagement',
  description: 'Key performance stats including send count, open and click rates, and unsubscribes.',
  tags: ['Email'],
  data_sources: {
    default: {
      table: 'global_message_summary',
      date_column: 'publish_date',
      conditions: [{ eql: "channel='email' and publish_date is not null" }]
    }
  },
  filters: {
    title: 'Filters',
    type: 'object',
    properties: {}
  },
  sections: [
    {
      title: 'Email Key Metrics',
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
          name: 'Total Sent',
          metric: { eql: 'sum(sent)' }
        },
        {
          id: 'open_rate',
          component: 'StatCard',
          name: 'Open Rate',
          metrics: [
            { name: 'Open Rate', eql: 'sum(impressions)/sum(sent)', format: 'percent' },
            { name: 'Opened', eql: 'sum(impressions)' }
          ]
        },
        {
          id: 'click_rate',
          component: 'StatCard',
          name: 'Click Rate',
          metrics: [
            { name: 'Click Rate', eql: 'sum(clicks)/sum(sent)', format: 'percent' },
            { name: 'Clicked', eql: 'sum(clicks)' }
          ]
        },
        {
          id: 'unsubscribes',
          component: 'StatCard',
          name: 'Unsubscribes',
          metrics: [{ name: 'Unsubscribed', eql: 'sum(unsubscribes)' }]
        },
        {
          id: 'bounces',
          component: 'StatCard',
          name: 'Bounces',
          metrics: [{ name: 'Bounces', eql: 'sum(soft_bounces+hard_bounces)' }]
        }
      ]
    },
    {
      title: 'Opens and Clicks By Date',
      components: [
        {
          id: 'opens_clicks',
          component: 'ComposedChart',
          isDate: true,
          dimension: { eql: 'publish_date' },
          metrics: [
            { name: 'Opened', eql: 'sum(impressions)', yaxis: 'right' },
            { name: 'Clicked', eql: 'sum(clicks)', yaxis: 'left' }
          ],
          sort: { eql: 'publish_date' }
        }
      ]
    },
    {
      title: 'Message Details',
      components: [
        {
          id: 'message_details',
          component: 'Table',
          metrics: [
            { name: 'Subject', eql: 'subject', col: 0 },
            { name: 'Message', eql: 'label', col: 0 },
            { name: 'Source Code', eql: 'final_primary_source_code', col: 0 },
            { name: 'Send Date', eql: 'publish_date', col: 1, format: 'date' },
            { name: 'Total Sent', eql: 'sent', col: 2, format: 'number' },
            { name: 'Open Rate', eql: 'impressions/sent', format: 'percent', col: 3 },
            { name: 'Opened', eql: 'impressions', col: 3 },
            { name: 'Click Rate', eql: 'clicks/sent', format: 'percent', col: 4 },
            { name: 'Clicked', eql: 'clicks', col: 4 },
            { name: 'Unsub Rate', eql: 'unsubscribes/sent', format: 'percent', col: 5 },
            { name: 'Unsubscribed', eql: 'unsubscribes', col: 5 },
            { name: 'Bounce Rate', eql: 'soft_bounces+hard_bounces/sent', format: 'percent', col: 6 },
            { name: 'Bounces', eql: 'soft_bounces+hard_bounces', col: 6 }
          ],
          orderBy: { eql: 'publish_date', order_by_direction: 'DESC' }
        }
      ]
    },
    {
      title: 'Campaign Summary',
      components: [
        {
          id: 'campaign_summary',
          component: 'Table',
          name: 'Campaign Summary',
          dimensions: [{ name: 'Campaign', eql: 'campaign_name' }],
          metrics: [
            { name: 'Total Sent', eql: 'sum(sent)' },
            { name: 'Opened', eql: 'sum(impressions)' },
            { name: 'Open Rate', eql: 'sum(impressions)/sum(sent)', format: 'percent' },
            { name: 'Clicked', eql: 'sum(clicks)' },
            { name: 'Click Rate', eql: 'sum(clicks)/sum(sent)', format: 'percent' },
            { name: 'Unsubscribed', eql: 'sum(unsubscribes)' },
            { name: 'Unsub Rate', eql: 'sum(unsubscribes)/sum(sent)', format: 'percent' },
            { name: 'Bounces', eql: 'sum(soft_bounces+hard_bounces)' },
            { name: 'Bounce Rate', eql: 'sum(soft_bounces+hard_bounces)/sum(sent)', format: 'percent' }
          ]
        }
      ]
    }
  ]
};

export default o;
