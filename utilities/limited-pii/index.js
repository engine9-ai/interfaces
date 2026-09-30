import { settings } from './settings.js';

const metadata = {
  name: '@engine9/interfaces/utilities/limited-pii',
  description:
    'On-demand PII controls: exclude_pii steers installDefaultPlugins and default export table lists without installing the limited-pii stack by itself.',
  unique: true
};

export { metadata, settings };
export default {
  metadata,
  settings
};
