# engine9-interfaces

Engine9 interfaces are common schemas that are used by a variety of core and plugins. Implementing (aka extending) these interfaces allows plugins to participate in common tools and features, while adding in custom functionality.

## Conventions

- **Plugin uniqueness:** `SchemaWorker.install` reuses an existing `plugin` row when the path is unique: `metadata.unique` if set, otherwise `@engine9/interfaces/*` (except `person_custom`, which is `unique: false`). Native plugins that set `unique: true` behave the same. Third-party plugins and `person_custom` may have more than one instance per path; pass `id` to update an existing non-unique row.

- **Public module surface:** Export only the standard building blocks documented in [`skills/create-engine9-plugin/SKILL.md`](../skills/create-engine9-plugin/SKILL.md): for example `metadata`, optional `schema`, `transforms`, `search`, `segments`, `metrics`, `reports`, and the default object that aggregates them. Do **not** export ad hoc hooks (such as custom install helpers or segment–plugin wiring) from interface packages; the server is responsible for any special install-time behavior tied to a specific interface path.

- **Segments and `plugin_id`:** Saved segments use `segment.plugin_id` = the interface (or plugin) that **owns the definition**. Which inputs and timelines participate in a build is determined by the segment’s **`universe`** EQL (and any explicit `pluginId` inside `search` options), so a segment can evaluate data tied to other deployed plugins without changing `plugin_id`.
