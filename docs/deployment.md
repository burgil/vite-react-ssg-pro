# Deployment Guide

Ship your app to production in minutes.

## Build Your App

```bash
# Full production build
pnpm build

# Output is in dist/ folder
```

This generates:
- ✅ Minified HTML/CSS/JS
- ✅ Pre-rendered static pages
- ✅ Optimized images
- ✅ Sitemap and OG images

## Deployment Options

All options deploy the `dist/` folder as static files.

---

## Cloudflare Pages (Recommended)

**Why Cloudflare?**
- ⚡ Lightning-fast global CDN
- 💰 **100% free** for most projects
- 🌐 Automatic HTTPS
- 🔧 Zero configuration
- 📊 Built-in analytics

### Deploy via GitHub

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. **Connect to Cloudflare Pages**:
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Go to **Pages** → **Create a project**
   - Connect your GitHub repo
   - Configure build:
     - **Build command**: `pnpm build`
     - **Build output**: `dist`
     - **Root directory**: `/` (or `/template` if using the repo as-is)

3. **Deploy**:
   - Click **Save and Deploy**
   - Your site is live at `your-project.pages.dev`

### Deploy via CLI (Wrangler)

```bash
# Install Wrangler
pnpm add -g wrangler

# Login
wrangler login

# Deploy
pnpm build
wrangler pages deploy dist --project-name=your-app
```

**Custom Domain**:
- Go to **Custom domains** in Cloudflare Pages
- Add your domain (automatic DNS setup if domain is on Cloudflare)

---

## Custom Domains

### DNS Setup

Point your domain to the platform:

**Cloudflare Pages**:
```
CNAME  www  your-project.pages.dev
CNAME  @    your-project.pages.dev
```

### HTTPS

All platforms provide free SSL certificates via Let's Encrypt automatically.

---

## CI/CD Pipelines

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist --project-name=your-app
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Rollback Strategy

### Cloudflare Pages
- Go to **Deployments**
- Click previous deployment → **Rollback**

### Git-Based Rollback
```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

---

## Performance Monitoring

### After Deployment

1. **Test PageSpeed Insights**:
   ```
   https://pagespeed.web.dev/
   ```
   Target: 90+ on all metrics

2. **Check Mobile Usability**:
   - Google Search Console
   - Mobile-Friendly Test

3. **Monitor Core Web Vitals**:
   - LCP: <2.5s
   - FID: <100ms
   - CLS: <0.1

---

## Troubleshooting

### 404 Errors on Refresh

**Problem**: `/about` works, but refresh gives 404

**Solution**: Configure SPA fallback

**Cloudflare Pages**: Create `public/_redirects`:
```
/*    /index.html   200
```

### Large Bundle Size

**Problem**: Initial JS bundle >500KB

**Solution**:
- Check for large dependencies (`pnpm why package-name`)
- Lazy load routes (already done)
- Remove unused code
- Use dynamic imports for heavy libraries

### Slow Build Times

**Problem**: Build takes >2 minutes

**Solution**:
- Use `pnpm build` instead of `npm run build`
- Skip OG image generation in dev: comment out in `package.json`
- Enable caching in CI/CD

---

## Next Steps

- **[Performance Guide](performance.md)** - Optimize loading speed
- **[SEO Guide](seo-guide.md)** - Improve search rankings
- **[Monitoring](#performance-monitoring)** - Track real user metrics

---

**Need deployment help?** Open an issue on [GitHub](https://github.com/burgil/issues)
