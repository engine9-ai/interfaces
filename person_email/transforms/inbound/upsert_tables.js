export const bindings = {
  // existingPersonEmails: { path: 'sql.query', table: 'person_email', lookup:['person_id'] },
  databaseEmails: { path: 'sql.query', options: { table: 'person_email', lookup: ['email'] } },
  tablesToUpsert: { path: 'sql.tables.upsert' }
};
export const type = 'upsert';
export async function transform(props) {
  const { batch, databaseEmails, tablesToUpsert } = props;
  if (batch.length === 0) return;
  batch.forEach((o) => {
    if (!o.email) return;
    tablesToUpsert.person_email = tablesToUpsert.person_email || [];
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
      tablesToUpsert.person_email.push({
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
      tablesToUpsert.person_email.push({
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
        if (original.subscription_status !== 'Unsubscribed)') {
          tablesToUpsert.person_email.push({ ...original, subscription_status: 'Unsubscribed', original });
        }
      });
      tablesToUpsert.person_email
        .filter((d) => d.id === null && d.email === email)
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
