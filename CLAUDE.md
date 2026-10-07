# Working in this repo

## Getting changes to main

All work reaches `main` through pull requests with auto-merge turned on. Nobody pushes to `main` directly.

1. Branch off the latest `main`.
2. Run `pnpm build` locally before pushing.
3. Open the PR as ready for review (not a draft) and enable auto-merge with the **squash** method.
4. The PR merges itself once the Vercel preview and any required checks pass. If a check fails, fix it on the same branch; auto-merge stays armed.
5. After a PR merges, start the next change from a fresh branch off `main`; never stack new commits on a merged branch.

## Secrets

Never commit `.env*` files other than `.env.example` (names only). Real values live in Vercel; see `docs/ARCHITECTURE.md` section 10.
