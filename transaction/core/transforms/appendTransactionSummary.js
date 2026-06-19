const placeholder = {
  count: null,
  revenue: null,
  recurring_count: null,
  recurring_revenue: null,
  refund_count: null,
  refund_revenue: null,
  first_id: null,
  first_date: null,
  first_amount: null,
  last_id: null,
  last_date: null,
  last_amount: null,
  smallest_id: null,
  smallest_date: null,
  smallest_amount: null,
  largest_id: null,
  largest_date: null,
  largest_amount: null,
  first_recurring_id: null,
  first_recurring_date: null,
  first_recurring_amount: null,
  last_recurring_id: null,
  last_recurring_date: null,
  last_recurring_amount: null
};
export const bindings = {
  allTransactions: {
    path: 'sql.query',
    options: {
      table: 'transaction',
      columns: 'id,person_id,ts,amount,recurs_id,refund_amount'.split(','),
      lookup: ['person_id']
    }
  }
};
export async function transform({ batch, allTransactions }) {
  function sumAmount(a, b) {
    return (parseFloat(a) + parseFloat(b.amount || 0)).toFixed(2);
  }
  const personIdMap = {};
  allTransactions.sort((a, b) => (a.ts < b.ts ? -1 : 1));
  allTransactions.forEach((d) => {
    d.ts = new Date(d.ts).toISOString();
    personIdMap[d.person_id] = personIdMap[d.person_id] || { person_id: d.person_id, transactions: [] };
    personIdMap[d.person_id].transactions.push(d);
  });
  batch.forEach((person) => {
    Object.entries(placeholder).forEach(([k, v]) => {
      person[`transaction.${k}`] = v;
    });
    const { transactions } = personIdMap[person.person_id] || { transactions: [] };
    if (transactions.length === 0) return;
    const recurring = transactions.filter((d) => d.recurs_id > 0 && d.amount > 0);
    const largest = transactions.reduce((a, b) => (a.amount > b.amount ? a : b), { amount: -1 });
    const smallest = transactions.reduce((a, b) => (a.amount < b.amount ? a : b), {
      amount: 100000000
    });
    let refundCount = 0;
    let refundAmount = 0;
    transactions.forEach((t) => {
      if (t.refund_amount) {
        refundCount += 1;
        refundAmount += parseFloat(t.refund_amount);
      }
    });
    const output = {
      count: transactions.length,
      revenue: transactions.reduce(sumAmount, 0),
      recurring_count: recurring.length,
      recurring_revenue: recurring.reduce(sumAmount, 0),
      refund_count: refundCount,
      refund_revenue: refundAmount,
      first_id: transactions[0].id || null,
      first_date: transactions[0].ts || null,
      first_amount: transactions[0].amount || null,
      last_id: transactions.slice(-1)[0].id || null,
      last_date: transactions.slice(-1)[0].ts || null,
      last_amount: transactions.slice(-1)[0].amount || null,
      largest_id: largest.id || null,
      largest_date: largest.ts || null,
      largest_amount: largest.amount || null,
      smallest_id: smallest.id || null,
      smallest_date: smallest.ts || null,
      smallest_amount: smallest.amount || null,
      first_recurring_id: (recurring[0] || {}).id || null,
      first_recurring_date: (recurring[0] || {}).ts || null,
      first_recurring_amount: (recurring[0] || {}).amount || null,
      last_recurring_id: (recurring.slice(-1)[0] || {}).id || null,
      last_recurring_date: (recurring.slice(-1)[0] || {}).ts || null,
      last_recurring_amount: (recurring.slice(-1)[0] || {}).amount || null
    };
    Object.entries(output).forEach(([k, v]) => {
      person[`transaction.${k}`] = v;
    });
  });
}
export default {
  bindings,
  transform
};
