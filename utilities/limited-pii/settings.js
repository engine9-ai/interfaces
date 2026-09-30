export const settings = [
  {
    name: 'exclude_pii',
    type: 'boolean',
    default: false,
    description:
      'When true, installDefaultPlugins prefers @engine9/interfaces/stacks/limited-pii over default_stack, and installs of stacks/standard, person_email, person_phone, and person_address are refused. Does not drop existing plaintext tables. Also omits those tables from the default export list when tables is not set.'
  }
];
export default {
  settings
};
