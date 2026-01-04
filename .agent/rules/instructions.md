---
trigger: always_on
---

# Vite React SSG Pro - AI Agent Instructions

## Project Overview
This is a highly optimized Vite + React starter template with SSG capabilities, designed for production use. It achieves **100 mobile / 100 desktop** PageSpeed Insights scores out of the box.

---

## Tech Stack
- **Framework**: Vite 7 + React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS 4 (via @tailwindcss/vite)
- **Router**: React Router v7
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **Build Tools**: Terser, Lightning CSS, Beasties (critical CSS)
- **SSR**: Happy-DOM for server-side rendering

---

## Project Structure
```
src/
├── pages/           # Route pages (home.tsx, about.tsx)
├── components/      # Reusable UI components
├── Router.tsx       # Route definitions with lazy loading
├── Layout.tsx       # Suspense wrapper + SEO (prerenderer handles SSR/SSG semantics)
├── main.tsx         # App entry point
└── index.css        # Global styles

scripts/
├── prerender.ts                 # SSR/SSG prerendering with critical CSS (SSG)
├── generate_og_screenshots.py   # OG image generation
├── README_generate_og.md        # OG script documentation
└── requirements.txt             # Python dependencies

docs/
├── optimize.md          # Performance optimization guide
├── suspense-guide.md    # React Suspense best practices
├── getting-started.md   # Quick start guide
├── customization.md     # Customization guide
├── deployment.md        # Deployment guide
├── performance.md       # Performance tips
└── seo-guide.md         # SEO configuration guide

seo.json                 # SEO metadata for all routes
vite.config.ts           # Vite configuration with optimizations
```

---

## Key Commands

### Development
```bash
pnpm dev              # Start dev server (with warmup)
pnpm preview          # Preview production build
```

### Building
```bash
pnpm build            # Full build: lint → core:build → og-screenshots
pnpm core:build       # Build + prerender (no OG screenshots)
pnpm prerender        # Regenerate SSR/SSG HTML with critical CSS
pnpm og-screenshots   # Generate OG images from live pages
pnpm analyze          # Build with bundle analyzer (opens stats.html)
```

### Linting
```bash
pnpm lint             # ESLint + TypeScript + Knip
```

---

## Performance Optimizations

### 1. **Critical CSS Extraction (Beasties)**
- Inlines above-the-fold CSS directly into HTML (~40-50 KB)
- Prunes external CSS to < 1 KB
- Two-stage processing: Vite build + manual prerender
- Configuration in `vite.config.ts`

### 2. **Code Splitting**
- Vendor chunks: `react-vendor`, `framer-motion`, `lucide-icons`, `react-icons`
- Manual chunk configuration in `vite.config.ts`
- Lazy-loading for Navbar and other below-the-fold components

### 3. **Terser Minification**
- 3-pass compression for maximum size reduction
- Drops `console.log` and `debugger` in production
- Aggressive mangling with `toplevel: true`

### 4. **Font Optimization**
- `font-display: optional` for zero CLS
- Async loading via `media="print"` + `onload="this.media='all'"`
- Preconnect to font origins

### 5. **Compression**
- Dual compression: gzip + brotli
- All assets have `.gz` and `.br` variants

### 6. **SSR/SSG (Server-Side Rendering / Static Site Generation)**
- All routes prerendered to static HTML
- SEO metadata from `seo.json`
- Automatic `sitemap.xml` and `robots.txt` generation

---

## Customization Points

### vite.config.ts - PROJECT_CONFIG

All optimization settings are centralized in the `PROJECT_CONFIG` object at the top of `vite.config.ts`:

```typescript
const PROJECT_CONFIG = {
  // Files to warmup during dev server start
  warmupFiles: [
    './src/main.tsx',
    './src/Router.tsx',
    './src/pages/home.tsx',
    './src/components/Hero.tsx',
  ],
  
  // Manual chunk splitting
  vendorChunks: {
    react: ['react', 'react-dom', 'react-router'],
    framerMotion: ['framer-motion'],
    lucideIcons: ['lucide-react'],
    reactIcons: ['react-icons'],
  },
  
  // Beasties (Critical CSS) config
  beastiesConfig: {
    minimumExternalSize: 5000,
    inlineThreshold: 0,
    pruneSource: true,
    mergeStylesheets: false,
    // ... more options
  },
  
  // Terser (Minification) config
  terserConfig: {
    passes: 3,
    dropConsole: true,
    dropDebugger: true,
    // ... more options
  }
};
```

**To customize:**
1. Edit `PROJECT_CONFIG.warmupFiles` - add critical routes for faster dev startup
2. Edit `PROJECT_CONFIG.vendorChunks` - adjust based on your dependencies
3. Edit `PROJECT_CONFIG.beastiesConfig` - control critical CSS extraction
4. Edit `PROJECT_CONFIG.terserConfig` - adjust minification aggressiveness

See `docs/optimize.md` for complete documentation.

---

## Adding New Routes

### Step-by-Step Process:

1. **Create page component** in `src/pages/<name>.tsx`:
   ```tsx
   import { type FC } from 'react';
   
   const PageName: FC = () => {
     return (
       <div className="container mx-auto px-4 py-8">
         <h1>Page Title</h1>
       </div>
     );
   };
   
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
     "sitemap": {
       "changefreq": "weekly",
       "priority": 0.8
     }
   }
   ```

4. **Update Navbar** (optional) in `src/components/Navbar.tsx`

5. **Rebuild** to prerender the new page:
   ```bash
   pnpm core:build
   ```

---

## React Suspense Usage

### Pattern 1: Lazy-Load Below-the-Fold
```tsx
const Footer = lazy(() => import('./Footer'));

<Suspense fallback={<div className="h-20" />}>
  <Footer />
</Suspense>
```

### Pattern 2: Suspense (Layout.tsx pattern)
```tsx
// The prerenderer handles Suspense during SSR/SSG; use Suspense normally
return (
  <Suspense fallback={<LoadingScreen />}>
    {content}
  </Suspense>
);
```

### Pattern 3: Sized Fallbacks (Prevent Layout Shift)
```tsx
<Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-800" />}>
  <HeavyChart />
</Suspense>
```

**See `docs/suspense-guide.md` for comprehensive examples.**

---

## SEO Configuration

### Global Settings (_global in seo.json)
```json
"_global": {
  "domain": "https://yoursite.com",
  "siteName": "Your Site",
  "defaultRobots": "index, follow",
  "logo": "/logo.webp",
  "social": {
    "twitter": "https://twitter.com/youraccount",
    "github": "https://github.com/youraccount"
  }
}
```

### Per-Route Settings
```json
"/route": {
  "title": "Page Title | Site Name",
  "description": "150-160 char description",
  "keywords": "keyword1, keyword2, keyword3",
  "canonical": "https://yoursite.com/route",
  "ogType": "website",
  "ogImage": "/images/og/og-route.webp",
  "twitterCard": "summary_large_image",
  "sitemap": {
    "changefreq": "weekly",
    "priority": 0.8,
    "lastmod": "2025-01-01"
  },
  "schema": {
    "breadcrumb": true,
    "organization": false,
    "website": false
  }
}
```

---

## OG Image Generation

### Requirements
```bash
pip install -r scripts/requirements.txt
playwright install
```

### Usage
```bash
# Generate missing OG images (default: port 4173)
pnpm og-screenshots

# Custom port (if dev server is on 5173)
python scripts/generate_og_screenshots.py --port 5173 --seo seo.json --cleanup

# Overwrite existing images
python scripts/generate_og_screenshots.py --port 4173 --seo seo.json --overwrite

# Dry run (see what would be deleted)
python scripts/generate_og_screenshots.py --port 4173 --seo seo.json --cleanup --dry-run
```

**See `scripts/README_generate_og.md` for detailed documentation.**

---

## Template Guidelines

### Keep It Generic
- No product-specific content
- Use placeholder text and examples
- Show best practices, not specific implementations

### Use Real Examples
- Demonstrate lucide-react icons
- Show framer-motion animations
- Include react-icons usage
- Example forms, cards, layouts

### Stay Minimal
- Simple, clean code
- Easy to understand and modify
- Well-commented for learning

### Social Links (Default)
- GitHub: https://github.com/burgil
- YouTube: https://youtube.com/@GenZv1Dev

---

## Best Practices

### ✅ DO
- Lazy-load below-the-fold components
- Use sized fallbacks in Suspense
- Add all routes to `seo.json`
- Run `pnpm build` before deploying
- Use `@` alias for imports: `import X from '@/components/X'`
- Check bundle size with `pnpm analyze`

### ❌ DON'T
- Don't lazy-load above-the-fold content
- Don't use empty Suspense fallbacks (causes layout shift)
- Don't skip SEO metadata in `seo.json`
- Don't use `startTransition` in `main.tsx` (breaks SSR/SSG hydration)
- Don't add CSS containment to Layout's main tag (blocks rendering)

---

## Debugging

### Build Issues
```bash
# Clear dist and rebuild
rm -rf dist
pnpm core:build
```

### CSS Not Loading
- Hard refresh: `Ctrl+Shift+R`
- Clear browser cache
- Check `dist/*.html` has inlined CSS (~40-50 KB)

### Prerender Errors
- Check `scripts/prerender.ts` for stack traces
- Verify all lazy imports in `Router.tsx` are valid
- Ensure all routes have SEO config in `seo.json`

### Bundle Analysis
```bash
ANALYZE=true pnpm core:build
# Opens stats.html in browser
```

---

## Performance Checklist

Before deployment, verify:
1. ✅ Run `pnpm build` successfully
2. ✅ All pages in `dist/` have inlined CSS (40-50 KB each)
3. ✅ `sitemap.xml` and `robots.txt` generated in `dist/`
4. ✅ Test on `pnpm preview` with hard refresh
5. ✅ Check PageSpeed Insights: https://pagespeed.web.dev/

**Expected scores:**
- Mobile: 100
- Desktop: 100
- LCP: < 2.5s
- CLS: 0
- FCP: < 1.8s

---

## References

### Documentation
- `docs/optimize.md` - Full optimization guide
- `docs/suspense-guide.md` - Suspense patterns and examples
- `docs/getting-started.md` - Quick start guide
- `docs/seo-guide.md` - SEO configuration

### External Resources
- [Beasties Documentation](https://github.com/danielroe/beasties)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Suspense Docs](https://react.dev/reference/react/Suspense)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

## Installation

This template is scaffolded via:

```bash
npx github:burgil/vite-react-ssg-pro my-project
# or
npm create burgil-app my-project
```

---

## Notes

- ErrorBoundary wraps the entire app for error handling
- `@` alias resolves to `src/` (configured in `vite.config.ts`)
- SSR detection flag: `window.__SSR__` (set by prerender script) - note: you don't need to use this flag to guard Suspense boundaries; the prerenderer handles SSR/SSG semantics
- Beasties runs twice: once during Vite build, once during prerender
- All optimizations are configurable via `vite.config.ts`

## Avoid cursed strings

```
’ -> '
“ -> "
” -> "
– -> -
— -> -
… -> ...
```

## UI/UX Guidelines

- See `../docs/ui-ux-guidelines.md` for the design system, component guidelines, and accessibility checklist.
