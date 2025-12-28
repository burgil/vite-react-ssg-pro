# React Suspense Guide

> **Note:** This template is a static site generator (SSG) and does not provide runtime SSR. Suspense boundaries are handled at build time during prerendering.

## Overview

React Suspense allows you to declaratively handle loading states while components are being lazy-loaded or while data is being fetched. This guide shows you how to use Suspense effectively in this template.

---

## 🎯 What is Suspense?

Suspense is a React feature that lets you:
1. **Lazy-load components** - Load code on-demand to reduce initial bundle size
2. **Handle loading states** - Show fallback UI while waiting for components/data
3. **Improve performance** - Split code and defer non-critical resources

---

## 📦 Basic Usage

### Lazy-Loading Components

```tsx
import { lazy, Suspense } from 'react';

// Lazy-load the component
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**When to use:**
- Components below the fold (not immediately visible)
- Heavy components with large dependencies (charts, editors, etc.)
- Route-based code splitting

---

## 🚀 Advanced Patterns

### Multiple Fallbacks (Nested Suspense)

```tsx
import { lazy, Suspense } from 'react';

const Sidebar = lazy(() => import('./Sidebar'));
const MainContent = lazy(() => import('./MainContent'));
const Footer = lazy(() => import('./Footer'));

function Layout() {
  return (
    <>
      {/* Different loading states for different sections */}
      <Suspense fallback={<div className="h-16 bg-gray-800 animate-pulse" />}>
        <Sidebar />
      </Suspense>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>}>
        <MainContent />
      </Suspense>

      <Suspense fallback={<div className="h-20" />}>
        <Footer />
      </Suspense>
    </>
  );
}
```

**Benefits:**
- Fine-grained loading states
- Prevents layout shift with sized fallbacks
- Better perceived performance

---

### 🎨 Suspense (Template Pattern)

From `src/Layout.tsx`:

```tsx
import { type FC, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
const Navbar = lazy(() => import('@/components/Navbar'));

const Layout: FC = () => {
  const content = (
    <>
      <main data-beasties-container className="min-h-screen">
        <Suspense fallback={<div className="h-16" />}>
          <Navbar />
        </Suspense>
        <Outlet />
      </main>
    </>
  );

  // Suspense boundaries work both on the server and client; the prerenderer
  // will handle SSR/SSG semantics automatically. Use Suspense normally - no
  // manual `isSSR` checks are required.
  return (
    <Suspense fallback={<LoadingScreen />}>
      {content}
    </Suspense>
  );
};
```

**Why this pattern?**
- Suspense boundaries are handled automatically during SSR by the prerenderer.
- Inner Suspense boundaries will hydrate correctly on the client.

---

## 📝 Live Example Component

See `src/components/SuspenseExample.tsx` for a complete working example included in this template. It demonstrates:

1. **Lazy-loaded chart** with sized skeleton fallback
2. **Lazy-loaded table** with animated grid skeleton
3. **Conditionally lazy-loaded modal** that only loads when opened
4. **Best practices summary** with do's and don'ts

To use it in your project, add it to a route:

```tsx
// In src/Router.tsx
const SuspenseExample = lazy(() => import('./components/SuspenseExample'));

<Route path="/suspense-example" element={<SuspenseExample />} />
```

## 📝 Example: Lazy-Loaded Dashboard

Here's another pattern - create `src/components/LazyDashboard.tsx`:

```tsx
import { lazy, Suspense } from 'react';

// Lazy-load heavy chart library
const ChartComponent = lazy(() => import('./ChartComponent'));
const DataTable = lazy(() => import('./DataTable'));
const StatCards = lazy(() => import('./StatCards'));

function LazyDashboard() {
  return (
    <div className="grid gap-4 p-4">
      {/* Stats load first */}
      <Suspense fallback={
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      }>
        <StatCards />
      </Suspense>

      {/* Chart loads independently */}
      <Suspense fallback={
        <div className="h-64 bg-gray-800 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading chart...</span>
        </div>
      }>
        <ChartComponent />
      </Suspense>

      {/* Table loads last */}
      <Suspense fallback={
        <div className="h-96 bg-gray-800 rounded animate-pulse" />
      }>
        <DataTable />
      </Suspense>
    </div>
  );
}

export default LazyDashboard;
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use sized fallbacks** to prevent layout shift:
   ```tsx
   <Suspense fallback={<div className="h-64 w-full bg-gray-100 animate-pulse" />}>
     <Chart />
   </Suspense>
   ```

2. **Lazy-load below-the-fold content**:
   ```tsx
   const Footer = lazy(() => import('./Footer'));
   ```

3. **Split by route** for better initial load:
   ```tsx
   const AboutPage = lazy(() => import('./pages/about'));
   const ContactPage = lazy(() => import('./pages/contact'));
   ```

4. **Provide meaningful fallbacks**:
   ```tsx
   <Suspense fallback={<Spinner text="Loading dashboard..." />}>
     <Dashboard />
   </Suspense>
   ```

### ❌ DON'T

1. **Don't lazy-load critical above-the-fold content**:
   ```tsx
   // ❌ Bad - Hero is above the fold
   const Hero = lazy(() => import('./Hero'));
   ```

2. **Don't use empty fallbacks** (causes layout shift):
   ```tsx
   // ❌ Bad - no placeholder
   <Suspense fallback={null}>
     <LargeComponent />
   </Suspense>
   ```

3. **Don't over-split** tiny components:
   ```tsx
   // ❌ Bad - Button.tsx is 2KB, not worth lazy-loading
   const Button = lazy(() => import('./Button'));
   ```

---

## 🔥 Example: Modal with Lazy Content

Create `src/components/LazyModal.tsx`:

```tsx
import { lazy, Suspense, useState } from 'react';

const ModalContent = lazy(() => import('./ModalContent'));

function LazyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <Suspense fallback={
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            }>
              <ModalContent onClose={() => setIsOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}

export default LazyModal;
```

**Why this works:**
- Modal content only loads when user clicks button
- Reduces initial bundle size
- Fallback shows loading state while code downloads

---

## 📊 Measuring Impact

Check bundle size difference:

```bash
# Before lazy-loading
pnpm build
# Check dist/assets/index-*.js size

# After lazy-loading
# Component now in separate chunk
pnpm build
# Check dist/assets/LazyComponent-*.js
```

Use bundle analyzer:

```bash
ANALYZE=true pnpm core:build
# Opens stats.html in browser
```

---

## 🛠️ Common Patterns

### Pattern 1: Route-Based Splitting

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';

const Home = lazy(() => import('./pages/home'));
const About = lazy(() => import('./pages/about'));
const Contact = lazy(() => import('./pages/contact'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}
```

### Pattern 2: Component Library Splitting

```tsx
import { lazy, Suspense } from 'react';

// Split heavy third-party libraries
const ReactMarkdown = lazy(() => import('react-markdown'));
const CodeEditor = lazy(() => import('@monaco-editor/react'));

function BlogPost({ markdown }: { markdown: string }) {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading content...</div>}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </Suspense>
  );
}
```

### Pattern 3: Conditional Lazy-Loading

```tsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));

function App({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div>
      {isAdmin && (
        <Suspense fallback={<div>Loading admin panel...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 🎯 Performance Tips

1. **Preload on hover** for better UX:
   ```tsx
   <button
     onMouseEnter={() => import('./HeavyModal')}
     onClick={() => setShowModal(true)}
   >
     Open Modal
   </button>
   ```

2. **Group related components** to reduce chunks:
   ```tsx
   // ✅ Good - one chunk for related components
   const { Chart, Legend, Tooltip } = await import('./chart-components');
   ```

3. **Use `React.memo`** to prevent re-renders:
   ```tsx
   const HeavyComponent = React.memo(lazy(() => import('./HeavyComponent')));
   ```

---

## 📚 References

- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [React.lazy Documentation](https://react.dev/reference/react/lazy)
- [Code-Splitting Guide](https://reactjs.org/docs/code-splitting.html)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#async-chunk-loading-optimization)

---

## 🎉 Summary

**Key Takeaways:**
- Use `lazy()` + `<Suspense>` for code splitting
- Always provide sized fallbacks to prevent layout shift
- Suspense boundaries are handled automatically during SSR/SSG by the prerenderer - you don't need to guard them with `isSSR` checks
- Lazy-load below-the-fold and heavy components
- Measure impact with bundle analyzer (`ANALYZE=true pnpm core:build`)

- **Template-specific patterns:**
- See `src/Layout.tsx` for a Suspense pattern that works in both SSR/SSG and client environments (the prerenderer handles SSR/SSG semantics)
- See `vite.config.ts` for manual chunk configuration
- See `docs/optimize.md` for bundle optimization strategies
