# Getting Started

Welcome! This guide will get you from zero to deployed in under 10 minutes.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **Git** (optional) - For version control

## Installation

### Quick Start

```bash
# Extract the template to your project folder, then:
cd my-app

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Alternative: Copy to New Location

```bash
# Copy the template folder to your desired location
cp -r vite-react-ssg-pro my-new-project
cd my-new-project

# Install dependencies
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

Your app is now running at **http://localhost:5173** with instant hot module replacement (HMR).

### What You'll See

- **Home Page** (`/`) - Hero section with Framer Motion animations
- **About Page** (`/about`) - Example content with icons and animations

## Project Structure

```
my-app/
├── public/              # Static assets
│   └── images/          # Images and OG images
├── scripts/             # Build scripts
│   ├── prerender.ts     # SSG pre-rendering
│   └── generate_og_screenshots.py  # OG image generation
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route components
│   ├── Layout.tsx       # Page wrapper with SEO
│   ├── Router.tsx       # Route definitions
│   ├── main.tsx         # App entry point
│   └── seo.json         # SEO metadata per route
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Adding Your First Page

1. **Create a new page component**:

```tsx
// src/pages/contact.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#020204] text-white">
      <Navbar />
      <PageHeader 
        title="Contact Us" 
        description="Get in touch with our team" 
      />
      
      <section className="py-16 container mx-auto px-6">
        {/* Your content here */}
      </section>
      
      <Footer />
    </main>
  );
}
```

2. **Add route to Router**:

```tsx
// src/Router.tsx
import { lazy } from 'react';

const Contact = lazy(() => import('./pages/contact'));

// Inside Routes:
<Route path="contact" element={<Contact />} />
```

3. **Add SEO metadata**:

```json
// src/seo.json
{
  "/contact": {
    "title": "Contact - My App",
    "description": "Get in touch with our team",
    "keywords": "contact,email,support",
    "canonical": "https://example.com/contact"
  }
}
```

4. **Build and test**:

```bash
pnpm build
pnpm preview
```

## Building for Production

```bash
# Full production build
pnpm build
```

This command:
1. ✅ Runs linting (ESLint, depcheck, knip)
2. ✅ Type-checks your code (TypeScript)
3. ✅ Builds the app (Vite)
4. ✅ Pre-renders all pages to static HTML
5. ✅ Generates OG images for social sharing

Output goes to `dist/` folder - ready to deploy!

## Preview Production Build

```bash
pnpm preview
```

Test your production build locally at **http://localhost:4173**.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm lint             # Run all linters

# SEO Tools
pnpm prerender        # Pre-render pages only
pnpm og-screenshots   # Generate OG images only
```

## Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_APP_NAME=My Epic App
VITE_API_URL=https://api.example.com
```

Access in your code:

```tsx
const appName = import.meta.env.VITE_APP_NAME;
```

## Customizing Your App

### Update Branding

1. **Replace logo**: `public/images/logo.webp`
2. **Update favicon**: `public/favicon.ico`
3. **Edit site name**: `src/seo.json` -> `_global.siteName`

### Change Colors

Edit Tailwind config or use inline classes:

```tsx
// Use Tailwind utilities
<button className="bg-purple-500 hover:bg-purple-600">
  Click Me
</button>
```

### Add Dependencies

```bash
pnpm add package-name
```

## Troubleshooting

### Port 5173 Already in Use

```bash
# Kill the process or use a different port
pnpm dev --port 3000
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Next Steps

- **[Architecture Guide](architecture.md)** - Understand how it works
- **[SEO Guide](seo-guide.md)** - Optimize for search engines
- **[Deployment Guide](deployment.md)** - Ship to production
- **[Performance Guide](performance.md)** - Make it faster

---

**Need help?** Open an issue on [GitHub](https://github.com/burgil/issues)
