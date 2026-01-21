# Cards

Modern reimplementation of the legacy Cards solitaire game using Vite + React + TypeScript. The legacy build is kept for reference alongside the new web app.

## Repository layout

- cards-web: Vite + React + TypeScript app
- legacy: legacy Delphi + web output (reference only)
- GAME_SPEC.md: gameplay/spec notes
- PLAN.md: milestone checklist

## Quick start

From the repo root:

- Install: yarn --cwd cards-web install
- Dev server: yarn --cwd cards-web dev
- Build: yarn --cwd cards-web build
- Preview: yarn --cwd cards-web preview
- Tests: yarn --cwd cards-web test

## GitHub Pages deployment

A workflow is provided in .github/workflows/deploy-pages.yml. On push to main, it builds cards-web and deploys dist to GitHub Pages.

If your Pages site is served from a subpath (default for project pages), set Vite base to /<repo>/ in cards-web/vite.config.ts.

## Notes

- Seeds are persisted in localStorage.
- Reduced motion can be toggled in the UI and respects system preferences.
