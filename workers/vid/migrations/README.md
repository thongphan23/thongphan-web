# VID D1 migration recovery

VID migrations are append-only. Never edit a migration after it has been applied to a shared D1 database. The executable local contract is `scripts/vid-migration.test.mjs`; it applies `0001` plus `0002` to both an empty database and a populated pre-migration snapshot, then proves a SQLite backup restores the prior schema and data.

Before an approved remote apply, record an RFC3339 timestamp and resolve it to a D1 Time Travel bookmark. Store the JSON evidence with the release evidence, outside Git if it contains account metadata:

```bash
npx wrangler d1 time-travel info thongphan-vid --timestamp <PRE_APPLY_RFC3339> --json --config wrangler.vid.toml
```

Apply and verify preview before production. If `0002` fails before the application accepts any post-migration writes, stop the Worker/write path and restore the recorded bookmark:

```bash
npx wrangler d1 time-travel restore thongphan-vid --bookmark <PRE_APPLY_BOOKMARK> --config wrangler.vid.toml
```

If post-migration writes may exist, do not restore an older bookmark because that could discard valid catalog changes. Keep the additive columns and ship an append-only forward repair migration instead. Restoring production remains an owner-approved release action; tests must use local SQLite only and must never invoke either remote command.
