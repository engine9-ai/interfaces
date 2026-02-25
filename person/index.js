import schema from './schema.js';
import upsert from './transforms/inbound/upsert_tables.js';
import simpleMap from './transforms/simpleMap.js';
import appendName from './transforms/outbound/appendName.js';
import metrics from './metrics.js';
const metadata = {
  name: '@engine9/interfaces/person',
  version: '1.0.0',
  schemas: ['schema.js']
};
const transforms = {
  upsert,
  simpleMap,
  appendName
};
export const search = {
  person: {
    form: {
      givenName: {
        title: 'First Name',
        type: 'string'
      },
      familyName: {
        title: 'Last Name',
        type: 'string'
      },
      ids: {
        title: 'Person Ids (comma delimited)',
        type: 'string'
      },
      idGreaterThanEqual: {
        title: 'ID Greater than or equal to',
        type: 'number'
      },
      idLessThan: {
        title: 'ID less than',
        type: 'number'
      }
    },
    optionsToEQL: (options) => {
      const text = [];
      const { ids, idGreaterThanEqual, idLessThan, givenName = '', familyName = '' } = options;
      const conditions = [];
      if (ids) {
        let arr = ids || '';
        if (typeof ids === 'string') arr = ids.split(',');
        if (arr.length === 0) arr = [0];
        conditions.push({ eql: `id in (${arr.map((p) => parseInt(p, 10)).join(',')})` });
        text.push(`Person ID in ${arr.map((p) => parseInt(p, 10)).join(',')}`);
      }
      if (idGreaterThanEqual) {
        conditions.push({ eql: `id>=${idGreaterThanEqual}` });
        text.push(`Person ID greater or equal to ${idGreaterThanEqual}`);
      }
      if (idLessThan) {
        conditions.push({ eql: `id<${idLessThan}` });
        text.push(`Person ID less than ${idLessThan}`);
      }
      if (givenName.length > 0) {
        text.push(`First name like '${givenName}'`);
        conditions.push({ eql: `given_name like '${givenName}'` });
      }
      if (familyName.length > 0) {
        text.push(`Last name like '${givenName}'`);
        conditions.push({ eql: `family_name like '${familyName}'` });
      }
      return {
        text,
        eql: {
          table: 'person',
          columns: ['id'],
          conditions
        }
      };
    }
  }
};
export { metadata };
export { schema };
export { transforms };
export { metrics };
export default {
  metadata,
  schema,
  transforms,
  metrics,
  search
};
