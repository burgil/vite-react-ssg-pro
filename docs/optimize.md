# Performance Optimization Guide

> **Note:** This template is a static site generator (SSG) and does not provide runtime SSR. All pages are prerendered to static HTML at build time.

## Overview
This template includes advanced performance optimizations to achieve **100 mobile / 100 desktop** PageSpeed Insights scores out of the box.

---

## 🎯 Target Performance Scores

| Metric | Target | How We Achieve It |
|--------|--------|-------------------|
| **Mobile** | 100 | Critical CSS inlining, Terser minification, font-display: optional |
| **Desktop** | 100 | Code splitting, compression (gzip + brotli), optimized chunks |
| **External CSS** | < 1 KB | Beasties prunes and inlines critical CSS |
| **Critical CSS Inlined** | 40-50 KB | Automated by Beasties during build |
| **CSS Render-Blocking** | ~0ms | Async font loading, critical CSS inline |
| **Forced Reflows** | 0ms | CSS containment on animated components |

---

## 📦 Build Configuration

All optimization settings are controlled via the `PROJECT_CONFIG` object in `vite.config.ts`.

### 🔧 Global Configuration (`vite.config.ts`)

At the top of `vite.config.ts`, you'll find the `PROJECT_CONFIG` object that centralizes all optimization settings:

```typescript
const PROJECT_CONFIG = {
  // Files to warmup during dev server start
  warmupFiles: [
    './src/main.tsx',
    './src/Router.tsx',
    './src/pages/home.tsx',
    './src/components/Hero.tsx',
  ],
  
  // Manual chunk splitting for vendor libraries
  vendorChunks: {
    react: ['react', 'react-dom', 'react-router'],
    framerMotion: ['framer-motion'],
    lucideIcons: ['lucide-react'],
    reactIcons: ['react-icons'],
  },
  
  // Beasties (Critical CSS) configuration
  beastiesConfig: {
    minimumExternalSize: 5000, // If external CSS < 5kb, inline it all
    inlineThreshold: 0,         // Always inline critical CSS
    pruneSource: true,          // Remove inlined CSS from external files
    mergeStylesheets: false,    // Keep separate <style> tags for caching
    preload: 'swap',
    noscriptFallback: true,
    inlineFonts: true,
    preloadFonts: true,
    compress: true,
    logLevel: 'warn',
    keyframes: 'critical',      // Only inline critical animations
    reduceInlineStyles: false,  // Don't process inline <style> tags
    allowRules: [
      /\.btn.*:hover/,
      /\.btn.*:active/,
      /\.btn.*:focus/,
      /\.nav.*:hover/,
      /:focus-visible/,
      /\[data-state/,
      /^\.sr-only$/,
      /^\.hidden$/
    ]
  },
  
  // Terser (Minification) configuration
  terserConfig: {
    passes: 3,              // 3-pass compression for maximum reduction
    dropConsole: true,      // Remove console.log in production
    dropDebugger: true,     // Remove debugger statements
    ecma: 2020,
    hoist_funs: true,       // Hoist function declarations
    hoist_props: true,      // Hoist object properties
    pure_getters: true,     // Assume getters have no side effects
    toplevel: true,         // Aggressive variable mangling
  }
};
```

**How to customize:**
1. **warmupFiles**: Add your critical routes for faster dev server startup
   - Include your most-visited pages during development
   - Remove paths to components that don't exist in your project
   
2. **vendorChunks**: Adjust based on your dependencies
   - Add new chunks for large libraries you use
   - Remove chunks for libraries you don't use
   
3. **beastiesConfig**: Control critical CSS extraction
   - Increase `minimumExternalSize` if you want more CSS external
   - Modify `allowRules` to force-include specific CSS patterns
   
4. **terserConfig**: Adjust minification aggressiveness
   - Decrease `passes` to 1 or 2 for faster builds (slightly larger bundles)
   - Set `dropConsole: false` to keep console.log in production for debugging

---

## 🚀 Critical CSS Optimization (Beasties)

### What is Beasties?
Beasties extracts and inlines critical CSS (above-the-fold styles) directly into HTML, while deferring non-critical CSS. This eliminates render-blocking CSS and improves First Contentful Paint (FCP).

### Configuration Highlights

```typescript
beastiesConfig: {
  minimumExternalSize: 5000, // If remaining CSS < 5KB, inline everything
  inlineThreshold: 0, // Always inline critical CSS
  pruneSource: true, // Remove inlined CSS from external files
  keyframes: 'critical', // Only inline critical animations
  allowRules: [
    // Force-include hover/focus states
    /\.btn.*:hover/,
    /\.nav.*:hover/,
    /:focus-visible/,
  ]
}
```

### Two-Stage Processing
1. **Vite Build**: `vite-plugin-beasties` processes `index.html`
2. **Prerender**: Manual Beasties processes all prerendered routes in `scripts/prerender.ts`

**Result:**
- Homepage: ~45 KB inlined critical CSS (50-60% of total CSS)
- Other pages: ~25-35 KB inlined
- External CSS: < 1 KB (99%+ reduction)

---

## ⚡ Build Scripts

### Available Commands

```bash
# Full production build with linting
pnpm build

# Build without OG screenshot generation (faster)
pnpm core:build

# Regenerate prerendered HTML with SEO + critical CSS
pnpm prerender

# Generate Open Graph images from live pages
pnpm og-screenshots

# Analyze bundle size (generates stats.html)
pnpm run build
ANALYZE=true pnpm core:build
```

### Build Process Flow

```
pnpm build
  ↓
1. pnpm lint (ESLint + TypeScript + Knip)
  ↓
2. pnpm core:build
  ↓
   a. vite build (Terser, Lightning CSS, code splitting)
   b. Beasties (inline critical CSS)
   c. Compression (gzip + brotli)
  ↓
   d. pnpm prerender (SSR/SSG all routes with SEO metadata)
```

---

## 🔥 Code Splitting & Bundle Optimization

### Automatic Vendor Chunking

Configured via `PROJECT_CONFIG.vendorChunks`:

```typescript
vendorChunks: {
  react: ['react', 'react-dom', 'react-router'],      // ~73 KB gzip
  framerMotion: ['framer-motion'],                     // ~40 KB gzip
  lucideIcons: ['lucide-react'],                       // ~4 KB gzip
  reactIcons: ['react-icons'],                         // ~3 KB gzip
}
```

**Why split chunks?**
- Enables browser caching (vendor code rarely changes)
- Parallel downloads improve load time
- Lazy-loading reduces initial bundle size

### Lazy-Loaded Components

Example from `Layout.tsx`:

```tsx
const Navbar = lazy(() => import('@/components/Navbar'));

<Suspense fallback={<div className="h-16" />}>
  <Navbar />
</Suspense>
```

**Best practice:** Lazy-load components below the fold or those not needed immediately.

---

## 🎨 Font Optimization

### Strategy: `font-display: optional` for Zero CLS

From `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=optional"
  rel="stylesheet"
  media="print"
  onload="this.media='all'">
```

**Benefits:**
- **Zero CLS (Cumulative Layout Shift)** - Falls back to system font if not loaded in 100ms
- **No FOIT (Flash of Invisible Text)** - Text visible immediately
- **Trade-off:** May show system font on slow connections

---

## 📊 Compression

Dual compression is applied to all assets:

```typescript
viteCompression({ algorithm: 'gzip' }),              // Broad compatibility
viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),  // 15-20% smaller
```

**Result:**
- React vendor: 226 KB → 71.96 KB gzip / 61.64 KB brotli
- Main CSS: 88 KB → 13.19 KB gzip / 10.46 KB brotli

---

## 🛠️ Terser Minification

Configured via `PROJECT_CONFIG.terserConfig`:

```typescript
terserConfig: {
  passes: 3,              // 3-pass compression for maximum size reduction
  dropConsole: true,      // Remove console.log in production
  dropDebugger: true,
  hoist_funs: true,       // Hoist function declarations
  hoist_props: true,      // Hoist object properties
  pure_getters: true,     // Assume getters have no side effects
  toplevel: true,         // Aggressive variable mangling
}
```

**Why Terser over esbuild?**
- 5-15% smaller bundles with `passes: 3`
- Better dead code elimination
- More aggressive mangling

---

## 🔍 SSR/SSG (Server-Side Rendering / Static Site Generation) with Prerendering

### How It Works

1. `scripts/prerender.ts` reads all routes from `src/Router.tsx`
2. For each route:
   - Renders React component to HTML string
   - Injects SEO metadata from `src/seo.json`
   - Applies Beasties to inline critical CSS
   - Generates `sitemap.xml` and `robots.txt`

### SSR/SSG and Suspense (Prerenderer handling)

Suspense boundaries are automatically handled during SSR/SSG by the prerenderer. You no longer need to detect SSR/SSG inside components or conditionally skip Suspense boundaries - the prerenderer will ensure server rendering and client hydration behave correctly.

---

## 📈 Bundle Analysis

View bundle composition with:

```bash
ANALYZE=true pnpm core:build
```

Opens `stats.html` with interactive visualization showing:
- Chunk sizes (raw, gzip, brotli)
- Module composition
- Dependency tree

---

## 🎯 Performance Best Practices

### ✅ Critical Rendering Path Optimization
- Critical CSS fully inlined (40-50 KB on homepage)
- External CSS non-blocking via async loading
- Font loading with zero CLS

### ✅ JavaScript Optimization
- 3-pass Terser compression with aggressive mangling
- Code splitting by vendor (React, Framer Motion, icons)
- Lazy-loading for below-the-fold components

### ✅ Layout Stability
- `font-display: optional` eliminates font-related CLS
- CSS containment prevents layout thrashing in animations
- Preconnect hints reduce DNS/TLS latency

### ✅ Network Efficiency
- Dual compression (gzip + brotli) for all assets
- CSS pruning reduces external stylesheet by 99%+
- Resource hints for critical origins

---

## 🚀 Deployment Checklist

1. ✅ Run `pnpm build` - Generates optimized production build
2. ✅ Verify all pages have inlined CSS (check `dist/*.html` files)
3. ✅ Test on preview server (`pnpm preview`) with hard refresh
4. ✅ Check PageSpeed Insights after deployment

### Expected Results
- **Mobile Score:** 100
- **Desktop Score:** 100
- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** 0 (font-display: optional)
- **FCP (First Contentful Paint):** < 1.8s

---

## 🔧 Troubleshooting

### Issue: "CSS not loading on pages"
**Cause:** Browser cache serving old files  
**Fix:** Hard refresh (`Ctrl+Shift+R`) or clear cache

### Issue: "Beasties error: undefined"
**Cause:** Beasties trying to process inline `<style>` tags  
**Fix:** Set `reduceInlineStyles: false` in Beasties config

### Issue: "Page doesn't load / blank screen"
**Cause:** Invalid React code or hydration mismatch  
**Fix:** Check browser console for errors

---

## 📚 References

- [Beasties Documentation](https://github.com/danielroe/beasties)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Terser Options](https://terser.org/docs/api-reference#minify-options)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

## 🎉 Summary

**Out-of-the-box performance:**
- 100 mobile / 100 desktop PageSpeed score
- 99%+ reduction in external CSS
- 0ms forced reflow time
- Zero CLS with `font-display: optional`
- 50%+ of CSS inlined on homepage

**Customization:**
- Edit `PROJECT_CONFIG` in `vite.config.ts` to adjust all optimization settings
- Add routes to `warmupFiles` for faster dev startup
- Modify `vendorChunks` based on your dependencies
- Adjust Beasties and Terser configs for different trade-offs
