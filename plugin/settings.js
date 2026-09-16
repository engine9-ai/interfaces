export const settings = [
  {
    name: 'table_prefix_counter',
    type: 'int',
    default: 2729,
    hidden: true,
    description: 'Hex table-prefix allocator. Incremented by PluginWorker.getNextTablePrefixCounter.'
  }
];
export default {
  settings
};
