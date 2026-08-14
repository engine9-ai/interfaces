import stack from './stack.json' with { type: 'json' };

const metadata = { ...stack };
const include = stack.include;
const exclude = stack.exclude;

export { metadata, include, exclude };
export default { metadata };
