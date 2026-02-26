export const type = 'upsert';
export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' },
  databasePhones: { path: 'sql.query', options: { table: 'person_phone', lookup: ['phone'] } }
};
export async function transform({ batch, tablesToUpsert, databasePhones }) {
  batch.forEach((o) => {
    if (!o.phone) return;
    tablesToUpsert.person_phone = tablesToUpsert.person_phone || [];
    // phone should be already cleaned in extract ids
    const matchingPhones = databasePhones.filter((d) => d.phone === o.phone);
    const personPhones = matchingPhones.filter((em) => o.person_id && em.person_id === o.person_id);
    if (personPhones.length > 1) {
      throw new Error(
        `Cannot update phone, there are 2 database entries for person_id ${o.person_id} with phone ${o.phone}`
      );
    }
    if (
      o.entry_type === 'SMS_UNSUBSCRIBE' ||
      o.entry_type === 'SMS_SPAM' ||
      o.entry_type_id === 34 ||
      o.entry_type_id === 38
    ) {
      if (!o.sms_status) o.sms_status = 'Unsubscribed';
    }
    const sms_status = o.sms_status || personPhones[0]?.sms_status || 'Subscribed';
    const phone_type = o.phone_type || personPhones[0]?.phone_type || 'Personal';

    if (o.call_status !== undefined && !o.call_status) o.call_status = 'Not Subscribed';

    const { id, ...rest } = o;
    if (id) {
      //this is undoubtedly NOT the ID of the record
    }
    if (personPhones[0]) {
      tablesToUpsert.person_phone.push({
        ...personPhones[0],
        ...rest,
        sms_status,
        phone_type
      });
    } else {
      tablesToUpsert.person_phone.push({
        id: null,
        person_id: o.person_id,
        phone: o.phone,
        ...rest,
        source_input_id: o.input_id,
        sms_status,
        phone_type
      });
    }
  });
  return batch;
}
export default {
  type,
  bindings,
  transform
};
