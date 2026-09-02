import { mergeIntoQueue } from '@engine9/input-tools';

export const bindings = {
  // existingPersonEmails: { path: 'sql.query', table: 'person_email', lookup:['person_id'] },
  databaseEmails: { path: 'sql.query', options: { table: 'person_email', lookup: ['email'] } },
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
export const type = 'upsert';

const emailKeyNormalize = (field, value) =>
  field === 'email' && typeof value === 'string' ? value.trim().toLowerCase() : (value ?? '');

/** Last queued batch row wins on subscription_status (file order). */
function mergePersonEmail(existing, incoming) {
  return {
    ...existing,
    ...incoming,
    id: existing.id ?? incoming.id ?? null,
    email: existing.email || incoming.email,
    person_id: existing.person_id ?? incoming.person_id,
    subscription_status: incoming.subscription_status ?? existing.subscription_status,
    email_hash_v1: incoming.email_hash_v1 || existing.email_hash_v1 || null,
    source_input_id: existing.source_input_id ?? incoming.source_input_id
  };
}

function queuePersonEmail(tablesToUpsert, row, { keyFields = ['email', 'person_id'], key } = {}) {
  tablesToUpsert.person_email = tablesToUpsert.person_email || [];
  mergeIntoQueue(tablesToUpsert.person_email, row, {
    keyFields: key ? undefined : keyFields,
    key,
    normalizeField: key ? undefined : emailKeyNormalize,
    merge: mergePersonEmail,
    label: 'person_email'
  });
}

export async function transform(props) {
  const { batch, databaseEmails, tablesToUpsert } = props;
  if (batch.length === 0) return;
  batch.forEach((o) => {
    if (!o.email) return;
    // People like to believe email is case sensitive
    // emails are always trimmed, but that's it for inbound modifications.
    const email = o.email.trim();
    const lcEmail = email.toLowerCase();
    const matchingEmails = databaseEmails.filter((em) => em?.email?.trim().toLowerCase() === lcEmail);
    const personEmails = matchingEmails.filter((em) => o.person_id && em.person_id === o.person_id);
    if (personEmails.length > 1) {
      throw new Error(
        `Cannot update emails, there are 2 database entries for person_id ${o.person_id} with email ${email}`
      );
    }
    if (
      o.entry_type === 'EMAIL_UNSUBSCRIBE' ||
      o.entry_type === 'EMAIL_SPAM' ||
      o.entry_type_id === 44 ||
      o.entry_type_id === 48
    ) {
      if (!o.subscription_status) o.subscription_status = 'Unsubscribed';
    }
    let status = o.email_subscription_status || o.subscription_status;
    const { id, ...rest } = o;
    if (id) {
      //this is undoubtedly NOT the ID of the person_email record
    }
    if (personEmails[0]) {
      // if it's explicitly specified, then update it, otherwise set it to what it was before
      status = status || personEmails[0].subscription_status;
      queuePersonEmail(tablesToUpsert, {
        ...rest,
        id: personEmails[0].id,
        person_id: personEmails[0].person_id,
        email,
        subscription_status: status,
        //make sure this doesn't change
        source_input_id: personEmails[0].source_input_id
        //original: personEmails[0]
      });
    } else {
      status = status || 'Subscribed'; // Default subscribed
      queuePersonEmail(tablesToUpsert, {
        ...rest,
        id: null,
        person_id: o.person_id,
        email,
        subscription_status: status,
        source_input_id: o.input_id
      });
    }
    // IF an unsubscribe, we need to update the subscription status for ALL related emails,
    // including new ones
    if (status === 'Unsubscribed') {
      matchingEmails.forEach((original) => {
        if (original.subscription_status !== 'Unsubscribed') {
          let updatedRecord = {};
          //this is to make sure the keys match
          Object.keys(rest).forEach((k) => {
            updatedRecord[k] = original[k] || null;
          });
          Object.assign(updatedRecord, {
            id: original.id,
            person_id: original.person_id,
            email,
            subscription_status: 'Unsubscribed',
            //make sure this doesn't change
            source_input_id: original.source_input_id
          });
          queuePersonEmail(tablesToUpsert, updatedRecord, { key: (row) => String(row.id) });
        }
      });
      tablesToUpsert.person_email
        .filter((d) => d.id == null && d.email?.trim().toLowerCase() === lcEmail)
        .forEach((d) => {
          d.subscription_status = 'Unsubscribed';
        });
    }
  });
}
export default {
  bindings,
  type,
  transform
};
