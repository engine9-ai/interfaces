import nodecrypto from 'node:crypto';
const { createHash } = nodecrypto;
export const type = 'id';
const blankHash = createHash('sha256').update('').digest('hex');
export async function transform({ batch }) {
  const ids = [];
  let hasPhoneHash = false;
  batch.forEach((o) => {
    o.identifiers = o.identifiers || [];
    //Different naming of the column
    //phone takes priority, but if that's not specified, go through other common ones
    if (!o.phone && (o.cell || o.mobile || o.mobile_phone)) {
      o.phone = o.cell || o.mobile || o.mobile_phone;
      o.phone_type = o.phone_type || 'Cell';
    }

    let phone = (o.phone || '').replace(/[^0-9+]*/g, '').trim();
    // clean and add a plus
    if (phone && phone.length >= 7) {
      //7 digit phones are the minimum
      // clean us based phones.  If it's already prefixed with '+' then assume
      // it's intentional
      if (phone.indexOf('+') < 0) {
        if (phone.length === 10) phone = `+1${phone}`;
        else if (phone.length === 11 && phone.slice(0, 1) === '1') phone = `+${phone}`;
      }
      // no secret or createHmac for this use case
      // it's basically a shared id hashing setup, so a secret will be exposed anyhow
      const value = createHash('sha256').update(phone).digest('hex');
      // Push all identifiers, later in the pipeline the priority will be determined
      o.identifiers.push({
        path: 'person_phone',
        type: 'phone_hash_v1',
        value
      });
      o.phone = phone;
      o.phone_hash_v1 = value;
      hasPhoneHash = true;
    } else if (o.phone_hash_v1 && o.phone_hash_v1 != blankHash) {
      o.identifiers.push({
        path: 'person_phone',
        type: 'phone_hash_v1',
        value: o.phone_hash_v1
      });
      hasPhoneHash = true;
    }
  });
  if (hasPhoneHash) batch.forEach((d) => (d.phone_hash_v1 = d.phone_hash_v1 || null));
  return ids;
}
export default {
  type,
  transform
};
