export const segment = {
  title: 'Legacy Timeline',
  form: {
    title: 'Legacy Timeline',
    type: 'object',
    properties: {
      modelId: {
        title: 'Model ID',
        description: '',
        type: 'string',
        enum: [
          { value: '1', name: 'First Touch' },
          { value: '2', name: 'CRM Origin' }
        ]
      },
      sourceCode: {
        title: 'Source Code',
        description: '',
        type: 'string'
      }
    },
    required: []
  },
  /* map from provided user data into an EQL structure */
  optionsToEQL(options) {
    const models = [
      { value: '1', name: 'First Touch' },
      { value: '2', name: 'CRM Origin' }
    ];
    const { modelId, sourceCode } = options;
    const model = models.find((d) => d.value === modelId);
    let text = `${model.name} Model with Source Code ${sourceCode}`;
    const conditions = [
      {
        type: 'EQUALS',
        values: [
          {
            ref: { column: 'source_code' }
          },
          {
            value: { value: sourceCode }
          }
        ]
      },
      { eql: `model_id=${model.value}` }
    ];
    const eql = {
      table: 'transaction_model_source_code',
      joins: [
        {
          table: 'source_code_dictionary',
          join_eql: 'transaction_model_source_code.source_code_id=source_code_dictionary.source_code_id'
        }
      ],
      conditions
    };
    return { text, eql };
  }
};
export default {
  segment
};
