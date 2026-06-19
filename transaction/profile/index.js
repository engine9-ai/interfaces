import schema from './schema.js';

const metadata = {
  name: '@engine9/interfaces/transaction/profile',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/transaction/core': '>1.0.0'
  }
};

export { metadata, schema };
export default { metadata, schema };
