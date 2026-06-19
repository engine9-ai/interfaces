export const customers = {
  name: 'Customers',
  search: {
    and: [
      {
        table: 'transaction',
        columns: ['person_id']
      }
    ]
  }
};
export default {
  customers
};
