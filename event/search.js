const RESPONSE_VALUES = ['Invited', 'Accepted', 'Declined', 'Tentative', 'Attended'];

export const responses = {
  title: 'Event responses',
  description: 'People linked to events by RSVP / attendance response',
  form: {
    title: 'Event responses',
    type: 'object',
    properties: {
      response: {
        type: 'string',
        enum: RESPONSE_VALUES
      },
      eventId: {
        type: 'string',
        description: 'Limit to one event UUID'
      }
    },
    required: []
  },
  optionsToEQL(options) {
    const { response, eventId } = options;
    let text = 'Has an event response';
    const conditions = [];
    if (response) {
      text = `Event response is ${response}`;
      conditions.push({
        type: 'EQUALS',
        values: [{ ref: { column: 'response' } }, { value: { value: response } }]
      });
    }
    if (eventId) {
      text += ` for event ${eventId}`;
      conditions.push({
        type: 'EQUALS',
        values: [{ ref: { column: 'event_id' } }, { value: { value: eventId } }]
      });
    }
    return {
      text,
      eql: {
        table: 'person_event',
        conditions
      }
    };
  }
};

export default {
  responses
};
