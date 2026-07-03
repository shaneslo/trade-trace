# Trade Trace

Trade Trace is a Vite + React workflow editor with a Hono API running on Cloudflare Workers. React Flow, Zustand, Tailwind CSS, and shadcn/Radix primitives make up the main UI stack.

## Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright tests |
| `npm run check` | Lockfile guard, type-check, build, and Wrangler dry run |
| `npm run cf-typegen` | Regenerate Worker binding types |
| `npm run deploy` | Deploy to Cloudflare Workers |

## Architecture

- `src/app/` - React app entry and workflow view.
- `src/app/workflow/` - workflow canvas, config, hooks, layouts, store, and mock data.
- `src/components/` - shared UI and React Flow UI components.
- `src/worker/` - Hono Worker API and edge serving path.
- `docs/assets/homepage.png` - README homepage screenshot.

## Work Tracking

- Linear owns project state; GitHub owns branches, PRs, reviews, and checks.
- Active work is tracked under the **SLO Fleet** team (`FLEET`).
- Include the Linear issue ID in branch names and PR bodies when available.
- Update Linear when work starts, blocks, opens a PR, merges, parks, or completes.
- Keep GitHub Issues for repo-native intake only; approved work should be tracked in Linear.

## Gotchas

- This repo is npm-only. `scripts/check-lockfiles.mjs` rejects stray `pnpm-lock.yaml` or `bun.lock` files.
- Refresh `docs/assets/homepage.png` when UI changes affect the README screenshot.
- Use current Cloudflare Workers docs for deploy, limits, bindings, and Wrangler behavior.
- Run `npm run cf-typegen` after changing Worker bindings.
