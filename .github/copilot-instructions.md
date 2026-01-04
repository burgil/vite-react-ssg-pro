````instructions
# Vite React SSG Pro - GitHub Copilot Instructions

**Project Overview**: Highly optimized Vite + React starter template with SSG (Static Site Generation) capabilities, achieving **100 mobile / 100 desktop** PageSpeed Insights scores. This template is a static site generator (SSG) and does not provide runtime SSR (server-side rendering).

## Tech Stack
- **Framework**: Vite 7 + React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS 4 (via @tailwindcss/vite)
- **Router**: React Router v7
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **Build**: Terser, Lightning CSS, Beasties (critical CSS)
- **SSG**: Prerendering with Happy-DOM for static HTML output (no runtime SSR)

## Structure
- **Pages**: `src/pages/` - Route pages (home.tsx, about.tsx)
- **Components**: `src/components/` - Reusable UI components
- **Router**: `src/Router.tsx` - Route definitions with lazy loading
- **Layout**: `src/Layout.tsx` - Suspense wrapper + SEO (prerenderer handles SSG/static semantics)
- **SEO**: `seo.json` - Metadata for all routes
- **Scripts**: `scripts/` - Prerender and OG image generation
- **Docs**: `docs/` - Comprehensive guides (optimize.md, suspense-guide.md, etc.)

## Key Commands
```bash
pnpm dev              # Start dev server (with warmup)
pnpm build            # Full build: lint  core:build  og-screenshots
pnpm core:build       # Build + prerender (no OG screenshots)
pnpm prerender        # Regenerate SSR/SSG HTML with critical CSS
pnpm og-screenshots   # Generate OG images from live pages
pnpm analyze          # Build with bundle analyzer
pnpm lint             # ESLint + TypeScript + Knip
pnpm preview          # Preview production build
```

## Performance Features

### 1. Critical CSS Extraction (Beasties)
- Inlines 40-50 KB of critical CSS directly into HTML
- Prunes external CSS to < 1 KB
- Configuration in `vite.config.ts`

### 2. Code Splitting
- Vendor chunks: `react-vendor`, `framer-motion`, `lucide-icons`, `react-icons`
- Lazy-loading for Navbar and below-the-fold components

### 3. Terser Minification
- 3-pass compression, drops console.log in production
- Aggressive mangling with `toplevel: true`

### 4. Font Optimization
- `font-display: optional` for zero CLS
- Async loading via `media="print"` + `onload`

### 5. SSG (Static Site Generation)
- All routes prerendered to static HTML (no runtime SSR)
- SEO metadata from `seo.json`
- Auto-generates `sitemap.xml` and `robots.txt`

## Adding Routes

1. **Create page** in `src/pages/<name>.tsx`:
   ```tsx
   import { type FC } from 'react';
   
   const PageName: FC = () => (
     <div className="container mx-auto px-4 py-8">
       <h1>Page Title</h1>
     </div>
   );
   
   export default PageName;
   ```

2. **Add route** in `src/Router.tsx`:
   ```tsx
   const PageName = lazy(() => import('./pages/pagename'));
   <Route path="/pagename" element={<PageName />} />
   ```

3. **Add SEO metadata** in `seo.json`:
   ```json
   "/pagename": {
     "title": "Page Title | Your Site",
     "description": "Page description",
     "canonical": "https://yoursite.com/pagename",
     "ogType": "website",
     "ogImage": "/images/og/og-pagename.webp",
     "twitterCard": "summary_large_image",
     "sitemap": { "changefreq": "weekly", "priority": 0.8 }
   }
   ```

4. **Rebuild**: `pnpm core:build`

## React Suspense Patterns

### Lazy-Load Below-the-Fold
```tsx
const Footer = lazy(() => import('./Footer'));

<Suspense fallback={<div className="h-20" />}>
  <Footer />
</Suspense>
```

### Suspense (from Layout.tsx)
```tsx
// Suspend boundaries are handled automatically during SSG prerendering; use Suspense
// without manual isSSR checks.
return <Suspense fallback={<LoadingScreen />}>{content}</Suspense>;
```

**See `docs/suspense-guide.md` for comprehensive examples.**

## Configuration Customization

### vite.config.ts - PROJECT_CONFIG
All optimization settings are in the `PROJECT_CONFIG` object at the top of `vite.config.ts`:

```typescript
const PROJECT_CONFIG = {
  warmupFiles: ['./src/main.tsx', './src/Router.tsx', './src/pages/home.tsx'],
  vendorChunks: { react: ['react', 'react-dom', 'react-router'], ... },
  beastiesConfig: { minimumExternalSize: 5000, ... },
  terserConfig: { passes: 3, dropConsole: true, ... }
};
```

**To customize:** Edit `PROJECT_CONFIG` in `vite.config.ts` - see `docs/optimize.md` for details

## OG Image Generation

### Requirements
```bash
pip install -r scripts/requirements.txt
playwright install
```

### Usage
```bash
pnpm og-screenshots  # Generate missing OG images
python scripts/generate_og_screenshots.py --port 4173 --seo seo.json --cleanup
```

**See `scripts/README_generate_og.md` for details.**

## Template Guidelines
- **Keep it generic**: No product-specific content
- **Use examples**: Show lucide-react, react-icons, framer-motion
- **Stay minimal**: Simple, clean code that's easy to understand
- **Social links**: GitHub (https://github.com/burgil) and YouTube (https://youtube.com/@GenZv1Dev)

## Best Practices

###  DO
- Lazy-load below-the-fold components
- Use sized fallbacks in Suspense (prevent layout shift)
- Add all routes to `seo.json`
- Run `pnpm build` before deploying
- Use `@` alias: `import X from '@/components/X'`

###  DON'T
- Don't lazy-load above-the-fold content
- Don't use empty Suspense fallbacks
- Don't skip SEO metadata
- Don't use `startTransition` in `main.tsx` (breaks SSR/SSG)

## Documentation
- **`docs/optimize.md`** - Full optimization guide
- **`docs/suspense-guide.md`** - Suspense patterns and examples
- **`docs/getting-started.md`** - Quick start guide
- **`docs/seo-guide.md`** - SEO configuration

## Installation

```bash
npx github:burgil/vite-react-ssg-pro my-project
# or
npm create burgil-app my-project
```

## Performance Targets
- **Mobile**: 100
- **Desktop**: 100
- **LCP**: < 2.5s
- **CLS**: 0
- **FCP**: < 1.8s

## Notes
- ErrorBoundary wraps the entire app
- `@` alias resolves to `src/`
- SSR detection flag: `window.__SSR__` (set by prerender script) - but you no longer need to use it to guard Suspense boundaries
- Beasties runs twice: Vite build + prerender
- All optimizations configurable via `vite.config.ts`

## Avoid cursed strings

```
� -> '
� -> "
� -> "
� -> -
� -> -
� -> ...
```

## UI/UX Guidelines

- See `../docs/ui-ux-guidelines.md` for the design system, component guidelines, and accessibility checklist.

````
