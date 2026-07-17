export const phones = {
  form: {
    phones: {
      title: 'Phones',
      type: 'object',
      properties: {
        phoneMatch: {
          type: 'string'
        },
        smsStatus: {
          type: 'string',
          enum: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing']
        },
        callStatus: {
          type: 'string',
          enum: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing']
        }
      },
      required: []
    }
  },
  /* map from provided user data into an EQL structure */
  optionsToEQL(options) {
    const { phoneMatch, smsStatus, callStatus } = options;
    const conditions = [];
    let text = [];
    if (smsStatus) {
      text.push(`A SMS ${smsStatus.toLowerCase()} phone`);
      conditions.push({
        type: 'EQUALS',
        values: [
          {
            ref: { column: 'sms_status' }
          },
          {
            value: { value: smsStatus }
          }
        ]
      });
    }
    if (callStatus) {
      text.push(`A voice ${callStatus.toLowerCase()} phone`);
      conditions.push({
        type: 'EQUALS',
        values: [
          {
            ref: { column: 'call_status' }
          },
          {
            value: { value: callStatus }
          }
        ]
      });
    }
    if (phoneMatch) {
      text.push(`A phone that matches ${phoneMatch}`);
      conditions.push({
        type: 'LIKE',
        values: [
          {
            ref: { column: 'phone' }
          },
          {
            value: { value: phoneMatch }
          }
        ]
      });
    }
    return {
      text,
      eql: {
        table: 'person_phone',
        conditions
      }
    };
  }
};
export default {
  phones
};
