# Person Email Interface

The `@engine9/interfaces/person_email` plugin stores email addresses for people and provides the common email-related behavior used by imports, matching, searches, segments, reports, and exports.

It depends on `@engine9/interfaces/person` because every email row belongs to a person through `person_id`.

## Data Model

The plugin creates the `person_email` table. A person can have multiple email rows, but each `(email, person_id)` pair is unique.

| Field | Type | Description |
| --- | --- | --- |
| `id` | `id` | Primary row identifier. |
| `person_id` | `person_id` | Person that owns the email address. |
| `email_type` | `string` | Email category. Allowed values are `Personal`, `Work`, and `Other`. Defaults to `Personal`. |
| `email` | `string` | Email address. Inbound transforms trim whitespace but otherwise preserve the provided casing. Matching and hashing compare the lowercased value. |
| `subscription_status` | `string` | Email subscription state. Allowed values are `Not Subscribed`, `Subscribed`, `Unsubscribed`, `Bouncing`, and `Spam`. The schema default is `Not Subscribed`; the inbound upsert transform defaults newly imported emails to `Subscribed` when no status is provided. |
| `confirmation_status` | `string` | Opt-in confirmation state. Allowed values are `Not Confirmed`, `Confirmation Sent`, and `Confirmed`. Defaults to `Not Confirmed`. |
| `deliverability_score` | `int` | Deliverability score for the address. `0` represents undeliverable, `1` represents deliverable, and higher values can be used by callers for additional states. Defaults to `1`. |
| `preference_order` | `int` | Sort order for preferred emails, where `0` is first. Defaults to `0`. |
| `email_hash_v1` | `hash` | SHA-256 hash of the trimmed, lowercased email address. Used as an identifier and for privacy-preserving exports. |
| `source_input_id` | `foreign_uuid` | Input that originally created the email row. Existing rows keep their original source when updated. |
| `created_at` | `created_at` | Timestamp when the row was created. |
| `modified_at` | `modified_at` | Timestamp when the row was last modified. |

Indexes:

- `person_id`
- unique `(email, person_id)`

## Inbound Behavior

The inbound `id` transform extracts an `email_hash_v1` identifier from either `email` or an existing `email_hash_v1` field. When an `email` is present and at least five characters after trimming, it is trimmed, lowercased for hashing, and hashed with SHA-256.

The inbound `upsert` transform writes rows to `person_email`.

- Emails are matched case-insensitively after trimming.
- Existing rows for the same `person_id` and email are updated instead of duplicated.
- The transform accepts either `email_subscription_status` or `subscription_status`.
- Newly inserted emails default to `Subscribed` if no status is provided.
- Unsubscribe-like entries set `subscription_status` to `Unsubscribed` when no status was provided. This includes `entry_type` values `EMAIL_UNSUBSCRIBE` and `EMAIL_SPAM`, plus `entry_type_id` values `44` and `48`.
- When an email is unsubscribed, all matching email rows for that address are also updated to `Unsubscribed`.

## Outbound Behavior

The plugin provides outbound transforms for appending email data to batches:

- `appendEmail` looks up `person_email` rows by `person_id` and appends `email` to each batch row. It can be filtered by `subscriptionStatus`, and it preserves any existing `email` value already on the row.
- `appendEmailHash` appends `email_hash_v1` by hashing the row's trimmed, lowercased `email` when the hash is not already present.

## Search and Segments

The `emails` search lets users find people who have an email address, optionally filtered by:

- `subscriptionStatus`, using the same values as `subscription_status`
- `emailMatch`, matched against the `email` column with `LIKE`

The plugin also defines an `Email Subscribers` segment, which selects people with a `Subscribed` email address.

## Reports and UI

The exported report is `Email Subscription Status`. It summarizes email counts by source plugin, including counts for `Subscribed`, `Unsubscribed`, `Bouncing`, `Spam`, and `Not Subscribed` emails.

The console UI adds an `Emails` tab on person records. It displays each person's email rows with the email address, type, subscription status, and modified timestamp.
