# Changelog

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

Production-ready Vite + React 19 template with SSR/SSG capabilities achieving 100/100 PageSpeed scores.

#### Core Features
- **Vite 7** + **React 19** + **TypeScript 5.9** foundation
- **Tailwind CSS 4** via @tailwindcss/vite plugin
- **React Router v7** with lazy loading and code splitting
- **Framer Motion** for smooth animations
- **Lucide React** + **React Icons** for comprehensive icon support

#### Performance Pipeline
- **Beasties** critical CSS inlining (40-50KB inline, <1KB external)
- **Terser** 3-pass minification with aggressive mangling
- **Happy-DOM** SSR prerendering engine
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
