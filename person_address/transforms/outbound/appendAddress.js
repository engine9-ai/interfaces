export const description = 'Append a postal address';
export const bindings = {
  addresses: {
    path: 'sql.query',
    options: {
      table: 'person_address',
      columns: [
        'person_id',
        'name',
        'type',
        'status',
        'street_1',
        'street_2',
        'street_3',
        'city',
        'region',
        'postal_code',
        'country',
        'subscription_status'
      ],
      lookup: ['person_id'],
      conditions: []
    }
  }
};
export const transform = ({ batch, addresses, options = {} }) => {
  const { subscriptionStatus } = options;
  let filter = () => true;
  if (subscriptionStatus) filter = (d) => d.subscription_status === subscriptionStatus;
  const addressMap = addresses.filter(filter).reduce((a, b) => {
    if (!a[b.person_id]) a[b.person_id] = b;
    return a;
  }, {});
  batch.forEach((data) => {
    const row = addressMap[data.person_id];
    if (!row) return;
    data.name = data.name || row.name || null;
    data.type = data.type || row.type || null;
    data.status = data.status || row.status || null;
    data.street_1 = data.street_1 || row.street_1 || null;
    data.street_2 = data.street_2 || row.street_2 || null;
    data.street_3 = data.street_3 || row.street_3 || null;
    data.city = data.city || row.city || null;
    data.region = data.region || row.region || null;
    data.postal_code = data.postal_code || row.postal_code || null;
    data.country = data.country || row.country || null;
  });
};
export default {
  description,
  bindings,
  transform
};
