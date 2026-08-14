import stack from './stack.json' with { type: 'json' };

const metadata = { ...stack };
const include = stack.include;

export { metadata, include };
export default { metadata };
