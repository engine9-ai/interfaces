# engine9-interfaces

Engine9 interfaces are common schemas that are used by a variety of core and plugins. Implementing (aka extending) these interfaces allows plugins to participate in common tools and features, while adding in custom functionality.

## Conventions

- **Single deployment per path:** Packages under `@engine9/interfaces/*` are always installed at most once per account (`SchemaWorker.install` forces `unique` for that prefix). Multiple rows per path are rejected. Native `@engine9/plugins/*` packages may still have more than one instance when they are not marked unique.

- **Public module surface:** Export only the standard building blocks documented in [`skills/create-engine9-plugin/SKILL.md`](../skills/create-engine9-plugin/SKILL.md): for example `metadata`, optional `schema`, `transforms`, `search`, `segments`, `metrics`, `reports`, and the default object that aggregates them. Do **not** export ad hoc hooks (such as custom install helpers or segment–plugin wiring) from interface packages; the server is responsible for any special install-time behavior tied to a specific interface path.

- **Segments and `plugin_id`:** Saved segments use `segment.plugin_id` = the interface (or plugin) that **owns the definition**. Which inputs and timelines participate in a build is determined by the segment’s **`universe`** EQL (and any explicit `pluginId` inside `search` options), so a segment can evaluate data tied to other deployed plugins without changing `plugin_id`.
