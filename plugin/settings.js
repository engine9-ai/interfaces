export const settings = [
  {
    name: 'table_prefix_counter',
    type: 'int',
    default: 2729,
    hidden: true,
    description: 'Hex table-prefix allocator. Incremented by PluginWorker.getNextTablePrefixCounter.'
  },
  {
    name: 'default_stack',
    type: 'string',
    default: '',
    description:
      'Stack (or plugin) path for installDefaultPlugins when no path is passed — e.g. @engine9/interfaces/stacks/standard or @engine9/interfaces/stacks/limited-pii. Empty installs the core person interfaces only. Ignored when @engine9/interfaces/utilities/limited-pii has exclude_pii true (forced limited-pii stack).'
  }
];
export default {
  settings
};
