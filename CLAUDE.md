# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 presentation website for a Tech Talk AI session, combining live stage presentations with synchronized Jupyter notebooks and interactive ML demonstrations. The site features four main chapters: History of AI, AI Policy & Governance, Machine Learning Foundations, and AI Agents & Discovery Loop.

**Presenters:** Filip Frano (history/policy), Daniel Huber (ML foundations/agents)

## Development Commands

All commands must be run from the `presentation-site/` directory:

```bash
cd presentation-site
npm install              # Install dependencies
npm run dev             # Start dev server (Turbopack) on localhost:3000
npm run build           # Production build with Turbopack
npm run start           # Serve production build locally
npm run lint            # Run ESLint
npm run notebooks:export # Execute Jupyter notebooks and regenerate HTML previews
```

### Working with Jupyter Notebooks

Notebooks are located in `presentation-site/maschine learning foundations content/`:
- `0_discovery_compound_interest.ipynb` - Autonomous AI discovery demo
- `1_Model_Representation.ipynb` - Linear regression model introduction
- `2_Cost_function.ipynb` - Cost function with interactive 3D surfaces
- `3_Gradient_Descent.ipynb` - Gradient descent training visualization
- `4_Neuronal_Networks.ipynb` - Neural network vs linear model comparison
- `5_transformers.ipynb` - Transformer architecture outline

Supporting Python utilities: `lab_utils_common.py`, `lab_utils_uni.py`, `lab_neurons_utils.py`

To run notebooks locally:
```bash
cd "presentation-site/maschine learning foundations content"
jupyter lab  # Opens on localhost:8888
```

## Architecture

### Routing Structure

- `/` - Landing page with agenda hub
- `/history` - AI history timeline and scaling laws
- `/policies` - AI policy and governance frameworks
- `/neural` - Machine learning foundations (main interactive chapter)
- `/agents` - LangGraph agents and pendulum sandbox
- `/notebooks` - Jupyter notebook library hub

### State Management

**Zustand Store:** `src/store/gradientSurfaceStore.ts`
- Manages gradient descent visualization snapshots across the neural chapter
- Stores descent paths from training runs for comparison
- Supports up to 5 snapshots, 12 annotations
- Shared between `NeuralTrainingController` and `GradientSurfacePanel`

**Key Pattern:** Components that generate gradient descent paths (like training controllers) push snapshots to the store, while visualization panels (like 3D surface plotters) subscribe to display them.

### Content Configuration

**Single Source of Truth:** `src/lib/sections.ts`
- Defines all chapters, sections, notebook links, and presenters
- Export `chapters` array for routing and navigation
- Type-safe chapter definitions with `ChapterDefinition` type
- Use `getChapterDefinition(id)` to retrieve specific chapters

### Component Organization

**Chapter Pages:** Each chapter page uses `ChapterLayout` wrapper and imports specialized sections:
- `history/` - TimelineSection, ScalingLawCard
- `policies/` - (no specialized components yet)
- `neural/` - 20+ interactive components (main interactive chapter)
- `agents/` - AgentsSection, PendulumSandbox

**Neural Components Architecture:**
The `/neural` chapter is the most complex with three tiers:
1. **High-level sections:** `DiscoveryDemoSection`, `NeuralNetworkTransition`, `TransformersPreview`
2. **Interactive panels:** `GradientSurfacePanel`, `NeuralAnatomyPanel`, `DerivativeStepper`, `HousingDatasetPreview`
3. **Shared controls:** `VCRControls`, `ParameterSlider`, `ViewModeButtons` (in `neural/shared/`)

**Notebook Integration:**
- `NotebookLaunch` (global) - Generic notebook launcher with preview/download
- `NotebookLauncher` (neural-specific) - Section-specific launcher with Jupyter Lab integration

### Presentation Flow Integration

The website is designed for hybrid presentation delivery:
1. Present on-stage visuals from chapter pages (`/neural`, `/agents`, etc.)
2. Click "Launch Notebook" buttons to open Jupyter Lab
3. Return to website without losing context
4. Attendees can revisit the same flow post-presentation

**Critical Detail:** Jupyter Lab must be running on `localhost:8888` for "Launch Notebook" buttons to work. The buttons construct URLs like `http://localhost:8888/lab/tree/...`

### Data Flow Libraries

**Training Simulations:** `src/lib/trainingSimulation.ts`
- Contains gradient descent algorithms
- Generates training paths for housing regression
- Used by `NeuralTrainingController` to run live demos

**Gradient Surface Math:** `src/lib/gradientSurface.ts`
- Computes 3D cost surface meshes for Plotly
- Defines `GradientSurfacePoint` type
- Calculates loss landscapes (MSE bowls)

**Scaling Laws:** `src/lib/scaling.ts`
- Power law formulas for AI history chapter
- Compute vs performance curves

**Timeline Data:** `src/lib/timeline.ts`
- Historical AI milestones
- Event definitions for history chapter

**Housing Dataset:** `src/lib/housing.ts`
- Synthetic housing price data generation
- Normalization utilities

**Pendulum Physics:** `src/lib/pendulum.ts`
- Pendulum period calculations for agent sandbox
- Physics simulation for LangGraph experiments

**Notebooks Metadata:** `src/lib/notebooks.ts`
- Notebook catalog and routing info

## Key Dependencies

- **Next.js 15** with App Router and Turbopack
- **React 19** with Server Components
- **Tailwind CSS 4** for styling (uses CSS variables for theming)
- **Zustand** for state management
- **Plotly.js** (`react-plotly.js`, `plotly.js-dist-min`) for 3D visualizations
- **KaTeX** (`@matejmazur/react-katex`, `react-katex`) for math typesetting
- **TypeScript 5** throughout

## Styling Conventions

- Custom CSS variables defined in `src/app/globals.css`:
  - `--color-bg-primary`, `--color-text-primary`, etc.
  - `--max-width` for content containers
- Tailwind utilities with `clamp()` for responsive typography
- Glass morphism panels using `glass-panel` class
- Glow effects with `glow-ring` class

## Important Patterns

### Math Rendering
Use `MathCopyBlock` component (`src/components/ui/MathCopyBlock.tsx`) for copyable LaTeX formulas with proper styling.

### Full-Screen Modals
Use `FullScreenCard` component (`src/components/ui/FullScreenCard.tsx`) for immersive visualizations that need to break out of chapter flow.

### Presentation-Friendly Design
- High contrast for projector visibility
- Large interactive hit targets
- Clear visual hierarchy
- Animations respect `prefers-reduced-motion`

## Working with Notebooks

**Export workflow:**
1. Update `.ipynb` source files in `maschine learning foundations content/`
2. Run `npm run notebooks:export` to regenerate HTML previews
3. HTML files go to `presentation-site/public/notebooks/`
4. Website links to both HTML previews and `.ipynb` downloads

**Important:** Never commit API keys or secrets in notebooks. The `.gitignore` already excludes `.ipynb_checkpoints/` to prevent this.

## Testing During Development

**For live presentation rehearsal:**
1. Start Jupyter Lab: `cd "presentation-site/maschine learning foundations content" && jupyter lab`
2. Start Next.js dev server: `cd presentation-site && npm run dev`
3. Navigate to http://localhost:3000/neural
4. Pre-run notebook 0 (`0_discovery_compound_interest.ipynb`) completely before presenting
5. Keep other notebooks ready but not executed

**Browser setup:**
- Zoom at 125% for projector visibility
- Dual screen: website on one, Jupyter on other
- Or use Alt+Tab to switch between localhost:3000 and localhost:8888

## Content Updates

When updating chapter content or structure:
1. Edit `src/lib/sections.ts` to update metadata
2. Modify corresponding page component in `src/app/{chapter}/page.tsx`
3. Update or create components in `src/components/{chapter}/`
4. If notebooks change, update the exported HTML with `npm run notebooks:export`
5. Verify both the website and notebook flows still sync

## API Routes

`src/app/api/reasoning/pendulum/route.ts` - Server-side pendulum physics calculations for the agents chapter sandbox. Accepts experiment parameters and returns computed results.

## Common Gotchas

- **Notebook paths:** The directory name is `maschine learning foundations content` (typo intentional in original structure)
- **Jupyter integration:** "Launch Notebook" buttons assume Jupyter Lab runs on port 8888
- **Zustand store:** Gradient descent snapshots are limited to 5 to prevent memory issues during long presentations
- **Plotly bundle size:** The full Plotly bundle is large; components lazy-load where possible
- **Static export:** Some dynamic features (like API routes) won't work with `next export`
