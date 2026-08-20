# Person Phone Interface

The `@engine9/interfaces/person_phone` plugin stores phone numbers for people and provides the common phone-related behavior used by imports, matching, searches, segments, and exports.

It depends on `@engine9/interfaces/person` because every phone row belongs to a person through `person_id`.

## Data Model

The plugin creates the `person_phone` table. A person can have multiple phone rows, but each `(phone, person_id)` pair is unique.

| Field | Type | Description |
| --- | --- | --- |
| `id` | `id` | Primary row identifier. |
| `person_id` | `person_id` | Person that owns the phone number. |
| `phone_type` | `string` | Phone category. Allowed values are `Personal`, `Cell`, `Home`, `Work`, `Fax`, and `Other`. Defaults to `Personal`. |
| `phone` | `string` | Phone number. Inbound transforms keep digits and `+`, and prefix US 10-digit numbers with `+1`. |
| `preference_order` | `int` | Sort order for preferred phones, where `0` is first. Defaults to `0`. |
| `sms_status` | `string` | SMS subscription state. Allowed values are `Not Subscribed`, `Subscribed`, `Unsubscribed`, and `Bouncing`. Defaults to `Not Subscribed`. |
| `sms_deliverability_score` | `int` | SMS deliverability score on a 1–100 scale (`100` is most deliverable). Defaults to `100`. |
| `call_status` | `string` | Voice-call subscription state. Same allowed values as `sms_status`. Defaults to `Not Subscribed`. |
| `remote_phone_id` | `string` | Remote system phone record id when available. |
| `phone_hash_v1` | `hash` | SHA-256 hash of the normalized phone number. Used as an identifier and for privacy-preserving exports. |
| `source_input_id` | `foreign_uuid` | Input that originally created the phone row. Existing rows keep their original source when updated. |
| `created_at` | `created_at` | Timestamp when the row was created. |
| `modified_at` | `modified_at` | Timestamp when the row was last modified. |

Indexes:

- `person_id`
- unique `(phone, person_id)`
- `remote_phone_id`

## Inbound Behavior

The inbound `id` transform extracts a `phone_hash_v1` identifier from either `phone` or an existing `phone_hash_v1` field.

- `cell`, `mobile`, and `mobile_phone` fill `phone` when it is empty, and default `phone_type` to `Cell`.
- A bare `phone` with no type defaults to `Home`.
- Numbers shorter than 8 digits after cleaning are dropped.
- US numbers without a `+` prefix are normalized (`10` digits become `+1…`; `11` digits starting with `1` become `+1…`).

The inbound `upsert` transform writes rows to `person_phone`.

- Existing rows for the same `person_id` and phone are updated instead of duplicated.
- Newly inserted phones default to `sms_status` `Not Subscribed` when no status is provided.
- SMS unsubscribe-like entries set `sms_status` to `Unsubscribed` when no status was provided. This includes `entry_type` values `SMS_UNSUBSCRIBE` and `SMS_SPAM`, plus `entry_type_id` values `34` and `38`.

## Outbound Behavior

`appendPhoneHash` hashes the row's normalized `phone` into `phone_hash_v1` when the hash is not already present.

## Search

The `phones` search lets users find people who have a phone number, optionally filtered by:

- `smsStatus`, using the same values as `sms_status`
- `callStatus`, using the same values as `call_status`
- `phoneMatch`, matched against the `phone` column with `LIKE`

## Segments

Predefined audiences shipped with this interface. On install, each key becomes a `segment` row whose definition path is `@engine9/interfaces/person_phone:segments:<key>`.

### Textable People

| | |
| --- | --- |
| **Key** | `textable` |
| **Definition path** | `@engine9/interfaces/person_phone:segments:textable` |
| **Who is included** | People with at least one phone whose `sms_status` is `Subscribed` |
| **Who is excluded** | People whose phones are only `Not Subscribed`, `Unsubscribed`, or `Bouncing` for SMS |
| **How it is built** | Direct `person_phone` condition `sms_status = Subscribed` |
| **Universe** | None — membership is current `person_phone` rows, not a time window or message input set |

`call_status` is not part of this segment. A person can be textable without being subscribed for voice calls.

## UI

The console UI adds a `Phones` tab on person records. It displays each person's phone rows with the number and type.
