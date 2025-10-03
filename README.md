# TechTalkSide

Next.js 15 presentation website for the Tech Talk AI session. The site lives under `presentation-site/` and pairs the on-stage experience with synchronized Jupyter notebooks and interactive demos.

## Repository Layout

- `presentation-site/` – Next.js App Router project (all runtime code, styling, and assets).
- `presentation_website_plan.md` – Living implementation plan that links roadmap items to concrete files.
- `AI_Presentation_Website_Prompt.md` – Authoring brief for notebooks and long-form content.
- `*.ipynb` – Source notebooks used to generate the public HTML previews.

## Prerequisites

- Node.js 20.x (Next.js 15 requires Node 18.18 or newer; Node 20 is recommended).
- npm 10.x (bundled with current Node distributions).
- Optional: Jupyter Notebook for regenerating HTML previews.

## Getting Started

Install dependencies inside the Next.js app directory:

```bash
cd presentation-site
npm install
```

### Local Development

```bash
npm run dev
```

Starts the Turbopack dev server on <http://localhost:3000>.

### Production Build & Preview

```bash
npm run build
npm run start
```

`npm run build` compiles the production bundle (Turbopack), while `npm run start` serves the built assets locally for rehearsal checks.

### Linting

```bash
npm run lint
```

Runs ESLint with the Next.js configuration. Ensure this is clean before pushing.

### Refresh Notebook Previews

```bash
npm run notebooks:export
```

Executes the Jupyter notebooks and updates the HTML previews in `presentation-site/public/notebooks/`.

## Git & Deployment

If this workspace is not yet initialised, run:

```bash
git init
git branch -M main
git remote add origin https://github.com/0xhubed/techTalkSide.git
```

Commit your changes and push:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Additional Notes

- Follow the guidance in `presentation_website_plan.md` to keep implementation and content updates in sync.
- When notebook outputs change, update both the `.ipynb` sources and the exported HTML so attendees can replay the demos offline.
