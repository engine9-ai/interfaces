const o = {
  name: 'Person Count By Month',
  description: 'Count of people by month created.',
  tags: ['People'],
  data_sources: {
    default: {
      table: 'person',
      date_column: 'created_at'
    }
  },
  filters: {
    title: 'Filters',
    type: 'object',
    properties: {}
  },
  sections: [
    {
      title: 'Count of People by Month Created',
      components: [
        {
          id: 'by_month',
          component: 'ComposedChart',
          isDate: true,
          dimension: { name: 'Month', eql: 'created_at' },
          metrics: [{ name: 'People', eql: 'count(*)' }]
        }
      ]
    }
  ]
};

export default o;
