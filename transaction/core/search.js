import { relativeDate, isValidDate } from '@engine9/input-tools';

export const all = {
  title: 'Transactions',
  form: {
    title: 'Transactions',
    type: 'object',
    properties: {
      plugin_id: {
        type: 'string'
      },
      start: {
        title: 'Start',
        type: 'string',
        description:
          "Optional; only include rows with ts >= start. Parsed with relativeDate; supports ISO datetimes or relative expressions like '-30d'."
      },
      end: {
        title: 'End',
        type: 'string',
        description:
          'Optional; only include rows with ts < end (exclusive upper bound). Parsed with relativeDate; supports ISO datetimes or relative expressions.'
      }
    },
    required: []
  },
  optionsToEQL: (options) => {
    const { plugin_id, start, end } = options;
    const conditions = [];
    let text = 'Has any transactions';
    if (plugin_id) {
      conditions.push(`input.plugin_id='${plugin_id}'`);
      text += ` from plugin ${plugin_id}`;
    }
    if (start) {
      const s = relativeDate(start);
      if (!isValidDate(s)) throw new Error('Invalid start: ' + start);
      conditions.push(`transaction.ts>='${s.toISOString()}'`);
      text += ` with ts >= ${s.toISOString()}`;
    }
    if (end) {
      const e = relativeDate(end);
      if (!isValidDate(e)) throw new Error('Invalid end: ' + end);
      conditions.push(`transaction.ts<'${e.toISOString()}'`);
      text += ` with ts < ${e.toISOString()}`;
    }
    return {
      text,
      eql: {
        table: 'transaction',
        joins: [
          {
            table: 'input',
            join_eql: 'transaction.input_id=input.id'
          }
        ],
        columns: ['person_id'],
        conditions
      }
    };
  }
};
export const minimum = {
  title: 'Minimum transaction amount',
  form: {
    title: 'Minimum transaction amount',
    type: 'object',
    properties: {
      amount: {
        type: 'number'
      },
      filterType: {
        type: 'string'
      }
    },
    required: []
  },
  optionsToEQL: (options) => ({
    table: 'transaction',
    columns: ['person_id'],
    conditions: [`amount>=${parseFloat(options.amount)}`]
  })
};
export default {
  all,
  minimum
};
