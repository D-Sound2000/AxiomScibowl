# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Production build
npm run preview   # Preview production build
```

No test runner or linter is configured.

## Architecture

**AXIOM** is a React 18 + Vite app for analyzing Science Olympiad cheat sheets against test banks to identify topic coverage gaps.

### Application Flow

App.jsx drives a three-phase state machine:
1. **idle** — Hero section + UploadCard for file input
2. **processing** — ProcessingTerminal simulates analysis steps
3. **results** — ResultsDashboard renders coverage analysis

The `computeCoverage()` function in App.jsx is the core logic: it compares cheatsheet topic IDs against test bank entries to produce a coverage percentage, missing topics list, and per-event radar data. Currently runs against fixture data in `src/fixtures/`.

### Key Technologies

- **Framer Motion** — component-level animations
- **Three.js + GLSL** — animated WebGL background in `src/webgl/ShaderBackground.jsx`; shaders use FBM noise with mouse ripple effects; falls back to CSS pattern on `prefers-reduced-motion`
- **Tailwind CSS v4** — utility classes via `@tailwindcss/vite` plugin (no separate config file)
- **Custom hooks** — `useSpring.js` (spring physics), `usePointerVelocity.js` (mouse velocity for shader), `useTheme.js` (dark/light with localStorage + system preference)

### Styling

- Glassmorphism aesthetic with CSS variables for theming; `data-theme` attribute set on `<html>`
- Fonts: Space Grotesk (headings), JetBrains Mono (code/labels) loaded via Google Fonts in `index.html`
- CSS custom properties in `src/index.css` control colors, spacing tokens (`--gap-sm/md/lg`), and spring physics parameters

### Data Structures

Fixture files show the expected shapes:
- **Cheatsheet** (`src/fixtures/sample_cheatsheet_extracted.json`): `{ topics: [{ topicId, label, confidence }] }`
- **Test bank** (`src/fixtures/sample_testbank_response.json`): array of `{ topicId, eventTag, topicTitle, description, testId }`
