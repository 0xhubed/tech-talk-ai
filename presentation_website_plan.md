# TechTalk AI by Daniel Huber - Presentation Website Implementation Plan

## 1. Executive Summary + Decision Matrix

This project delivers an ultra-modern, presentation-friendly web experience that teaches the mathematical foundations and machine learning concepts underpinning neural networks trained on housing data, while also introducing AI agent frameworks. The site now pairs this stage-ready surface with synchronized Jupyter notebooks so facilitators can pivot into deeper labs without losing the audience; every section offers an "Open Notebook" call-to-action wired to nbconvert previews and downloadable `.ipynb` files. All visualizations and simulations remain performant in-browser with speaker controls, while their notebook counterparts expose richer instrumentation for rehearsal and post-talk exploration. After the session, the same agenda and notebooks stay available so attendees can replay the material at their own pace. Next.js 14, MDX content, and a curated animation/visualization toolkit provide the best balance of interactivity, performance, and deployment ease.

| Criteria | Next.js 14 + React (JS) | FastAPI + HTMX (Python) |
| --- | --- | --- |
| Interactivity & Animations | **5** – Mature ecosystem (Framer Motion, GSAP, react-three-fiber) | 3 – Rich motion requires bespoke JS, heavier integration |
| GPU / High-performance Options | **4** – WebGPU, gpu.js, Three.js support | 2 – Browser GPU story weaker; server GPU expensive |
| Deployment Friction | **5** – Vercel/Netlify tuned for Next.js | 3 – Requires container orchestration |
| SEO | **5** – SSG/ISR, metadata tooling | 4 – Template-based, more manual |
| Portability & Static Export | 4 – Static export for most sections | 2 – Runtime-bound |
| Contributor UX | **5** – Popular stack, MDX friendly authoring | 3 – Mixed Python/JS knowledge |

## 2. Information Architecture & Story Flow

1. **Agenda Hub (Landing)** – Immediate agenda view showcasing the four pillars (History of AI, AI Policy & Governance, Machine Learning Foundations, AI Agents & Discovery Loop) with succinct teasers, hover states, clear speaker assignments (Filip Frano covering history/policy, Daniel Huber leading ML foundations/agents), and CTAs to open each dedicated chapter page or launch its paired notebook.
2. **History of AI (Chapter Page)** – Scroll-driven timeline with marquee events (Perceptron, Backprop, AlexNet, AlphaGo, Transformers) and scaling laws annotation, plus notebook callouts for deeper dives. *Speaker: Filip Frano.*
3. **AI Policy & Governance (Chapter Page)** – Contextualise the regulatory landscape (EU AI Act, U.S. EO, OECD, G7), contrast responsible AI frameworks, and deliver a compliance checklist that attendees can adapt post-talk. *Speaker: Filip Frano.*
4. **Machine Learning Foundations (Chapter Page)** – Guided storyline introducing (Daniel Huber):
   - Anatomy of a compact feed-forward network (layers, neurons, weights, biases) with interactive diagram overlays.
   - How activations propagate and how weight adjustments change predictions in real time.
   - Linear regression as the first neural experience using the housing dataset (price vs. square footage baseline).
   - Calculus primer spotlighting derivatives/partials that power gradient updates with step-by-step formula callouts.
   - Loss function intuition (MSE) followed by interactive gradient descent surfaces and slider-controlled learning rates.
   - Progression into multi-feature housing regression to bridge toward deeper models while keeping math tangible.
   - Higher-dimensional math breakdown, matrix efficiency comparison, and GPU acceleration insights for future scaling.
5. **AI Agents & Discovery Loop (Chapter Page)** – Define agents, show LangGraph concepts, run pendulum experimentation sandbox with queued trials, surface live LLM reasoning (prompts + streamed thoughts), explore future trajectories, and point to LangGraph Studio replays. *Speaker: Daniel Huber.*
6. **Closing & Call-to-Action** – Future outlook, resources, share/downloads, contact.

Each agenda chapter presents concise on-page context and a "Open Notebook" call-to-action that loads a dedicated Jupyter notebook (nbconvert preview + downloadable `.ipynb`) so attendees can dive into LangGraph builds, gradient descent walkthroughs, and housing-price regression experiments without breaking the presentation flow.

Sticky side navigation and dynamic progress markers keep the facilitator oriented without overwhelming the audience. Each neural module unlocks sequentially so the flow can slow down after the network anatomy, derivative explanation, and gradient descent demo. Section callouts now emphasise takeaways for attendees who revisit the site after the talk instead of private presenter notes.

**Navigation Flow**
- Landing agenda renders immediately with no hero gate. Selecting a chapter triggers a route transition (`/history`, `/policies`, `/neural`, `/agents`) with page-level animations. Secondary CTA opens the relevant notebook in a new tab while keeping the chapter page ready for return. Breadcrumbs and the agenda rail let hosts jump between chapters without scrolling back to the top-level agenda.
- Chapter pages share a consistent layout: opening summary block, immersive visualization stack, recap card, and persistent notebook + LangGraph Studio CTA panel. A "Return to Agenda" button slides in after the first interaction for quick backtracking.
- Notebook previews open in overlay modals for quick skim or can pop to a new tab for full-screen exploration; the site remembers the last state so speakers can resume mid-demo and attendees can revisit the same state after the session.

## 3. Tech Architecture

### Frontend
- **Framework**: Next.js 14 App Router, React 18, TypeScript.
- **Styling**: TailwindCSS with custom design tokens; Radix UI primitives for accessible building blocks.
- **Content**: MDX via Contentlayer; shortcodes for complex components (e.g., `<NNDiagram />`).
- **Routing**: Agenda hub at `/` with chapter routes exposed at `/history`, `/policies`, `/neural`, `/agents`, plus `/notebooks` for the companion library and `/agents/langgraph-studio` for trace explainers.
- **Math Typesetting**: KaTeX with custom macros, responsive sizing, copy-to-clipboard, and dark/light-aware theming to ensure formulas read cleanly on-stage and in notebooks.
- **Animations & Motion**: Framer Motion for declarative choreography; GSAP for timeline parallax; Lottie/Rive for hero animations.
- **Charts & 3D**: Plotly.js for interactive 2D/3D charts; react-three-fiber + drei for 3D scenes; shader effects via glslify where needed.
- **High-performance Computing**: gpu.js/WebGPU (with graceful fallback) for GPU demos; web workers for heavy calculations.
- **State Management**: Zustand for global controls; React Query for async simulation data; URL sync for reproducible states.
- **Internationalization**: Ready for future localization via next-intl (English-first).

### Optional Backend
- Mostly static/edge-rendered; dynamic API routes handle heavy simulations or caching of precomputed datasets. Edge functions serve progressive data streaming when necessary.
- Secure serverless function proxies OpenAI's API for the pendulum experiment queue, streams reasoning tokens to the UI, logs prompts/responses for replay, and reconciles outputs against pre-validated physics derivations before display.

### Notebook Companion Integration
- Dedicated `/notebooks` repo folder with versioned `.ipynb` files synchronized to MDX content references.
- CI task runs `nbconvert --execute` for smoke tests, captures HTML previews, and exposes download links via Next.js static props.
- Lightweight binder/cloud environment instructions appear alongside the public notebook links so attendees can recreate the labs after the talk.
- "Open Notebook" buttons trigger a loading state, prefetch the rendered HTML, then offer launch options (inline modal preview or new-tab nbviewer) so the session can go deeper live or on-demand later.
- Notebook templates ship with Plotly-powered 3D charts, parameter sliders, and camera presets mirroring the in-page experiences for gradient descent and pendulum derivations.
- Each notebook includes ipywidgets controls to match live interactions (learning-rate sliders, notebook camera presets, LangGraph execution toggles) with guidance for Binder deployment.
- Agenda hub highlights the notebook path beside each chapter teaser so the audience anticipates the deep dive, while chapter routes pin a persistent notebook panel on the right rail.

### Build & Deploy
- **CI/CD**: GitHub Actions running lint, unit tests, E2E, Lighthouse, and visual checks.
- **Hosting**: Vercel with ISR for content updates, CDN edge caching, analytics integration.
- **Analytics**: PostHog (self-hostable) with privacy-minded event tracking.

### Performance Budget
- LCP < 2.5 s (desktop), < 3.0 s (mobile).
- TBT < 200 ms; CLS < 0.1.
- Initial JS < 220 KB; lazy load heavy visualization bundles.
- Use suspense + streaming for above-the-fold content; intersection observers for deferred components.

## 4. Content-to-Component Map & API Contracts

| Section | Component | Props | Events / Notes |
| --- | --- | --- | --- |
| Agenda Hero | `AgendaIntro` | `agendaItems[]`, `activeId`, `introCopy` | Focused by default, exposes notebook CTAs |
| Agenda Overlay | `AgendaRail` | `sections[]`, `activeId`, `showNotes` | Toggles agenda quick-links |
| Agenda Card | `AgendaCard` | `title`, `teaser`, `icon`, `targetHref`, `notebookHref` | `onOpenChapter`, `onOpenNotebook` |
| History Timeline | `AITimeline` | `events[]`, `scalingFormula`, `caption` | `onEventFocus` scroll spy |
| Scaling Chart | `ScalingLawChart` | `curves`, `noiseLevel`, `exponentHints` | `onNoiseChange` |
| NN Anatomy Primer | `NNDiagram` | `layers[]`, `activation`, `flowSpeed`, `weightHighlights` | `onNodeHover`, `onWeightToggle` |
| Housing Regression Intro | `NNTrainerPanel` | `dataset`, `defaultHyperparams`, `controlsConfig`, `showTargets` | `onRunTraining`, `onReset` |
| Derivative Walkthrough | `DerivativeStepper` | `formula`, `currentStep`, `annotations` | `onAdvanceStep`, `onCopyFormula` |
| Gradient Descent Surface | `GradientSurfacePanel` | `learningRate`, `stepIndex`, `totalSteps`, `cameraPreset` | `onLearningRateChange`, `onStepSelect`, `onCameraPresetChange` |
| Housing Training | `TrainingDashboard` | `trainResults`, `residuals`, `normalizationModes` | `onNormalizationChange` |
| Matrix Efficiency | `MatrixBenchmark` | `benchmarks`, `matrixSize`, `caption` | `onRunBenchmark` (executes worker) |
| GPU Demo | `GPUAcceleration` | `cpuResult`, `gpuResult`, `deviceSupport` | warns if no WebGPU |
| LangGraph Overview | `AgentGraph` | `nodes`, `edges`, `legend`, `caption` | Node focus states |
| Studio Trace CTA | `LangGraphStudioLink` | `traceIds`, `description` | Launches Studio replay |
| Pendulum Sandbox | `PendulumLoop` | `experimentState`, `noiseSigma`, `bestFit`, `controls` | `onExperimentSubmit` |
| Future Outlook | `FutureTrajectories` | `trajectories[]`, `timeHorizon`, `caption` | Cards animate into view |
| Presenter Notes | `PresenterToggle` | `notes` | Keyboard accessible toggle |

All components accept `caption` with the “What to look for” callout. Presenter mode reveals supplementary notes and tips.

## 5. Data & Simulation Specifications

### Housing Dataset
- Generator uses `numpy.random.default_rng(seed)` for determinism.
- Features: `sq_ft`, `bedrooms`, `distance_to_center`, optional `year_built` (normalized). Prices computed via `price = base + w1 * sq_ft + w2 * bedrooms + w3 * distance_factor + interaction (sq_ft * (1 / distance)) + seasonal term sin(year_built/π)` plus log-normal noise.
- Controls: sample size slider, normalization toggle (none/z-score/min-max), outlier injection knob.
- Storage: versioned JSON in `content/data/housing_v1.json`; regeneration script in shared library.

### Scaling Laws
- Predefined exponents α, β, γ sampled from curated list. Generate log-spaced grids for parameters N (model size), D (dataset), C (compute).
- Provide baseline curve and noisy variant; export as JSON arrays with metadata for units.

### Machine Learning Foundations
- In-browser gradient descent with mini-batches, optional momentum. Worker-based computation to avoid UI blocking. Training records (loss curves, residuals, epoch stats) stored in JSON.

### Matrix Efficiency
- Benchmark uses fixed matrices (e.g., 512×512) generated from seed. Compare naive loop vs vectorized vs GPU; throttle iterations for mobile.

### Pendulum Simulator
- Physical model: `T = 2π√(L/g)` with g = 9.81. Add Gaussian noise at 2% standard deviation. Agent chooses lengths; results stored per trial.
- Fitting methods: gradient descent over k,p; grid search fallback to show convergence.
- Visualization expects timeline of experiments, scatter of measured T vs L, contour plot of loss surface.

## 6. Presentation Delivery Enablement

- **Presenter Mode**: Toggle reveals slide-style bullet overlays, speaker notes, and high-contrast pointer.
- **Layout**: Fullscreen sections with keyboard navigation, optional auto-scroll sequence for timed presentations.
- **Snapshots**: Each visualization can freeze current state for screenshot quick saves. Provide export to PNG/SVG.
- **Hardware Mode**: Low-latency view optimized for external displays; ensures animations remain smooth at 60 fps on modern laptops.
- **Offline Prep**: Static JSON data cached via service worker; fallback static charts shipped for low-connectivity venues.
- **Control Surface**: Optional remote (mobile) interface to trigger section transitions or simulations.

## 7. UX, Motion & Design System Guidelines

### Design Language
- **Theme**: Cinematic dark UI with neon accents evoking cutting-edge AI labs.
- **Primary Colors**: `#0F1115` (background), `#1B1F27` (surface), `#23E6FF` (accent), `#FF2FB9` (highlight), `#FFC857` (attention), neutral ramp `#F5F7FA` → `#3B404C`.
- **Typography**: Inter variable for body (16px base), Space Grotesk for headings (tight kerning), Fira Code for inline math/code. Math typesetting inherits accent colors for emphasis.
- **Grid**: 4px base spacing; max content width 1200px; fluid gutters using CSS clamp. Section transitions use overlapping diagonals for depth.
- **Imagery**: Soft glows, gradient meshes (cyan→magenta), line-drawing overlays for math diagrams.

### Motion System
- Presets: `fadeSlide` (opacity + 24px translate, 0.18s), `scalePop` (scale from 0.96, 0.2s, cubic-bezier 0.16,1,0.3,1), `parallax` (scroll-linked, GPU-accelerated), `dataPulse` for key metrics.
- Reduce motion respect: toggle disables parallax, shortens durations to 0.05s.
- Timeline uses GSAP ScrollTrigger with pinned panels; neural network flows animate particle streams along edges.

### Component Styling
- Cards: glassmorphism with low-opacity backgrounds, neon border glow on focus.
- Buttons: dual-tone gradient fill, strong focus halo.
- Charts: colorblind-friendly palette (CVD-safe blues/purples), heavy weights for critical lines, subtle motion for live updates.
- Captions: `What to look for` label in uppercase amber micro text.

## 8. Accessibility & SEO Plan

- Semantic layout with `<main>`, `<section>`, `<nav>` landmarks; skip links and sticky focus indicator.
- Keyboard navigable timeline and sliders; ARIA labels describing actions; roving `tabIndex` for card galleries.
- Reduced motion + high-contrast mode toggles persisted in local storage.
- Provide descriptive alt text for images and transcripts for animations.
- SEO: dynamic OpenGraph (per section), JSON-LD Article schema, canonical tags, sitemap generation via Next.js. Preload key fonts, serve responsive images, ensure meta descriptions per section.

## 9. Testing & QA Plan

- **Unit Tests**: Jest + React Testing Library for components (props, accessibility roles, state transitions).
- **Integration Tests**: Playwright scenarios covering timeline navigation, training simulations, pendulum experiments.
- **Visual Regression**: Chromatic/Storybook for component states with design tokens.
- **Performance**: Lighthouse CI (mobile/desktop), WebPageTest spot checks, browser profiler sessions for animation heavy pages.
- **Data Validation**: JSON schema checks for generated datasets; property-based tests for generator edge cases.
- **Accessibility Audits**: axe-core automated checks + manual screen reader testing (NVDA/VoiceOver).
- **Presenter Dry Runs**: Scripted rehearsals verifying flow, remote control, and offline fallbacks.

## 10. Milestones & Timeline (Risks & Mitigation)

1. **Week 1 – Discovery & Design Language**
   - Deliver mood boards, color/type tokens, IA confirmation.
   - *Risk*: Misaligned aesthetic → *Mitigation*: Early stakeholder review.
2. **Week 2 – Core Infrastructure & Scaffolding**
   - Next.js setup, Contentlayer, global theming, live demo controls scaffold, agenda hub layout, notebook repo bootstrap with nbconvert smoke test wiring.
   - *Risk*: Tech debt from rushed setup → *Mitigation*: lint/type rules from day one.
3. **Week 3 – Chapter Routes: History & Machine Learning Foundations**
   - Implement dedicated `/history` and `/neural` pages with timelines, scaling laws, network anatomy, derivative walk-through, and loss visualizations; wire agenda navigation and notebook CTAs.
   - *Risk*: Performance of animations → *Mitigation*: memoize, offload to workers; formula readability on stage → use responsive KaTeX sizing tests.
4. **Week 4 – Housing Training & Simulations**
   - Finalize data generators, training dashboards, matrix benchmarks, and reinforce neural chapter storyline from regression primer through gradient descent. Polish notebook overlays and modal previews.
   - *Risk*: Inconsistent outputs → *Mitigation*: deterministic seeds + regression tests.
5. **Week 5 – AI Agents Chapter & Pendulum Sandbox**
   - Build `/agents` route with LangGraph visuals, experiment loop, OpenAI-backed reasoning stream with prompt logging, future outlook cards, and LangGraph Studio trace CTAs.
   - *Risk*: Complexity of sandbox UI + LLM hallucinations → *Mitigation*: iterative usability testing and automated formula reconciliation before display.
6. **Week 6 – Polish, QA, Launch Prep**
   - Accessibility, SEO, performance tuning, end-to-end rehearsals, deployment rehearsal.
   - *Risk*: Last-minute content changes → *Mitigation*: content freeze mid-week.

## 11. Acceptance Criteria Checklist

- Tech stack implemented per plan (Next.js, MDX, animation toolkit) with deterministic data sources.
- All sections live, interactive, and controllable during the talk with live mode controls.
- Visualizations include captions, notes, and accessible fallbacks; animations run smoothly at target frame rates.
- Data/simulation outputs reproducible with seed-based generators; CPU/GPU demos provide appropriate fallbacks.
- Mathematical expressions render crisply in light/dark modes, support scaling for projector use, and expose copy-to-clipboard helpers.
- Lighthouse scores ≥ 90 (performance/accessibility/best-practices/SEO) on reference hardware.
- Automated test suite (unit, integration, visual, accessibility) green in CI.
- Deployment pipeline functional with documented steps for future updates.

## 12. Progress Snapshot (Current)

- Next.js 14 project scaffolded under `presentation-site/` using TypeScript, TailwindCSS, and ESLint.
- Global design tokens, typography, and motion-friendly styles applied in `src/app/globals.css` with Google font wiring in `src/app/layout.tsx`.
- Agenda-driven navigation, notebook resource library (`/notebooks`), and LangGraph reasoning API are partially implemented; chapter routes are queued next per the revised flow.
- Baseline linting executed (`npm run lint`) to confirm a clean starting point for further development.
- KaTeX-based inline math rendering wired up for the scaling law narrative, ensuring formulas present cleanly during demos.
- Component scaffolding established (`src/components/**`) for agenda, history timeline, neural highlight grid, and agent section, backed by typed data modules in `src/lib`.
- Data utilities implemented (`src/lib/housing.ts`, `src/lib/scaling.ts`, `src/lib/pendulum.ts`) for deterministic housing samples, scaling-law curves, and pendulum trials with fitting helpers.
- Interactive datasets and charts operate without a separate control overlay; UI toggles are embedded directly in each component for on-the-spot exploration.
- Housing dataset preview and scaling law card are wired into the page (`src/components/neural/HousingDatasetPreview.tsx`, `src/components/history/ScalingLawCard.tsx`) consuming the shared lib data while remaining consistent between the site and notebooks.
- Housing dataset preview now renders a Plotly scatter with regression overlays (`src/components/neural/HousingDatasetPreview.tsx`) and the scaling law chapter includes expanded historical context, scaling-law interpretation guidance, and follow-up prompts (`src/app/history/page.tsx`, `src/components/history/ScalingLawCard.tsx`).
- Pendulum sandbox stub created (`src/components/agents/PendulumSandbox.tsx`) to showcase experiment queues and fitted parameters using the new data utilities.
- Pendulum sandbox now renders a loss-surface preview, noise controls, and an LLM reasoning stream aligned with LangGraph Studio handoffs, plus an enriched "Future trajectories & discussion" section for post-talk conversations (`src/app/agents/page.tsx`).
- Pendulum sandbox exposes a reasoning transcript API (`/api/reasoning/pendulum`) and syncs the on-page stream with notebook consumers.
- Chapter messaging now targets attendees directly; rehearsal-only overlays were replaced with public follow-up notes embedded in each chapter page.
- Plotly-based gradient surface primer component (`src/components/neural/GradientSurfacePanel.tsx`) added with interactive learning-rate and step sliders matching notebook controls.
- Machine learning training controller now broadcasts run metadata to the gradient surface via Zustand (`src/store/gradientSurfaceStore.ts`), keeping the 3D path in sync with live demos, enabling multi-run overlays, and capturing annotation context for later review.

### Next Implementation Targets (Tomorrow)

1. Stand up dedicated `/history`, `/policies`, `/neural`, and `/agents` routes with shared chapter shell, hooked to the agenda hub.
2. Integrate the updated machine learning storyline components (anatomy primer, derivative stepper, gradient surface) into `/neural` with clear checkpoints for both live narration and async review.
3. Layer LangGraph Studio trace CTAs and reasoning stream recorder into `/agents`, ensuring notebook + studio handoff parity.
4. Launch modal-based notebook previewer tied to agenda cards and chapter sidebars, verifying nbconvert exports stay in sync.
