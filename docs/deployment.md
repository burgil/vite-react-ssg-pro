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

## Vercel

**Why Vercel?**
- 🚀 Created by Next.js team
- 💰 Generous free tier
- 🔧 Zero-config deployment
- 📊 Web Vitals monitoring

### Deploy via GitHub

1. **Push to GitHub** (see above)

2. **Import to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `pnpm build`
     - **Output Directory**: `dist`

3. **Deploy**:
   - Click **Deploy**
   - Live at `your-project.vercel.app`

### Deploy via CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
pnpm build
vercel --prod
```

**Custom Domain**:
- Go to **Settings** → **Domains**
- Add domain and update DNS

---

## Netlify

**Why Netlify?**
- 🌐 Great free tier
- 🔄 Continuous deployment
- 📝 Form handling
- 🔐 Identity/auth services

### Deploy via GitHub

1. **Push to GitHub** (see above)

2. **Connect to Netlify**:
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click **Add new site** → **Import existing project**
   - Connect GitHub repo
   - Configure:
     - **Build command**: `pnpm build`
     - **Publish directory**: `dist`

3. **Deploy**:
   - Click **Deploy site**
   - Live at `random-name.netlify.app`

### Deploy via CLI

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Login
netlify login

# Deploy
pnpm build
netlify deploy --prod --dir=dist
```

**Custom Domain**:
- Go to **Domain settings**
- Add custom domain

---

## GitHub Pages

**Why GitHub Pages?**
- 💰 100% free for public repos
- 🔗 Integrates with GitHub
- 🌐 HTTPS by default

### Setup

1. **Install gh-pages**:
```bash
pnpm add -D gh-pages
```

2. **Add deploy script** to `package.json`:
```json
{
  "scripts": {
    "deploy": "pnpm build && gh-pages -d dist"
  }
}
```

3. **Update base path** in `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',  // Replace with your repo name
  // ... other config
});
```

4. **Deploy**:
```bash
pnpm deploy
```

5. **Enable GitHub Pages**:
   - Go to repo **Settings** → **Pages**
   - Source: `gh-pages` branch
   - Live at `yourusername.github.io/your-repo-name`

**Custom Domain**:
- Add `CNAME` file to `public/`:
```
yourdomain.com
```

---

## AWS S3 + CloudFront

**Why AWS?**
- 🏢 Enterprise-grade
- 🌐 Global CDN
- 💰 Pay-as-you-go pricing (~$1-5/mo for small sites)

### Setup

1. **Create S3 Bucket**:
   - Name: `your-app-bucket`
   - Region: `us-east-1` (or closest to users)
   - Disable **Block all public access**

2. **Enable Static Website Hosting**:
   - Go to **Properties** → **Static website hosting**
   - Enable and set index document to `index.html`

3. **Add Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-app-bucket/*"
  }]
}
```

4. **Upload Files**:
```bash
# Install AWS CLI
brew install awscli  # or download from AWS

# Configure
aws configure

# Upload
pnpm build
aws s3 sync dist/ s3://your-app-bucket --delete
```

5. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket website endpoint
   - Enable HTTPS
   - Default root object: `index.html`

**Result**: Fast global CDN with custom domain support.

---

## Docker + VPS

**Why Docker?**
- 🖥️ Full control
- 🔧 Custom configurations
- 💰 ~$5/mo (DigitalOcean, Linode, etc.)

### Dockerfile

```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Deploy

```bash
# Build image
docker build -t your-app .

# Run container
docker run -d -p 80:80 your-app

# Or use docker-compose
docker-compose up -d
```

---

## Environment Variables

### Build-Time Variables

Create `.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_GA_ID=G-XXXXXXXXXX
```

Access in code:
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

### Platform-Specific

**Cloudflare Pages**:
- Dashboard → **Settings** → **Environment variables**

**Vercel**:
- Dashboard → **Settings** → **Environment Variables**

**Netlify**:
- Dashboard → **Site settings** → **Environment variables**

---

## Custom Domains

### DNS Setup

Point your domain to the platform:

**Cloudflare Pages**:
```
CNAME  www  your-project.pages.dev
CNAME  @    your-project.pages.dev
```

**Vercel**:
```
CNAME  www  cname.vercel-dns.com
A      @    76.76.21.21
```

**Netlify**:
```
CNAME  www  your-site.netlify.app
A      @    75.2.60.5
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

### Vercel
- Go to **Deployments**
- Find previous build → **Promote to Production**

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

**Vercel**: Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify**: Create `public/_redirects`:
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
