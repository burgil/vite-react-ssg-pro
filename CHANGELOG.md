# Changelog

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