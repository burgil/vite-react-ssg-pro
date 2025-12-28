# Architecture Guide

Understanding how this template works under the hood.

## Overview

This template uses a **Static Site Generation (SSG)** approach with React. Your app is built once, then served as static files - no server needed at runtime.

```
Developer writes React → Build time SSG → Static HTML/CSS/JS → Deployed to CDN
```

## The Build Pipeline

### 1. Development Mode (`pnpm dev`)

```
Vite Dev Server → Hot Module Replacement → Instant Updates
```

- **Vite** serves your files with native ESM
- **React Fast Refresh** preserves component state
- Changes appear in <100ms

### 2. Production Build (`pnpm build`)

```
1. ESLint → Check code quality
2. TypeScript → Type checking
3. Vite Build → Bundle and optimize
4. Pre-render → Generate static HTML
5. OG Images → Create social share images
6. Output → dist/ folder ready to deploy
```

## Core Technologies

### Vite

**Why Vite?** Lightning-fast builds and instant HMR.

- Uses native ES modules in development
- Rollup for production (optimized bundles)
- Built-in TypeScript and JSX support
- Plugin system for extensibility

**Key Config** (`vite.config.ts`):
```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    checker({ typescript: true })
  ],
  resolve: {
    alias: { '@': '/src' }  // Use @/components/...
  }
});
```

### React Router 7

**Why React Router?** Modern routing with type safety and lazy loading.

```tsx
// Lazy-loaded routes
const Home = lazy(() => import('./pages/home'));
const About = lazy(() => import('./pages/about'));

// Routes wrapped in Suspense
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
  </Routes>
</Suspense>
```

**Benefits**:
- Code splitting per route
- Only load JavaScript for the current page
- Faster initial load times

### Pre-rendering System

**The Secret Sauce**: `scripts/prerender.ts`

This script runs during build and:
1. Reads your routes from `src/seo.json`
2. Renders each React page to HTML string
3. Injects SEO metadata into `<head>`
4. Adds Schema.org structured data
5. Writes static `.html` files

**How It Works**:
```typescript
// 1. Create a virtual DOM
const window = new Window();
global.document = window.document;

// 2. Render React to string
const html = renderToString(
  <MemoryRouter initialEntries={[route]}>
    <Layout>{pageComponent}</Layout>
  </MemoryRouter>
);

// 3. Inject into template
const finalHTML = templateHTML
  .replace('<!--title-->', `<title>${seo.title}</title>`)
  .replace('<!--meta-->', generateMetaTags(seo))
  .replace('<!--app-->', html);

// 4. Write to dist/route/index.html
fs.writeFileSync(outputPath, finalHTML);
```

**Result**: Every route becomes a fully-formed HTML file that crawlers can read instantly.

## Data Flow

### Client-Side Hydration

```
1. Browser loads /about/index.html (pre-rendered)
   ↓
2. User sees content immediately (SSG HTML)
   ↓
3. React JS bundle loads in background
   ↓
4. React "hydrates" the static HTML
   ↓
5. Page becomes interactive (onClick, etc.)
```

**Best of Both Worlds**:
- SEO sees fully-rendered HTML
- Users see content before JS loads
- Smooth client-side navigation after hydration

## SEO Architecture

### Meta Tag System

All SEO data lives in `src/seo.json`:

```json
{
  "_global": {
    "siteName": "My App",
    "domain": "https://example.com",
    "social": {
      "github": "https://github.com/user"
    }
  },
  "/about": {
    "title": "About - My App",
    "description": "Learn about us",
    "keywords": "about,team,company"
  }
}
```

**Injected During Build**:
```html
<head>
  <title>About - My App</title>
  <meta name="description" content="Learn about us">
  <meta property="og:title" content="About - My App">
  <script type="application/ld+json">
    {"@type": "WebSite", "name": "My App"}
  </script>
</head>
```

### Open Graph Images

**Auto-generated** using `scripts/generate_og_screenshots.py`:

1. Spins up a headless browser
2. Takes screenshots of each page
3. Saves to `public/images/og/`
4. Referenced in `<meta property="og:image">`

**Result**: Beautiful previews when shared on social media.

## Component Architecture

### Layout Wrapper

```tsx
// src/Layout.tsx
export default function Layout() {
  return (
    <>
      <SEOTitle />  {/* Dynamic <title> */}
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />  {/* Your page renders here */}
      </Suspense>
    </>
  );
}
```

**Benefits**:
- Consistent SEO across all pages
- Loading states handled globally
- Easy to add global providers (theme, auth, etc.)

### Page Components

Pattern for all pages:

```tsx
// src/pages/example.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ExamplePage() {
  return (
    <main className="min-h-screen bg-[#020204] text-white">
      <Navbar />
      
      {/* Page content */}
      <section className="py-16 container mx-auto px-6">
        <h1>Hello World</h1>
      </section>
      
      <Footer />
    </main>
  );
}
```

**Why This Pattern?**
- Self-contained pages
- Easy to delete/modify
- Navbar and Footer on every page

## Performance Optimizations

### Code Splitting

```tsx
// Only load About page when /about is visited
const About = lazy(() => import('./pages/about'));
```

**Result**: Smaller initial bundle, faster first paint.

### Asset Optimization

Vite automatically:
- Minifies JS and CSS
- Hashes filenames for cache busting
- Inlines small images as base64
- Tree-shakes unused code

### CDN-Ready Output

All assets use relative paths → works on any CDN:
```html
<link rel="stylesheet" href="/assets/index-abc123.css">
<script src="/assets/index-def456.js"></script>
```

## Deployment Architecture

```
dist/
├── index.html           # Home page
├── about/
│   └── index.html       # About page
├── assets/
│   ├── index-abc.js     # Main bundle
│   ├── about-def.js     # About chunk
│   └── index-xyz.css    # Styles
└── images/              # Static assets
```

**How It's Served**:
1. User visits `example.com/about`
2. CDN serves `about/index.html`
3. Browser loads linked assets from `assets/`
4. Page renders instantly

## State Management

Currently **no global state** - this is a template.

**When You Need State**:
- **Small apps**: Use React's `useState` and `useContext`
- **Medium apps**: Add Zustand or Jotai
- **Large apps**: Consider Redux Toolkit

## API Integration

### Client-Side Fetching

```tsx
import { useEffect, useState } from 'react';

function DataComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data?.message}</div>;
}
```

### Environment Variables

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## Security Considerations

### Static = Secure

No server means:
- No SQL injection
- No server-side RCE
- Minimal attack surface

**But Remember**:
- API keys in frontend are visible → use backend proxy
- Validate all user input
- Use HTTPS for all requests

## Extensibility

### Adding a Backend

Option 1: **Serverless Functions** (Cloudflare Workers, Vercel Functions)
```typescript
// api/hello.ts
export default function handler(req, res) {
  res.json({ message: 'Hello' });
}
```

Option 2: **Separate API** (Express, FastAPI, etc.)
```typescript
// In your React app
fetch('https://api.example.com/data');
```

### Adding Authentication

Use services like:
- **Clerk** - Drop-in auth components
- **Auth0** - Enterprise SSO
- **Supabase** - Backend + auth

## Monitoring & Analytics

Add client-side tracking:

```tsx
// main.tsx
import { inject } from '@vercel/analytics';
inject();
```

Or server-side with Cloudflare Analytics (zero performance impact).

## Next Steps

- **[SEO Guide](seo-guide.md)** - Optimize for search
- **[Deployment Guide](deployment.md)** - Ship to production
- **[Performance Guide](performance.md)** - Make it faster

---

**Questions?** Open an issue on [GitHub](https://github.com/burgil/issues)
