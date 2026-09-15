export const description = 'Append the best postal address (all person_address columns)';

export const bindings = {
  addresses: {
    path: 'sql.query',
    options: {
      table: 'person_address',
      columns: [
        'id',
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
        'subscription_status',
        'deliverability_score',
        'preference_order',
        'is_best_address',
        'created_at',
        'modified_at',
        'source_input_id'
      ],
      lookup: ['person_id'],
      conditions: []
    }
  }
};

function truthyBest(v) {
  return v === true || v === 1 || v === '1' || v === 't';
}

function pickAddressRow(rows) {
  if (!rows?.length) return null;
  const best = rows.find((r) => truthyBest(r.is_best_address));
  if (best) return best;
  return rows.slice().sort((a, b) => (Number(a.preference_order) || 0) - (Number(b.preference_order) || 0))[0];
}

export const transform = ({ batch, addresses, options = {} }) => {
  const { subscriptionStatus } = options;
  let filter = () => true;
  if (subscriptionStatus) filter = (d) => d.subscription_status === subscriptionStatus;

  const filtered = addresses.filter(filter);
  const byPerson = {};
  for (const a of filtered) {
    if (!byPerson[a.person_id]) byPerson[a.person_id] = [];
    byPerson[a.person_id].push(a);
  }

  batch.forEach((data) => {
    const row = pickAddressRow(byPerson[data.person_id]);
    if (!row) return;

    data.person_address_id = data.person_address_id ?? row.id ?? null;
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
    data.subscription_status = data.subscription_status || row.subscription_status || null;
    data.deliverability_score = data.deliverability_score ?? row.deliverability_score ?? null;
    data.preference_order = data.preference_order ?? row.preference_order ?? null;
    data.is_best_address = data.is_best_address ?? row.is_best_address ?? null;
    data.created_at = data.created_at ?? row.created_at ?? null;
    data.modified_at = data.modified_at ?? row.modified_at ?? null;
    data.source_input_id = data.source_input_id ?? row.source_input_id ?? null;
  });
};

export default {
  description,
  bindings,
  transform
};
