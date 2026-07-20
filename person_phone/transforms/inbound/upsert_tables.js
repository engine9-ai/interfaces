export const type = 'upsert';
const MIN_PHONE_LENGTH = 8;
function cleanedPhoneLength(phone) {
  return String(phone || '')
    .replace(/[^0-9+]*/g, '')
    .trim().length;
}
export const bindings = {
  tablesToUpsert: { path: 'sql.tables.upsert' },
  databasePhones: { path: 'sql.query', options: { table: 'person_phone', lookup: ['phone'] } }
};
export async function transform({ batch, tablesToUpsert, databasePhones }) {
  batch.forEach((o) => {
    if (!o.phone || cleanedPhoneLength(o.phone) < MIN_PHONE_LENGTH) return;
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
    const sms_status = o.sms_status || personPhones[0]?.sms_status || 'Not Subscribed';
    const phone_type = o.phone_type || personPhones[0]?.phone_type || 'Personal';
    const preference_order =
      o.preference_order !== undefined && o.preference_order !== null
        ? o.preference_order
        : (personPhones[0]?.preference_order ?? 0);

    if (o.call_status !== undefined && !o.call_status) o.call_status = 'Not Subscribed';

    const { id, ...rest } = o;
    if (id) {
      //this is undoubtedly NOT the ID of the record
    }
    if (personPhones[0]) {
      if (!personPhones[0].source_input_id)
        throw new Error('Invalid source_input_id for existing person_phone record:' + JSON.stringify(personPhones[0]));
      tablesToUpsert.person_phone.push({
        ...rest,
        id: personPhones[0].id,
        person_id: personPhones[0].person_id,
        phone: personPhones[0].phone,
        source_input_id: personPhones[0].source_input_id,
        sms_status,
        phone_type,
        preference_order
      });
    } else {
      tablesToUpsert.person_phone.push({
        ...rest,
        id: null,
        person_id: o.person_id,
        phone: o.phone,
        source_input_id: o.input_id,
        sms_status,
        phone_type,
        preference_order
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
