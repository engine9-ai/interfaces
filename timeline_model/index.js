import search from './search.js';
const metadata = {
  name: '@engine9/interfaces/timeline',
  version: '1.0.0',
  dependencies: {
    '@engine9/interfaces/person': '>1.0.0'
  }
};
export { metadata };
export { search };
export default {
  metadata,
  search
};
