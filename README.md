# engine9-interfaces

engine9 interfaces are common schemas that are used by a variety of core and plugins. Implementing (aka extending) these interfaces allows plugins to participate in common tools and features, while adding in custom functionality.

## Documentation

Each interface package is documented in its own `README.md`. That file is the human-readable contract: what the package is for, the data model, inbound/outbound behavior, search, **predefined segments**, reports, and UI. Keep implementation details in code comments; keep audience and membership rules in the README.

Packages with predefined segments:

- [`person_email`](person_email/README.md) — Email Subscribers
- [`person_phone`](person_phone/README.md) — Textable People
- [`transaction/core`](transaction/core/README.md) — Customers
- [`channels/email`](channels/email/README.md) — rolling-window email openers and clickers

See [`skills/create-engine9-plugin/SKILL.md`](../skills/create-engine9-plugin/SKILL.md) for the README layout.

## Conventions

- **Plugin uniqueness:** `SchemaWorker.install` reuses an existing `plugin` row when the path is unique: `metadata.unique` if set, otherwise `@engine9/interfaces/*` (except `person_custom`, which is `unique: false`). Native plugins that set `unique: true` behave the same. Third-party plugins and `person_custom` may have more than one instance per path; pass `id` to update an existing non-unique row.

- **Public module surface:** Export only the standard building blocks documented in [`skills/create-engine9-plugin/SKILL.md`](../skills/create-engine9-plugin/SKILL.md): for example `metadata`, optional `schema`, `transforms`, `search`, `segments`, `metrics`, `reports`, and the default object that aggregates them. Do **not** export ad hoc hooks (such as custom install helpers or segment–plugin wiring) from interface packages; the server is responsible for any special install-time behavior tied to a specific interface path.

- **Segments, universes, and `plugin_id`:** Saved segments use `segment.plugin_id` = the interface (or plugin) that **owns the definition**. A definition’s **`universe`** describes the span of source data searched across; input EQL entries select timeline stores, while person/table entries can restrict eligible people. Explicit `pluginId` values inside `search` options may narrow that span further, so a segment can evaluate data tied to other deployed plugins without changing its owning `plugin_id`. Export bundles use the same universe vocabulary for table and input-file artifacts.
