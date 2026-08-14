export const subscribers = {
  name: 'Email Subscribers',
  search: {
    and: [
      {
        path: '@engine9/interfaces/person_email:search:emails',
        options: {
          subscriptionStatus: 'Subscribed'
        }
      }
    ]
  }
};
export default {
  subscribers
};
