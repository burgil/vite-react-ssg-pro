# Changelog

## [1.5.0] - 2026-01-05

### Accessibility
- Added `aria-label` to buttons and links in `Navbar` and `Footer` components for better screen reader support.
- Improved color contrast in `Hero` and `Features` components (updated text colors to lighter shades for dark mode).
- Fixed heading hierarchy in `Hero` component (changed feature cards from `h3` to `h2`).

### Fixed
- Resolved `ENOENT` error during `vite build` by disabling `vite-plugin-beasties` in the main build step (it is handled correctly in the prerender step).
- Fixed CSS pruning issue by setting `pruneSource: false` in `vite.config.ts` and `prerender.ts` to prevent missing styles in shared CSS files.
- Resolved "Double CSS Loading" issue where CSS was being loaded twice (once inlined by Beasties, and once via `<link rel="stylesheet">` or `<link rel="modulepreload">`).
- Updated `scripts/prerender.ts` to explicitly exclude `.css` files from `modulepreload` injection.
- Fixed `scripts/prerender.ts` regex logic to correctly identify and remove CSS links when inlining.

### Performance
- Reduced bundle size by implementing `LazyMotion` with `domAnimation` from `framer-motion` (~38% reduction in motion chunk size).
- Removed unused fonts (`JetBrains Mono`, `Outfit`) from `index.html` and `index.css` to improve load performance.
- Optimized chunk splitting in `vite.config.ts` by separating `react-router`, `react`, and `react-dom` into individual vendor chunks for better cache isolation and diagnostic clarity.
- Refined manual chunk splitting logic to use exact package matching and explicitly grouped `scheduler` with `react-dom` for better caching and bundle efficiency.
- Replaced `hydrateRoot` with `createRoot` in `src/main.tsx` to resolve persistent hydration mismatch errors (#418) caused by critical CSS inlining and third-party component DOM manipulation.
- Implemented intelligent module preloading in `scripts/prerender.ts` to inject `<link rel="modulepreload">` tags for lazy-loaded route chunks.
- Removed redundant `vite-plugin-compression` dependency (compression is handled by `scripts/compress.ts`).
- **CSS Optimization**: Implemented "Smart Inlining" strategy - if an external CSS file is small (< 50KB), it is fully inlined into the HTML, eliminating the network request entirely.

### Changed
- Updated `upload` script in `package.json` to use `wrangler` directly instead of `npx`, resolving npm environment configuration warnings.
- Added `depcheck` to `devDependencies` and the `lint` script to detect unused dependencies.
- Updated `Hero` and `Navbar` components to distinguish between "Free Version" (GitHub) and "Pro Version" (Payhip) links.
- Updated social links to point to the correct YouTube channel (`GenZv1Dev`).
- Replaced deprecated `Github` icon from `lucide-react` with `FaGithub` from `react-icons/fa` in `Hero` component.
- Updated `scripts/compress.ts` to exclude `robots.txt` and the `.vite` directory from compression to avoid processing unnecessary files.
- Removed legacy Vite manifest fallback from `scripts/prerender.ts` (now strictly supports Vite 5+ manifest structure).

### Known Limitations
- **"Unused JavaScript" Diagnostic (~22KB in `react-dom`)**: Lighthouse reports ~22KB of unused JavaScript in `react-dom`. This is a false positive inherent to React's architecture. The "unused" code consists of React's Synthetic Event System and Fiber Reconciler, which are loaded but not immediately executed during Lighthouse's trace window. These systems are required for React to handle user interactions and cannot be tree-shaken. This is the expected "tax" of using React and is present in all React applications.

## [1.4.0] - 2025-12-29

### Changed
- Removed `@react-scan/vite-plugin-react-scan` dependency from package.json and lockfile
- Improved TypeScript configuration with better exclude patterns and updated compiler options
- Fixed bundle analyzer output path from `dist/stats.html` to `stats.html`
- Updated documentation to reflect correct bundle analyzer file location

### Removed
- React Scan development plugin and related dependencies

## [1.3.0] - 2025-12-28

### Changed
- Updated dependencies for ESLint and added unrs-resolver
- Added `eslint-import-resolver-typescript` and `eslint-plugin-import` to package.json
- Updated pnpm-lock.yaml with new dependencies and their resolutions
- Included `unrs-resolver` in pnpm-workspace.yaml for workspace management

## [1.2.0] - 2025-12-28

### Added
- SEO configuration file (`src/seo.json`) with global and page-specific metadata for Vite React SSG Pro, including Open Graph, Twitter Card, and Schema.org support.
- README note about hidden files in `.vscode/settings.json` to help users find important config/scripts.

### Changed
- Moved `seo.json` to `src/seo.json` for better organization and import support.
- Updated all code, scripts, and documentation to reference `src/seo.json` instead of the project root.
- Updated OG image and sitemap generation scripts to use the new path.
- Updated OG image generator to avoid requiring preview if not needed.
- Improved `.vscode/settings.json` to show important files (such as `seo.json`, scripts, and configuration files) that were previously hidden, improving quality of life for development and editing.
- Updated README and changelog to reflect these changes.

### Fixed
- Ensured all SEO metadata is injected at build time for every route, improving SSG output and SEO consistency.
- Corrected outdated tailwind class names for linear gradient in footer component

## [1.1.0] - 2025-12-28

### Changed
- Clarified that this template is a Static Site Generator (SSG) and not a runtime SSR solution. Updated documentation and instructions to emphasize SSG/static output and correct any misleading SSR/SSG references.
- Added instructions to the README for updating dependencies using `pnpm upgrade --latest`.

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-12-27

### Added
- Open Graph images for Home, About, and Suspense pages.

### Changed
- Updated project dependencies.

### Fixed
- Missing top padding in the suspense example.

## [1.0.0] - 2025-12-27

### Initial Release

Production-ready Vite + React 19 template with SSG capabilities achieving 100/100 PageSpeed scores.

#### Core Features
- **Vite 7** + **React 19** + **TypeScript 5.9** foundation
- **Tailwind CSS 4** via @tailwindcss/vite plugin
- **React Router v7** with lazy loading and code splitting
- **Framer Motion** for smooth animations
- **Lucide React** + **React Icons** for comprehensive icon support

#### Performance Pipeline
- **Beasties** critical CSS inlining (40-50KB inline, <1KB external)
- **Terser** 3-pass minification with aggressive mangling
- **Happy-DOM** SSR/SSG prerendering engine
- **Dual compression** (gzip + brotli) for all assets
- **Font optimization** with font-display: optional (zero CLS)
- **Auto-generated** sitemap.xml, robots.txt, OG images

#### Developer Experience
- **VS Code** workspace settings + recommended extensions
- **ESLint 9** + **TypeScript ESLint** configuration
- **Knip** dead code detection
- **React Scan** performance profiling integration
- **Bundle analyzer** via rollup-plugin-visualizer

#### AI Agent Support
- `.agent/rules/instructions.md` - 450 lines of context for Cursor, Antigravity
- `.github/copilot-instructions.md` - GitHub Copilot instructions
- Pre-configured workspace for AI-assisted development

#### Components Included
- Hero, Navbar, Footer, Features
- ErrorBoundary (comprehensive error handling)
- LoadingScreen, PageHeader, SEOTitle
- SuspenseExample page (React Suspense patterns demo)

#### Documentation
- Getting Started guide
- Architecture overview
- SEO configuration guide
- Performance optimization guide
- React Suspense patterns guide
- Deployment guide (Cloudflare, Vercel, Netlify)
- UI/UX guidelines
- Customization guide

#### Deployment
- One-command Cloudflare Pages deploy (`pnpm upload`)
- Vercel/Netlify ready
- GitHub Pages compatible
- Any static hosting supported

---

**Commercial License** - Use in unlimited commercial projects, closed-source allowed, no attribution required.