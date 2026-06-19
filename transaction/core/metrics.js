export const summaryByDate = ({ plugin: { tablePrefix } }) => {
  return {
    label: 'Transactions',
    description: '',
    eql: {
      table: tablePrefix + 'transaction',
      columns: [
        { eql: 'month(ts)', name: 'date' },
        { eql: 'count(*)', name: 'records' },
        { eql: 'sum(amount)', name: 'revenue' }
      ],
      conditions: [],
      groupBy: [{ eql: 'month(ts)' }],
      orderBy: [{ eql: 'month(ts)' }]
    }
  };
};
export default {
  summaryByDate
};
