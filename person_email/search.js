export const emails = {
  form: {
    emails: {
      title: 'Emails',
      type: 'object',
      properties: {
        emailMatch: {
          type: 'string'
        },
        subscriptionStatus: {
          type: 'string',
          enum: ['Not Subscribed', 'Subscribed', 'Unsubscribed', 'Bouncing', 'Spam']
        }
      },
      required: []
    }
  },
  /* map from provided user data into an EQL structure */
  optionsToEQL(options) {
    const { emailMatch, subscriptionStatus } = options;
    let text = 'Has an email';
    const conditions = [];
    if (subscriptionStatus) {
      text = `Has a ${subscriptionStatus.toLowerCase()} email`;
      conditions.push({
        type: 'EQUALS',
        values: [
          {
            ref: { column: 'subscription_status' }
          },
          {
            value: { value: subscriptionStatus }
          }
        ]
      });
    }
    if (emailMatch) {
      text += ` that matches ${emailMatch}`;
      conditions.push({
        type: 'LIKE',
        values: [
          {
            ref: { column: 'email' }
          },
          {
            value: { value: emailMatch }
          }
        ]
      });
    }
    return {
      text,
      eql: {
        table: 'person_email',
        conditions
      }
    };
  }
};
export default {
  emails
};
