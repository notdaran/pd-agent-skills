# config.example.md

Copy this file to `config.local.md` and fill in your own values. `config.local.md` is gitignored -
it holds the store, app and machine details that are yours, so the skill itself stays generic.

| Placeholder | What it is | Where to find it |
|---|---|---|
| `<STORE_HANDLE>` | Your dev store handle | the `<handle>` in `admin.shopify.com/store/<handle>` |
| `<APP_HANDLE>` | Your ACTIVE app install | Shopify Dev Console, the install marked "Connected" |
| `<DEV_SERVER_COMMAND>` | Starts your tunnelled dev server | your repo's `package.json` scripts |
| `<DB_NAME>` | Local Mongo database | your dev server config |

## Values

- `<STORE_HANDLE>` = your-dev-store
- `<APP_HANDLE>` = your-app-handle
- `<DEV_SERVER_COMMAND>` = npm run dev
- `<DB_NAME>` = your-db

## Test products

Two groups, both needed. The disabled group is what the product picker must exclude.

- **Active:** product A, product B, ...
- **Disabled (archived / draft / hidden):** product X, product Y, ...

A Shopify development store seeded with the standard sample data gives you both groups for free.

## If you switch between dev apps

A store can carry several installs of the same app, one per dev app config. Only the install whose
`client_id` matches what the dev server is currently serving will load your local code. Keep the
handle of each one here alongside its `client_id`, and re-check which is active after every server
restart — the handle in the URL is the only thing that tells them apart.
