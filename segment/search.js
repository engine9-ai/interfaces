export const segment = {
  title: 'Segment',
  form: {
    title: 'Segment',
    type: 'object',
    properties: {
      segmentId: {
        title: 'Segment',
        description: '',
        type: 'string'
      }
    },
    required: []
  },
  optionsToEQLContext: function ({ segmentId }) {
    return {
      segments: {
        table: 'segment',
        columns: ['id', 'name'],
        conditions: [
          {
            type: 'EQUALS',
            values: [
              {
                ref: { column: 'id' }
              },
              {
                value: { value: segmentId }
              }
            ]
          }
        ]
      }
    };
  },
  /* map from provided user data into an EQL structure */
  optionsToEQL(options, { segments } = {}) {
    const { segmentId } = options;
    const segment = segments.find(({ id }) => id == segmentId);
    if (!segment) throw new Error('Could not find segment ' + segmentId + ' in ' + segments.length + ' segments');
    let text = 'In ' + segment.name || segmentId;
    const conditions = [
      {
        type: 'EQUALS',
        values: [
          {
            ref: { column: 'segment_id' }
          },
          {
            value: { value: segmentId }
          }
        ]
      }
    ];
    const eql = {
      table: 'person_segment',
      conditions
    };
    return { text, eql };
  }
};
export default {
  segment
};
