# Person Hash Interface

`@engine9/interfaces/person_hash` stores **pseudonymous match keys** for email and phone — SHA-256 (`*_hash_v1`) and MD5 (`*_hash_md5`) — without storing the plaintext.

It is **not** part of the standard stack. It ships in `@engine9/interfaces/stacks/limited-pii`, or install it explicitly (once per account — `unique: true`). Once installed, core weaves its transforms into the inbound people pipeline automatically.

Server `settings.exclude_pii` (nearest account in child-first lineage) makes `installStandard()` default to limited-pii and refuses `@engine9/interfaces/stacks/standard`, `person_email`, `person_phone`, and `person_address` even if those plugins are already installed. That does **not** uninstall leftover plaintext tables.

It does **not** depend on `person_email` or `person_phone`. Those plugins may be installed alongside it; this interface never writes to their tables.

## Install

```javascript
await pluginWorker.install({ path: '@engine9/interfaces/person_hash' });
// or the PII-free stack
await pluginWorker.installStandard({ path: '@engine9/interfaces/stacks/limited-pii' });
```

A second install of the same path reuses the existing plugin row.

## Inbound pipeline slots

`metadata.inbound` declares where the transforms run; core reads it from the installed plugin row and never hardcodes this path:

```javascript
inbound: {
  id: ['extractContactHashes'],  // with the other identifier extracts, before person_id assignment
  upsert: ['upsertPersonHash']   // with the other table upserts, after person_id assignment
}
```

How slots and the weaver work: `@engine9/core/lib/peoplePipeline/README.md`.

To see the woven chain for an account: `personWorker.getInboundTransforms({ pluginId, describe: true })` (CLI: `e9 personworker getInboundTransforms --plugin_id=<plugin_id> --describe=true`). On a limited-pii account the listing has `person_hash` on `id` and `upsert` and no `person_email` / `person_phone` / `person_address` lines. Drop a step for one job with `omit_transforms`.

## Data Model

### `person_hash_email`

Primary key: `(person_id, email_hash_v1)`.

| Field | Type | Description |
| --- | --- | --- |
| `person_id` | `person_id` | Person that owns the hash. |
| `email_hash_v1` | `hash` | SHA-256 of the trimmed, lowercased email. Used as the person identifier type `email_hash_v1`. |
| `email_hash_md5` | `hash` | Legacy MD5 of the trimmed, **uppercased** email. Kept for some political matching contexts; empty when the inbound row had a SHA-256 but no plaintext. |
| `source_input_id` | `foreign_uuid` | Input that originally created the row. Existing rows keep their original source. |
| `created_at` / `modified_at` | timestamps | |

### `person_hash_phone`

Primary key: `(person_id, phone_hash_v1)`. Same shape with `phone_hash_v1` / `phone_hash_md5`. Phones are normalized like `person_phone` (digits + optional `+1` for US 10-digit numbers) before hashing.

## Inbound Behavior

The `extractContactHashes` transform hashes `email` / `phone` (or mobile/cell aliases) when present, or accepts an existing `email_hash_v1` / `phone_hash_v1`. It pushes those SHA-256 values as person identifiers. It does not write email or phone onto the hash tables.

The `upsertPersonHash` transform writes only hash columns to `person_hash_email` / `person_hash_phone`.

## Outbound Behavior

- `appendEmailHash` / `appendPhoneHash` attach hashes from plaintext on the row, or from the hash tables by `person_id`. They do not append email or phone.

## Search

`PersonWorker.search` `emails` / `phones` match `person_email` / `person_phone` when those tables exist, and also hash the query (or accept SHA-256 / MD5 hex) against `person_hash_email` / `person_hash_phone`. If the caller passed emails or phones and neither table exists, the clause matches nobody (`1=0`). Related summaries include `email_hashes` / `phone_hashes` when those tables are present.

The plugin also exports `search.emailHashes` / `search.phoneHashes` for the plugin search tree (`@engine9/interfaces/person_hash:search:emailHashes`).

Default warehouse export includes the hash tables (export skips them when they do not exist). When `settings.exclude_pii` is set and `tables` is not explicit, `person_email` / `person_phone` / `person_address` are omitted from that default list.
