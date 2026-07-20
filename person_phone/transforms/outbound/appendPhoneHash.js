import nodecrypto from 'node:crypto';
const { createHash } = nodecrypto;
export const type = 'id';
const MIN_PHONE_LENGTH = 8;
export async function transform({ batch }) {
  const ids = [];
  batch.forEach((e) => {
    e.phone_hash_v1 = e.phone_hash_v1 || '';
    if (e.phone_hash_v1) {
      // do nothing
    } else if (e.phone) {
      // clean and add a plus
      let phone = e.phone.replace(/[^0-9+]*/g, '').trim();
      if (phone.length >= MIN_PHONE_LENGTH) {
        // clean us based phones.  If it's already prefixed with '+' then assume
        // it's intentional
        if (phone.indexOf('+') < 0) {
          if (phone.length === 10) phone = `+1${phone}`;
          else if (phone.length === 11 && phone.slice(0, 1) === '1') phone = `+${phone}`;
        }
        // no secret or createHmac for this use case
        // it's basically a shared id hashing setup, so a secret will be exposed anyhow
        const value = createHash('sha256').update(phone).digest('hex');
        e.phone = phone;
        e.phone_hash_v1 = value;
      } else {
        e.phone = null;
        e.phone_hash_v1 = null;
      }
    }
  });
  return ids;
}
export default {
  type,
  transform
};
