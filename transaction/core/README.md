# Transaction Core Interface

The `@engine9/interfaces/transaction/core` plugin stores payment and gift transactions for people and provides the common transaction search, metrics, and segment used by imports, reports, and exports.

It depends on `@engine9/interfaces/person` because every transaction belongs to a person through `person_id`.

## Data Model

The plugin creates the `transaction` table. Each row is a dated amount tied to a person, an input, and optional source-code / message attribution.

| Field | Type | Description |
| --- | --- | --- |
| `id` | `id_uuid` | Primary row identifier. |
| `ts` | `datetime` | When the transaction occurred. |
| `input_id` | `uuid` | Input that produced the row. Required. |
| `entry_type_id` | `int` | Timeline entry type for the transaction. |
| `person_id` | `person_id` | Person the transaction is assigned to. |
| `amount` | `currency` | Transaction amount. |
| `remote_entry_id` | `string` | Remote system transaction id when available. |
| `remote_page_name` | `string` | Remote page or form name when available. |
| `remote_recurring_id` | `string` | Remote recurring-series id when available. |
| `recurs_id` | `int` | Recurring frequency. `0` is one-time. Defaults to `0`. |
| `recurring_number` | `int` | Sequence number in a recurring series. |
| `refund_amount` | `currency` | Refunded amount when applicable. |
| `given_name` / `family_name` / `email` | `string` | Snapshot of payer identity on the transaction. |
| `source_code_id` | `source_code_id` | Source code captured on the transaction. |
| `override_source_code_id` | `source_code_id` | Manual source-code override. |
| `final_source_code_id` | `source_code_id` | Source code after attribution. |
| `recommended_message_id` | `uuid` | Message suggested by last-click attribution. |
| `override_message_id` | `uuid` | Manual message override. |
| `final_message_id` | `uuid` | Message after attribution. |
| `extra` | `json` | Additional payload from the source system. |
| `created_at` | `created_at` | Timestamp when the row was created. |
| `modified_at` | `modified_at` | Timestamp when the row was last modified. |

Indexes:

- primary `id`
- `ts`
- `person_id`
- `remote_entry_id`
- `modified_at`

## Inbound Behavior

The inbound `upsert` transform writes rows to `transaction`.

- Each row gets an `id` from the timeline-entry UUID helper and an `entry_type_id` from the entry type.
- When recurring fields are present, `recurs_id` is derived from `recurs` (`daily` through `annually`) or from `recurring_number` when no frequency is set.

## Outbound Behavior

`appendTransactionSummary` looks up a person's transactions and attaches summary fields such as count, revenue, first/last/smallest/largest gifts, and recurring totals.

## Search

- `all` finds people who have any transaction, optionally filtered by `plugin_id` and a `start` / `end` window on `ts` (ISO datetimes or relative expressions such as `-30d`).
- `minimum` finds people who have a transaction of at least a given `amount`.

## Metrics

`summaryByDate` is a monthly card: record count and summed `amount` grouped by month of `ts`.

## Segments

Predefined audiences shipped with this interface. On install, each key becomes a `segment` row whose definition path is `@engine9/interfaces/transaction/core:segments:<key>`.

### Customers

| | |
| --- | --- |
| **Key** | `customers` |
| **Definition path** | `@engine9/interfaces/transaction/core:segments:customers` |
| **Who is included** | People who have at least one row in `transaction` |
| **Who is excluded** | People with no transactions |
| **How it is built** | A `transaction` table search that selects `person_id` with no extra filters |
| **Universe** | None — any transaction from any plugin, date, or amount counts |

Refunds, recurring gifts, and $0 rows are not filtered out. If a person has ever appeared on a transaction row, they are a customer.
