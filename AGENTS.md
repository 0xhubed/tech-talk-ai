# Repository Guidelines
## Project Structure & Module Organization
- `presentation-site/` – Next.js 15 App Router project (App folder under `src/app`, React components in `src/components`, shared logic in `src/lib`, state stores in `src/store`).
- `presentation_website_plan.md` – living implementation plan that maps roadmap to files.
- `src/` (root) – legacy prototypes; treat as read-only unless specifically coordinating cleanup.
- Public assets (images, nbconvert previews, notebooks) live under `presentation-site/public/` with topic-based folders (for example `public/notebooks/`).
## Build, Test, and Development Commands
- `npm run dev` (run inside `presentation-site/`) – start the Turbopack dev server on `http://localhost:3000`.
- `npm run build` – create a production build and validate type checking/static analysis.
- `npm run start` – serve the production bundle locally for rehearsal checks.
- `npm run lint` – execute ESLint with the Next.js config; must be clean before opening a PR.
- `npm run notebooks:export` – execute notebooks via nbconvert and refresh the HTML previews in `public/notebooks/` (requires Jupyter).
## Coding Style & Naming Conventions
- TypeScript + React functional components; colocate UI under `src/components/<feature>/ComponentName.tsx`.
- Two-space indentation, trailing commas, double quotes; lint autofixes most issues.
- Tailwind utility classes drive layout with design tokens defined in `src/app/globals.css`.
- Shared helpers live in `src/lib`, Zustand stores follow `<domain>Store.ts`, React components use PascalCase.
## Testing Guidelines
- Visual/QoS checks currently manual; Playwright suites will live under `presentation-site/tests/` and follow `<feature>.spec.ts` naming.
- Add unit-style coverage for data utilities alongside the module in `__tests__` folders when introducing logic.
- Always run `npm run lint` before pushing; document manual verification (e.g., “npm run dev + screenshot”) in PR descriptions.
## Commit & Pull Request Guidelines
- Write concise, imperative commit subjects (e.g., `Add Plotly scatter to housing preview`) and group related changes.
- PRs should summarize user impact, list validation commands, include visuals for UI changes, and reference plan sections or issues.
- Ensure CI-equivalent commands (`npm run lint`, `npm run build`) pass locally; flag large binary assets for LFS before review.
## Agent-Specific Notes
- When updating a section, mirror web changes with notebook exports in `presentation-site/public/notebooks/` so attendees can replay demos.
- Use presenter freeze controls before capturing screenshots or recordings to avoid Plotly interactions shifting mid-capture.
