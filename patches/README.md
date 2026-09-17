# patches/

## `@payloadcms/drizzle` — `uuidMap` not threaded through nested arrays

**Do not delete this without re-testing `pnpm seed waho`.**

A `select` with `hasMany: true` two array levels deep — ours is
`menus.sections[].items[].dietary` — crashes the version write on Postgres:

```
invalid input syntax for type integer: "6aab652c66bec0b4440490a8"
insert into "_menus_v_version_sections_items_dietary" ("parent_id", ...)
```

Every `hasMany` select row in a document is collected flat and given a
temporary uuid for its parent. After the array rows are inserted,
`arraysBlocksUUIDMap` maps uuid → real serial id and the select rows are
rewritten. `insertArrays` fills that map — but its **recursive** call for
sub-arrays omits `uuidMap`, so rows at depth 2+ never register. Their uuid
reaches Postgres as a `parent_id` integer.

Upstream: payloadcms/payload#17142, fix in #17144. **Not in any published
release** — `dist/upsertRow/insertArrays.js` is byte-identical in 3.88.0 and
3.89.0. The patch is the one line that PR adds.

The key in `pnpm.patchedDependencies` is deliberately unversioned, so a minor
bump does not silently drop the patch. When the patch stops applying, upstream
has shipped the fix and this whole folder can go.
