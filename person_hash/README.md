# Person Hash Interface

`@engine9/interfaces/person_hash` stores **pseudonymous match keys** for email and phone — SHA-256 (`*_hash_v1`) and MD5 (`*_hash_md5`) — without storing the plaintext.

It is **not** part of `installStandard` or the default inbound people pipeline. Install it explicitly (once per account — `unique: true`) and opt into its transforms via `extraTransforms` slots.

It does **not** depend on `person_email` or `person_phone`. Those plugins may be installed alongside it; this interface never writes to their tables.

## Install

```javascript
await schemaWorker.install({ path: '@engine9/interfaces/person_hash' });
```

A second install of the same path reuses the existing plugin row.

## Opt into the inbound pipeline

`metadata.inbound` names the extraTransforms slots (not hardcoded in core):

```javascript
extraTransforms: {
  beforeIdentity: [{ path: '@engine9/interfaces/person_hash:transforms:id' }],
  beforeUpsert: [{ path: '@engine9/interfaces/person_hash:transforms:upsert' }]
}
```

On the server, pass the same object as `extra_transforms` to `loadPeople` / `idFiles`. `beforeIdentity` runs after the standard email/phone identifier extracts and before `person_id` assignment. `beforeUpsert` runs after `person_id` is assigned and before the standard table upserts.

## Data Model

### `person_hash_email`

Primary key: `(person_id, email_hash_v1)`.

| Field | Type | Description |
| --- | --- | --- |
| `person_id` | `person_id` | Person that owns the hash. |
| `email_hash_v1` | `hash` | SHA-256 of the trimmed, lowercased email. Used as the person identifier type `email_hash_v1`. |
| `email_hash_md5` | `hash` | MD5 of the same normalized email. Empty when the inbound row had a SHA-256 but no plaintext. |
| `source_input_id` | `foreign_uuid` | Input that originally created the row. Existing rows keep their original source. |
| `created_at` / `modified_at` | timestamps | |

### `person_hash_phone`

Primary key: `(person_id, phone_hash_v1)`. Same shape with `phone_hash_v1` / `phone_hash_md5`. Phones are normalized like `person_phone` (digits + optional `+1` for US 10-digit numbers) before hashing.

## Inbound Behavior

The `id` transform hashes `email` / `phone` (or mobile/cell aliases) when present, or accepts an existing `email_hash_v1` / `phone_hash_v1`. It pushes those SHA-256 values as person identifiers. It does not write email or phone onto the hash tables.

The `upsert` transform writes only hash columns to `person_hash_email` / `person_hash_phone`.

## Outbound Behavior

- `appendEmailHash` / `appendPhoneHash` attach hashes from plaintext on the row, or from the hash tables by `person_id`. They do not append email or phone.
