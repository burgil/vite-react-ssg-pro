# Performance Optimization Guide

Make your app blazingly fast.

## Current Performance

Out of the box, this template achieves:

```
Lighthouse Score: 💯 95-100
First Contentful Paint: <0.5s
Largest Contentful Paint: <1.5s
Time to Interactive: <1.2s
Total Blocking Time: <100ms
Cumulative Layout Shift: <0.05
```

Let's make it even faster.

---

## Core Web Vitals

Google's ranking factors:

### Largest Contentful Paint (LCP)
**Target**: <2.5s  
**Current**: ~1.5s  
**What It Measures**: How fast main content loads

**Optimizations**:
```tsx
// 1. Preload hero image
<link rel="preload" href="/images/hero.webp" as="image" />

// 2. Use WebP format (smaller files)
<img src="/images/hero.webp" alt="Hero" />

// 3. Size images correctly
<img 
  src="/images/hero.webp" 
  width="1200" 
  height="630"  // Prevents layout shift
/>
```

### First Input Delay (FID)
**Target**: <100ms  
**Current**: ~50ms  
**What It Measures**: Responsiveness to user interactions

**Already Optimized**:
- Minimal JavaScript on initial load
- Code splitting per route
- Deferred non-critical scripts

### Cumulative Layout Shift (CLS)
**Target**: <0.1  
**Current**: <0.05  
**What It Measures**: Visual stability during load

**Best Practices**:
```tsx
// ✅ Always specify dimensions
<img src="..." width="400" height="300" />

// ✅ Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Spinner /> : <Content />}
</div>

// ❌ Avoid
<img src="..." />  // No dimensions = layout shift
```

---

## Bundle Size Optimization

### Analyze Bundle

```bash
# Build with visualization
pnpm build

# Check bundle size
npx vite-bundle-visualizer
```

### Reduce Bundle Size

**1. Tree Shaking**

Import only what you need:

```tsx
// ❌ Bad (imports entire library)
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Good (imports only debounce)
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

**2. Dynamic Imports**

Lazy load heavy components:

```tsx
// ❌ Loaded on every page
import HeavyChart from './HeavyChart';

// ✅ Loaded only when needed
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

**3. Remove Unused Dependencies**

```bash
# Check for unused packages
pnpm lint  # Runs depcheck

# Remove unused
pnpm remove unused-package
```

---

## Image Optimization

### Use WebP Format

**Why**: 25-35% smaller than PNG/JPEG with same quality.

Convert images:
```bash
# Using cwebp (install from Google)
cwebp -q 80 input.png -o output.webp

# Batch convert
for img in *.png; do cwebp -q 80 "$img" -o "${img%.png}.webp"; done
```

### Responsive Images

Serve different sizes for different screens:

```tsx
<img
  srcSet="
    /images/hero-400.webp 400w,
    /images/hero-800.webp 800w,
    /images/hero-1200.webp 1200w
  "
  sizes="(max-width: 640px) 400px,
         (max-width: 1024px) 800px,
         1200px"
  src="/images/hero-1200.webp"
  alt="Hero"
/>
```

### Lazy Load Images

```tsx
// Native lazy loading
<img 
  src="/images/below-fold.webp" 
  loading="lazy"  // Loads only when near viewport
  alt="Content"
/>
```

### Optimize Logo/Icons

Use SVG for logos and icons:

```tsx
// ✅ Inline SVG (no extra request)
function Logo() {
  return (
    <svg width="40" height="40">
      <path d="..." />
    </svg>
  );
}
```

---

## Font Optimization

### Preload Fonts

In `index.html`:

```html
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin 
/>
```

### Use Variable Fonts

Single file for all weights:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;  /* All weights in one file */
  font-display: swap;    /* Show fallback until loaded */
}
```

### Subset Fonts

Only include characters you need:

```bash
# Using glyphhanger
npm install -g glyphhanger
glyphhanger --whitelist="ABCDEFGabc..." --formats=woff2 --subset=*.ttf
```

---

## Code Splitting

### Route-Based Splitting (Already Done)

```tsx
// Each route = separate chunk
const Home = lazy(() => import('./pages/home'));
const About = lazy(() => import('./pages/about'));
```

**Result**: User only downloads code for current page.

### Component-Based Splitting

For heavy components:

```tsx
// Heavy charting library
const Chart = lazy(() => import('./components/Chart'));

function Analytics() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowChart(true)}>
        Show Analytics
      </button>
      
      {showChart && (
        <Suspense fallback={<Spinner />}>
          <Chart />
        </Suspense>
      )}
    </>
  );
}
```

**Result**: Chart library only loads when button is clicked.

---

## Caching Strategy

### Static Assets

Vite automatically adds cache busting hashes:

```html
<!-- Original -->
<script src="/assets/index.js"></script>

<!-- Built -->
<script src="/assets/index-abc123.js"></script>
```

**Cache Forever**: Hash changes = new file, no stale cache.

### Service Worker (Optional)

For offline support:

```bash
pnpm add -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg}']
      }
    })
  ]
});
```

---

## Network Optimization

### Preconnect to External Domains

If using external APIs or fonts:

```html
<!-- In index.html -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

### HTTP/2 Push (On Cloudflare)

Create `public/_headers`:

```
/*
  Link: </assets/index-abc123.js>; rel=preload; as=script
  Link: </assets/index-xyz456.css>; rel=preload; as=style
```

### Compression

**Brotli** (automatic on Cloudflare/Vercel):
- 20% smaller than gzip
- Enabled by default on modern hosts

**Manual (nginx)**:

```nginx
# Enable brotli
brotli on;
brotli_types text/plain text/css application/javascript;
```

---

## Runtime Performance

### React Performance

**1. Memo Expensive Computations**:

```tsx
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processed = useMemo(() => {
    return data.map(/* expensive operation */);
  }, [data]);  // Only recompute if data changes
  
  return <div>{processed}</div>;
}
```

**2. Memo Components**:

```tsx
import { memo } from 'react';

const HeavyComponent = memo(function HeavyComponent({ value }) {
  // Only re-renders if value changes
  return <div>{value}</div>;
});
```

**3. Virtualize Long Lists**:

```bash
pnpm add react-window
```

```tsx
import { FixedSizeList } from 'react-window';

function LongList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  );
}
```

### Debounce Input Handlers

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function SearchInput() {
  const handleSearch = useMemo(
    () => debounce((value) => {
      // Expensive search operation
    }, 300),
    []
  );
  
  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

---

## Monitoring Performance

### Lighthouse CI

Automate performance checks:

```bash
pnpm add -D @lhci/cli
```

`.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-site.com
            https://your-site.com/about
          budgetPath: ./budget.json
```

### Web Vitals Tracking

```bash
pnpm add web-vitals
```

```tsx
// main.tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
```

Send to analytics:

```tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to Google Analytics, Plausible, etc.
  const body = JSON.stringify(metric);
  fetch('/analytics', { method: 'POST', body });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

---

## CDN Optimization

### Cloudflare Settings

**Recommended**:
- ✅ Auto Minify: HTML, CSS, JS
- ✅ Brotli compression
- ✅ Rocket Loader: Off (interferes with React)
- ✅ Polish: Lossless (optimizes images)
- ✅ Mirage: On (lazy loads images)
- ✅ HTTP/2 to Origin: On

### Cache Rules

Cloudflare Page Rule:

```
URL: yourdomain.com/*
Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours
```

---

## Advanced Optimizations

### Prefetch Next Pages

```tsx
import { Link } from 'react-router';

// Prefetch on hover
<Link 
  to="/about" 
  onMouseEnter={() => import('./pages/about')}
>
  About
</Link>
```

### Critical CSS Inlining

Inline above-the-fold styles:

```html
<!-- In index.html -->
<style>
  /* Critical CSS for hero section */
  .hero { ... }
</style>
```

### Reduce Third-Party Scripts

Every external script slows your site:

```tsx
// ❌ Avoid heavy trackers
<script src="https://slow-analytics.com/tracker.js"></script>

// ✅ Use lightweight alternatives
// - Plausible Analytics (1KB)
// - Fathom Analytics (1KB)
// - Cloudflare Analytics (0KB, server-side)
```

---

## Performance Checklist

### Pre-Launch

- [ ] All images converted to WebP
- [ ] Images have width/height attributes
- [ ] Fonts preloaded
- [ ] No unused dependencies
- [ ] Lighthouse score >90 on all pages
- [ ] Bundle size <300KB (uncompressed)

### Post-Launch

- [ ] Monitor Core Web Vitals
- [ ] Set up real user monitoring
- [ ] Check PageSpeed Insights monthly
- [ ] Profile slow pages with Chrome DevTools

---

## Troubleshooting

### Slow Initial Load

**Problem**: FCP >2s

**Solutions**:
- Reduce bundle size (dynamic imports)
- Preload critical resources
- Remove render-blocking scripts
- Enable compression on server

### Layout Shifts

**Problem**: CLS >0.1

**Solutions**:
- Add width/height to all images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS Grid/Flexbox (more stable than floats)

### Long Tasks

**Problem**: TBT >300ms

**Solutions**:
- Split long JavaScript execution
- Use Web Workers for heavy computation
- Debounce/throttle frequent events
- Remove unnecessary dependencies

---

## Next Steps

- **[SEO Guide](seo-guide.md)** - Optimize for search
- **[Deployment Guide](deployment.md)** - Launch your site
- **[Architecture Guide](architecture.md)** - Understand the system

---

**Need performance help?** Open an issue on [GitHub](https://github.com/burgil/issues)
