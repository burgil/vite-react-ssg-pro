# SEO Best Practices

How to rank #1 on Google with this template.

## Why This Template is SEO-Ready

Unlike typical React apps, this template generates **fully pre-rendered HTML** at build time. Search engines see complete pages instantly - no JavaScript execution required.

```
Traditional React App:
Crawler → Empty <div id="root"> → ❌ No content indexed

This Template:
Crawler → Full HTML with content → ✅ Perfectly indexed
```

## The SEO Stack

### 1. Pre-rendered HTML

Every page is built as static HTML with all content visible in the source:

```html
<!-- What Google sees: -->
<main>
  <h1>Vite React SSG Pro</h1>
  <p>A minimal Vite + React starter template...</p>
</main>
```

**Benefit**: Instant indexing, no client-side rendering delays.

### 2. Meta Tags

Configured in `src/seo.json`, injected at build time:

```json
{
  "/": {
    "title": "Vite React SSG Pro - Vite + React",
    "description": "A minimal Vite + React landing page template",
    "keywords": "vite,react,starter,template"
  }
}
```

**Generated HTML**:
```html
<title>Vite React SSG Pro - Vite + React</title>
<meta name="description" content="A minimal Vite + React landing page template">
<meta name="keywords" content="vite,react,starter,template">
<link rel="canonical" href="https://example.com/">
```

### 3. Open Graph Tags

Perfect social media previews:

```html
<meta property="og:title" content="Vite React SSG Pro">
<meta property="og:description" content="...">
<meta property="og:image" content="/images/og/og-home.webp">
<meta property="og:type" content="website">
```

**Result**: When shared on Twitter, Facebook, LinkedIn → beautiful preview cards.

### 4. Schema.org Structured Data

Rich snippets in search results:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vite React SSG Pro",
  "url": "https://example.com",
  "logo": "https://example.com/images/logo.webp",
  "sameAs": [
    "https://github.com/burgil",
    "https://youtube.com/@GenZv1Dev"
  ]
}
```

**Benefit**: Enhanced search results with star ratings, logos, breadcrumbs.

## Configuring SEO

### Global Settings

Edit `src/seo.json` → `_global`:

```json
{
  "_global": {
    "siteName": "Your App Name",
    "domain": "https://yourdomain.com",
    "defaultRobots": "index, follow",
    "logo": "/images/logo.webp",
    "social": {
      "github": "https://github.com/yourusername",
      "youtube": "https://youtube.com/@yourchannel"
    },
    "contact": {
      "email": "hello@yourdomain.com",
      "type": "Support"
    },
    "organization": {
      "name": "Your Company",
      "description": "What you do",
      "url": "https://yourdomain.com"
    }
  }
}
```

### Per-Page SEO

Add entries for each route:

```json
{
  "/pricing": {
    "title": "Pricing - Your App",
    "description": "Simple, transparent pricing for everyone",
    "keywords": "pricing,plans,cost",
    "canonical": "https://yourdomain.com/pricing",
    "ogType": "website",
    "ogImage": "/images/og/og-pricing.webp",
    "twitterCard": "summary_large_image",
    "sitemap": {
      "changefreq": "monthly",
      "priority": 0.9
    }
  }
}
```

### Title Best Practices

**Format**: `Page Name - Site Name`

```json
{
  "title": "Pricing - Your App"  // ✅ Clear and branded
}
```

**Avoid**:
```json
{
  "title": "Pricing"  // ❌ Too generic
}
```

**Length**: 50-60 characters for full display in search results.

### Description Best Practices

**Format**: Clear value proposition in 150-160 characters.

```json
{
  "description": "Build lightning-fast React apps with perfect SEO. Pre-rendered HTML, zero backend, deploy anywhere for $1/month."
}
```

**Tips**:
- Include main keyword
- Add a call-to-action
- Be specific about benefits
- Don't keyword stuff

### Keywords

Comma-separated list of relevant terms:

```json
{
  "keywords": "react,vite,ssg,seo,static site,fast,performance"
}
```

**Note**: Google mostly ignores keywords meta tag, but Bing still uses it.

## Open Graph Images

### Auto-Generation

Run during build:

```bash
pnpm og-screenshots
```

**What It Does**:
1. Starts local server on port 5173
2. Takes screenshots of each page (1200x630px)
3. Saves to `public/images/og/og-{page}.webp`
4. References in meta tags

### Manual Creation

Create custom OG images in Figma/Canva:
- **Dimensions**: 1200x630px (2:1 ratio)
- **Format**: WebP or PNG
- **File size**: <200KB
- **Text**: Large, readable at small sizes

Place in `public/images/og/` and reference:

```json
{
  "/": {
    "ogImage": "/images/og/custom-home.webp"
  }
}
```

## Sitemap Generation

The prerender script generates `sitemap.xml`:

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Submit to**:
- Google Search Console
- Bing Webmaster Tools

## Robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

## Performance = SEO

Google uses Core Web Vitals as ranking factors:

### Largest Contentful Paint (LCP)
**Target**: <2.5s

**How We Achieve It**:
- Pre-rendered HTML loads instantly
- Critical CSS inlined
- Images lazy-loaded

### First Input Delay (FID)
**Target**: <100ms

**How We Achieve It**:
- Minimal JavaScript on initial load
- Code splitting per route
- Deferred non-critical scripts

### Cumulative Layout Shift (CLS)
**Target**: <0.1

**How We Achieve It**:
- Fixed dimensions for images
- No dynamic content injection
- Font loading optimized

## Content Best Practices

### Heading Structure

Use semantic HTML:

```tsx
<h1>Main Page Title</h1>  {/* Only one per page */}
<h2>Section Heading</h2>
<h3>Subsection</h3>
```

**Why**: Helps Google understand page structure.

### Internal Linking

Link between your pages:

```tsx
<Link to="/about">Learn more about us</Link>
```

**Benefits**:
- Better crawlability
- Distributes page authority
- Keeps users on site longer

### Alt Text for Images

Always add descriptive alt text:

```tsx
<img 
  src="/images/product.webp" 
  alt="Blue running shoes with white sole"
/>
```

**Why**: Accessibility + image search SEO.

### Content Quality

Google rewards:
- ✅ Original content
- ✅ In-depth articles
- ✅ Regular updates
- ✅ User engagement

Avoid:
- ❌ Duplicate content
- ❌ Keyword stuffing
- ❌ Thin content (<300 words)

## Technical SEO Checklist

### Pre-Launch

- [ ] Set `domain` in `src/seo.json` to production URL
- [ ] Update all page titles and descriptions
- [ ] Generate OG images for all pages
- [ ] Create custom `favicon.ico`
- [ ] Add `robots.txt` to `public/`
- [ ] Build and verify sitemap exists in `dist/`

### Post-Launch

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics or Plausible
- [ ] Monitor Core Web Vitals in PageSpeed Insights
- [ ] Check mobile usability in Search Console
- [ ] Request indexing for important pages

## Monitoring SEO Performance

### Google Search Console

**Setup**:
1. Visit [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property
3. Verify ownership (upload verification file to `public/`)
4. Submit sitemap

**Monitor**:
- Impressions and clicks
- Average position
- Coverage issues
- Mobile usability

### PageSpeed Insights

Check performance:
```
https://pagespeed.web.dev/
```

**Target Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Schema Markup Validator

Test structured data:
```
https://validator.schema.org/
```

Paste your page URL and verify all schemas are valid.

## Advanced SEO

### Breadcrumbs

Add to `src/seo.json`:

```json
{
  "/blog/post-1": {
    "schema": {
      "breadcrumb": true
    }
  }
}
```

**Generated Schema**:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/blog"},
    {"@type": "ListItem", "position": 3, "name": "Post 1"}
  ]
}
```

### Internationalization (i18n)

For multi-language sites:

1. Create separate routes:
```
/en/
/es/
/fr/
```

2. Add `hreflang` tags:
```html
<link rel="alternate" hreflang="en" href="https://example.com/en/">
<link rel="alternate" hreflang="es" href="https://example.com/es/">
```

3. Update `src/seo.json` per language.

## Common SEO Mistakes

### ❌ Duplicate Content
**Problem**: Same content on multiple URLs  
**Solution**: Use canonical tags (already included)

### ❌ Missing Alt Text
**Problem**: Images without descriptions  
**Solution**: Add alt text to all `<img>` tags

### ❌ Slow Loading
**Problem**: Large images, too much JavaScript  
**Solution**: Use WebP images, code splitting, lazy loading

### ❌ Not Mobile-Friendly
**Problem**: Desktop-only design  
**Solution**: Use Tailwind's responsive utilities (`md:`, `lg:`)

## Next Steps

- **[Performance Guide](performance.md)** - Optimize loading speed
- **[Deployment Guide](deployment.md)** - Launch your site
- **[Customization Guide](customization.md)** - Make it yours

---

**Need help with SEO?** Open an issue on [GitHub](https://github.com/burgil/issues)
