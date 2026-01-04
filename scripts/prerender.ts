// This script prerenders all routes to static HTML for SSG (static site generation). It does NOT provide runtime SSR.
// All output is static and deployable to any static host.

import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'stream';
import { MemoryRouter } from 'react-router';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Window } from 'happy-dom';
import Beasties from 'beasties';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the base index.html template
const templatePath = path.resolve(__dirname, '../dist/index.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// Read SEO configuration
const seoConfigPath = path.resolve(__dirname, '../src/seo.json');
const seoConfig = JSON.parse(fs.readFileSync(seoConfigPath, 'utf-8'));
const globalConfig = seoConfig._global;

// Read Vite Manifest
const manifestPath = path.resolve(__dirname, '../dist/.vite/manifest.json');
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// Console colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

interface RouteConfig {
    path: string;
    componentPath: string;
    outputPath: string;
    srcPath?: string; // Relative path to source file (e.g., src/pages/home.tsx)
}

interface SEOConfig {
    title: string;
    description: string;
    keywords?: string;
    canonical: string;
    ogType: string;
    ogImage: string;
    twitterCard: string;
    ogImageAlt?: string;
    ogImageWidth?: number;
    ogImageHeight?: number;
    publishedDate?: string;
    sitemap?: {
        changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
        priority: number;
        lastmod?: string;
    };
    schema?: {
        organization?: boolean;
        website?: boolean;
        breadcrumb?: boolean;
        jobPosting?: boolean;
        softwareApplication?: boolean;
        article?: boolean;
    };
}

function generateMetaTags(routePath: string): string {
    const seo: SEOConfig = seoConfig[routePath] || seoConfig['/'];

    // Helper: Ensure we have a fallback for twitterCard
    const twitterCard = seo.twitterCard || globalConfig.twitterCard || 'summary_large_image';

    // Full URLs for images and logo
    const fullImageUrl = seo.ogImage?.startsWith('http') ? seo.ogImage : `${globalConfig.domain}${seo.ogImage}`;
    const logoUrl = globalConfig.logo?.startsWith('http') ? globalConfig.logo : `${globalConfig.domain}${globalConfig.logo}`;
    const twitterHandle = (() => {
        const twitterUrl = globalConfig.social?.twitter || '';
        // Example: https://x.com/qu_stream -> qu_stream
        const parts = twitterUrl.split('/').filter(Boolean);
        const handle = parts[parts.length - 1] || '';
        return handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '';
    })();

    // Determine image MIME type by extension
    const mimeType = (() => {
        try {
            const ext = path.extname((seo.ogImage as string) || '').toLowerCase();
            if (ext === '.webp') return 'image/webp';
            if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
            if (ext === '.png') return 'image/png';
            if (ext === '.tif' || ext === '.tiff') return 'image/tiff';
            return '';
            return '';
        } catch {
            return '';
        }
    })();

    const imageAlt = seo.ogImageAlt || `${seo.title} - ${globalConfig.siteName}`;

    const tags = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    ${seo.keywords ? `<meta name="keywords" content="${seo.keywords}" />` : ''}
    <link rel="canonical" href="${seo.canonical}" />
    
    <!-- Open Graph -->
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:url" content="${seo.canonical}" />
    <meta property="og:image" content="${fullImageUrl}" />
    ${mimeType ? `<meta property="og:image:type" content="${mimeType}" />` : ''}
    <meta property="og:image:secure_url" content="${fullImageUrl}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    ${seo.ogImageWidth ? `<meta property="og:image:width" content="${seo.ogImageWidth}" />` : ''}
    ${seo.ogImageHeight ? `<meta property="og:image:height" content="${seo.ogImageHeight}" />` : ''}
    <meta property="og:logo" content="${logoUrl}" />
    <meta property="og:site_name" content="${globalConfig.siteName}" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${fullImageUrl}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    ${twitterHandle ? `<meta name="twitter:site" content="${twitterHandle}" />` : ''}
    ${twitterHandle ? `<meta name="twitter:creator" content="${twitterHandle}" />` : ''}
    <meta property="og:locale" content="${globalConfig.locale || 'en_US'}" />
    ${seo.schema?.article && seo.sitemap?.lastmod ? `<meta property="article:modified_time" content="${seo.sitemap.lastmod}" />` : ''}
    ${seo.schema?.article && seo.publishedDate ? `<meta property="article:published_time" content="${seo.publishedDate}" />` : ''}
    
    <!-- Additional SEO -->
    <meta name="robots" content="${globalConfig.defaultRobots}" />
    <meta name="googlebot" content="${globalConfig.defaultRobots}" />`;

    return tags;
}

function generateSchemaMarkup(routePath: string): string {
    const seo: SEOConfig = seoConfig[routePath] || seoConfig['/'];
    const schemas = [];

    // Organization Schema (Homepage only)
    if (seo.schema?.organization) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": globalConfig.organization.name,
            "url": globalConfig.organization.url,
            "logo": `${globalConfig.domain}${globalConfig.logo}`,
            "description": globalConfig.organization.description,
            "sameAs": [
                globalConfig.social.twitter,
                globalConfig.social.github,
                globalConfig.social.linkedin
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": globalConfig.contact.type,
                "email": globalConfig.contact.email
            }
        });
    }

    // Website Schema with Sitelinks Search Box (Homepage only)
    if (seo.schema?.website) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": globalConfig.siteName,
            "url": globalConfig.domain,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${globalConfig.domain}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        });
    }

    // Breadcrumb Schema
    if (seo.schema?.breadcrumb && routePath !== '/') {
        const pathParts = routePath.split('/').filter(Boolean);
        const breadcrumbItems = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": globalConfig.domain
            }
        ];

        pathParts.forEach((part, index) => {
            const url = globalConfig.domain + '/' + pathParts.slice(0, index + 1).join('/');
            breadcrumbItems.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": part.charAt(0).toUpperCase() + part.slice(1),
                "item": url
            });
        });

        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems
        });
    }

    // Software Application Schema
    if (seo.schema?.softwareApplication) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": globalConfig.software.name,
            "applicationCategory": globalConfig.software.category,
            "offers": {
                "@type": "Offer",
                "price": globalConfig.software.price.toString(),
                "priceCurrency": globalConfig.software.priceCurrency
            },
            "operatingSystem": globalConfig.software.operatingSystem,
            "description": seo.description
        });
    }

    if (schemas.length === 0) return '';

    return `
    <script type="application/ld+json">
    ${JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2)}
    </script>`;
}

function generateSitemap(routes: RouteConfig[]): string {
    const now = new Date().toISOString();

    const urlEntries = routes.map(route => {
        const seo: SEOConfig = seoConfig[route.path] || seoConfig['/'];

        // Use sitemap config from seo.json or fallback to defaults
        const priority = seo.sitemap?.priority ?? (route.path === '/' ? 1.0 : 0.8);
        const changefreq = seo.sitemap?.changefreq ?? (route.path === '/' ? 'daily' : 'weekly');
        const lastmod = seo.sitemap?.lastmod ?? now;

        return `  <url>
    <loc>${seo.canonical}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function parseRouterForRoutes(): Promise<RouteConfig[]> {
    const routerPath = path.resolve(__dirname, '../src/Router.tsx');
    const routerContent = fs.readFileSync(routerPath, 'utf-8');

    const routes: RouteConfig[] = [];

    // Extract lazy imports to get component mappings
    const lazyImportRegex = /const\s+(\w+)\s*=\s*(?:React\.)?lazy\(\s*\(\)\s*=>\s*import\s*\(\s*["`']([^"`']+)["`']\s*\)\s*\)/g;
    const componentMap: Record<string, string> = {};

    let match;
    while ((match = lazyImportRegex.exec(routerContent)) !== null) {
        const [, componentName, importPath] = match;
        let resolvedPath = importPath;
        if (resolvedPath.startsWith('./')) {
            resolvedPath = resolvedPath.substring(2);
        }
        if (!resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.ts')) {
            resolvedPath += '.tsx';
        }
        const absolutePath = path.resolve(__dirname, '../src', resolvedPath);
        componentMap[componentName] = absolutePath;
    }

    // Extract direct imports too
    const directImportRegex = /import\s+(\w+)\s+from\s+["`']([^"`']+)["`']/g;
    while ((match = directImportRegex.exec(routerContent)) !== null) {
        const [, componentName, importPath] = match;
        if (importPath.startsWith('./')) {
            let resolvedPath = importPath;
            if (resolvedPath.startsWith('./')) {
                resolvedPath = resolvedPath.substring(2);
            }
            if (!resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.ts')) {
                resolvedPath += '.tsx';
            }
            const absolutePath = path.resolve(__dirname, '../src', resolvedPath);
            componentMap[componentName] = absolutePath;
        }
    }

    // Extract index routes
    const indexRouteRegex = /<Route\s+index\s+element\s*=\s*\{?\s*<\s*(\w+)\s*[^>]*\/?\s*>\s*\}?\s*\/?\s*>/g;
    while ((match = indexRouteRegex.exec(routerContent)) !== null) {
        const [, componentName] = match;
        if (componentMap[componentName]) {
            const absolutePath = componentMap[componentName];
            // Convert absolute path to src-relative path for manifest lookup
            // e.g. D:/Projects/vite-react-ssg-pro/src/pages/home.tsx -> src/pages/home.tsx
            const srcPath = path.relative(path.resolve(__dirname, '..'), absolutePath).replace(/\\/g, '/');
            
            routes.push({
                path: '/',
                componentPath: absolutePath,
                outputPath: 'index.html',
                srcPath
            });
        }
    }

    // Extract routes from JSX
    const routeRegex = /<Route\s+path\s*=\s*["`']([^"`'*]+)["`']\s+element\s*=\s*\{?\s*<\s*(\w+)\s*[^>]*\/?\s*>\s*\}?\s*\/?\s*>/gs;

    while ((match = routeRegex.exec(routerContent)) !== null) {
        const [, routePath, componentName] = match;
        let normalizedPath = routePath;

        if (!normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
        }

        if (componentMap[componentName]) {
            const outputPath = normalizedPath === '/' ?
                'index.html' :
                `${normalizedPath.slice(1)}.html`;

            if (outputPath === 'index.html' && routes.some(r => r.outputPath === 'index.html')) {
                continue;
            }

            const absolutePath = componentMap[componentName];
            const srcPath = path.relative(path.resolve(__dirname, '..'), absolutePath).replace(/\\/g, '/');

            routes.push({
                path: normalizedPath,
                componentPath: absolutePath,
                outputPath,
                srcPath
            });
        } else {
            if (componentName !== 'Layout') {
                console.warn(`${colors.yellow}⚠️  Component ${componentName} not found in import map for route ${normalizedPath}${colors.reset}`);
            }
        }
    }

    return routes;
}

async function prerenderRoute(route: RouteConfig): Promise<void> {
    try {
        console.log(`${colors.cyan}🔄 Rendering${colors.reset} ${colors.bright}${route.path}${colors.reset} with component from ${path.basename(route.componentPath)} → ${colors.green}${route.outputPath}${colors.reset}`);

        if (!fs.existsSync(route.componentPath)) {
            throw new Error(`Component file not found: ${route.componentPath}`);
        }

        const componentPath = route.componentPath.replace(/\\/g, '/');
        const fileUrl = `file:///${componentPath}`;

        // console.log(`${colors.blue}📦 Importing:${colors.reset} ${fileUrl}`);

        const componentModule = await import(fileUrl);
        const Component = componentModule.default;

        if (!Component) {
            throw new Error(`No default export found in ${route.componentPath}`);
        }

        const element = createElement(
            MemoryRouter,
            { initialEntries: [route.path] },
            createElement(Component)
        );

        const appHtml = await new Promise<string>((resolve, reject) => {
            let didError = false;

            const pipeable = renderToPipeableStream(element, {
                onShellReady() {
                    // We wait for onAllReady so Suspense boundaries are resolved
                },
                onAllReady() {
                    // console.log(`${colors.green}🔀 Suspense ready for ${route.path}${colors.reset}`);
                    const body = new PassThrough();
                    pipeable.pipe(body);

                    const chunks: Buffer[] = [];
                    body.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
                    body.on('end', () => { clearTimer(); resolve(Buffer.concat(chunks).toString('utf8')); });
                    body.on('error', (err: Error) => { clearTimer(); reject(err); });
                },
                onError(err) {
                    didError = true;
                    // Non-fatal; log and keep rendering
                    console.error(`${colors.red}⚠️ React render error:${colors.reset}`, err);
                },
                onShellError(err) {
                    didError = true;
                    clearTimer();
                    reject(err);
                }
            });

            // Safety timeout: abort rendering if it takes too long
            const timeout = setTimeout(() => {
                if (!didError) {
                    try {
                        pipeable.abort();
                    } catch (err) {
                        console.warn(`${colors.yellow}⚠️ Failed to abort SSR/SSG render:${colors.reset}`, err);
                    }
                    reject(new Error('SSR/SSG render timed out'));
                }
            }, 30_000);
            // Clear timeout on resolve/reject
            const clearTimer = () => clearTimeout(timeout);

            // Attach temporary handlers to ensure the timeout is cleared
            // (The Promise resolves/rejects in onAllReady/onShellError, above.)
        });

        let html = templateHTML;

        // Inject module preloads for lazy chunks
        if (route.srcPath && manifest[route.srcPath]) {
            const chunk = manifest[route.srcPath];
            const preloads = [];
            
            // Preload the component chunk itself
            if (chunk.file && !chunk.file.endsWith('.css')) {
                if (!html.includes(chunk.file)) {
                    preloads.push(`<link rel="modulepreload" href="/${chunk.file}" />`);
                }
            }
            
            // Preload imports (dependencies)
            if (chunk.imports) {
                chunk.imports.forEach((importKey: string) => {
                    const importChunk = manifest[importKey];
                    if (importChunk && importChunk.file && !importChunk.file.endsWith('.css')) {
                        if (!html.includes(importChunk.file)) {
                            preloads.push(`<link rel="modulepreload" href="/${importChunk.file}" />`);
                        }
                    }
                });
            }
            
            if (preloads.length > 0) {
                html = html.replace('</head>', `${preloads.join('\n    ')}\n    </head>`);
            }
        }

        // EXTRA SAFETY: Remove any modulepreload links for CSS files that might have slipped in
        html = html.replace(/<link[^>]+rel="modulepreload"[^>]+href="[^"]+\.css"[^>]*>/g, '');

        // PERFORMANCE: Remove modulepreload for large vendor chunks to reduce "Unused JavaScript" diagnostic.
        // These will be fetched on-demand when the entry script imports them.
        // This defers the network cost of react-dom, framer-motion, etc. until actually needed.
        const vendorChunksToDefer = ['react-dom', 'framer-motion', 'react-router'];
        for (const chunk of vendorChunksToDefer) {
            // Match modulepreload links for this chunk (handles both crossorigin and non-crossorigin variants)
            const regex = new RegExp(`<link[^>]+rel="modulepreload"[^>]+href="[^"]*${chunk}[^"]*\\.js"[^>]*>`, 'g');
            html = html.replace(regex, '');
        }

        // Inject meta tags
        const metaTags = generateMetaTags(route.path);
        html = html.replace('</head>', `${metaTags}\n    </head>`);

        // Inject schema markup
        const schemaMarkup = generateSchemaMarkup(route.path);
        if (schemaMarkup) {
            html = html.replace('</head>', `${schemaMarkup}\n    </head>`);
        }

        // Sanitize rendered content: remove any <script> and <style> tags
        // NOTE: Disabled sanitization as it might remove styles/scripts injected by libraries (e.g. framer-motion)
        // which are expected by React during hydration. Removing them causes hydration mismatch (#418).
        const sanitizedAppHtml = appHtml; // .replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, '');

        // Inject rendered content
        html = html.replace(
            '<div id="root"></div>',
            `<div id="root">${sanitizedAppHtml}</div>`
        );

        const outputPath = path.resolve(__dirname, '../dist', route.outputPath);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Apply Beasties to inline critical CSS
        const distPath = path.resolve(__dirname, '../dist');
        
        // Manual CSS Inlining Strategy:
        // If the CSS file is small (< 50KB), we inline it entirely and skip Beasties.
        // This avoids the "double load" (inline critical + async full) that users find bloated.
        let cssInlined = false;
        // Regex to capture the CSS href. Uses [^>]*? (non-greedy) to avoid consuming the href attribute.
        const cssMatch = html.match(/<link\s+[^>]*?href="(\/assets\/[^"]+\.css)"/);
        if (cssMatch) {
            const cssPath = path.join(distPath, cssMatch[1]);
            if (fs.existsSync(cssPath)) {
                const cssStats = fs.statSync(cssPath);
                if (cssStats.size < 50000) {
                    console.log(`${colors.cyan}⚡ CSS is small (${(cssStats.size / 1024).toFixed(2)}KB), inlining entirely...${colors.reset}`);
                    const cssContent = fs.readFileSync(cssPath, 'utf-8');
                    // Replace all links to this CSS with a single style tag
                    html = html.replace(/<link\s+[^>]*?href="[^"]+\.css"[^>]*>/g, '');
                    // Remove noscript fallback (if any exists from previous runs or templates)
                    html = html.replace(/<noscript><link\s+[^>]*?href="[^"]+\.css"[^>]*><\/noscript>/g, '');
                    // Inject style tag
                    html = html.replace('</head>', `<style>${cssContent}</style>\n    </head>`);
                    cssInlined = true;
                }
            } else {
                 console.warn(`${colors.yellow}⚠️ CSS file not found at ${cssPath}${colors.reset}`);
            }
        } else {
            // console.log('No CSS link found in template');
        }

        if (!cssInlined) {
            const beasties = new Beasties({
                path: distPath,
                publicPath: '/',
                preload: 'swap',
                pruneSource: false, // Don't prune source to avoid breaking other pages sharing the same CSS
                inlineFonts: false, // Don't inline fonts - let the HTML template handle font loading
                preloadFonts: false, // Don't preload fonts - let the HTML template handle it
                compress: true,
                logLevel: 'warn', // Reduce noise
                minimumExternalSize: 50000, // Inline CSS if < 50kb. Eliminates the "double load" (inline + external) for small sites.
                mergeStylesheets: false, // Keep separate <style> tags for better caching
                keyframes: 'critical', // Only inline critical animations
                reduceInlineStyles: false, // Don't process inline <style> tags
                allowRules: [
                    // Force-include interactive/hover states
                    /\.btn.*:hover/,
                    /\.btn.*:active/,
                    /\.btn.*:focus/,
                    /\.nav.*:hover/,
                    /:focus-visible/,
                    /\[data-state/,
                    /^\.sr-only$/,
                    /^\.hidden$/
                ]
            });

            html = await beasties.process(html);
        }

        // Collect CSS files referenced by HTML or JS bundles
        try {
            const distPath = path.resolve(__dirname, '../dist');
            const referencedCss = new Set<string>();
            const assetsDir = path.resolve(distPath, 'assets');
            if (fs.existsSync(assetsDir)) {
                const jsFiles = fs.readdirSync(assetsDir).filter((f) => /\.(js|mjs|cjs)$/.test(f));
                const jsCssRegex = /['"]?\/?assets\/([\w\-.@]+\.css)/g;
                for (const f of jsFiles) {
                    try {
                        const contents = fs.readFileSync(path.resolve(assetsDir, f), 'utf8');
                        let r: RegExpExecArray | null;
                        while ((r = jsCssRegex.exec(contents)) !== null) {
                            referencedCss.add(r[1]);
                        }
                    } catch (e) {
                        console.warn(`${colors.yellow}⚠️ Failed to read asset ${f}:${colors.reset}`, e);
                    }
                }
            }
            // Create placeholder CSS files for any referenced CSS that doesn't exist
            for (const cssFile of referencedCss) {
                const cssPath = path.resolve(distPath, 'assets', cssFile);
                if (!fs.existsSync(cssPath)) {
                    const placeholder = `/* Placeholder for ${cssFile} - created by prerender */\n`;
                    try {
                        fs.writeFileSync(cssPath, placeholder, { flag: 'w' });
                        console.log(`${colors.yellow}ℹ️  Created placeholder CSS:${colors.reset} ${cssFile}`);
                    } catch (err) {
                        console.warn(`${colors.red}⚠️ Failed to create placeholder CSS for ${cssFile}:${colors.reset}`, err);
                    }
                }
            }
        } catch (err) {
            console.warn(`${colors.yellow}⚠️ CSS placeholder generation failed:${colors.reset}`, err);
        }

        fs.writeFileSync(outputPath, html);
        console.log(`${colors.green}✅ Generated${colors.reset} ${route.outputPath} with SEO tags + critical CSS`);

    } catch (error) {
        console.error(`${colors.red}❌ Failed to render${colors.reset} ${route.path}:`, error);
    }
}

async function prerender() {
    try {
        console.log(`${colors.bright}${colors.cyan}🚀 Starting SSR/SSG prerendering with SEO optimization...${colors.reset}\n`);

        const window = new Window();

        // Set up DOM globals for SSR with happy-dom
        const globalAny = global as Record<string, unknown>;
        globalAny.window = window;
        globalAny.document = window.document;
        globalAny.getComputedStyle = window.getComputedStyle.bind(window);

        // Set SSR flags for components to detect
        (global as unknown as { __SSR__: boolean }).__SSR__ = true;
        (window as unknown as { __SSR__: boolean }).__SSR__ = true;
        (globalThis as unknown as { __SSR__: boolean }).__SSR__ = true;

        Object.defineProperty(global, 'navigator', {
            value: window.navigator,
            writable: true,
            configurable: true
        });
        Object.defineProperty(global, 'localStorage', {
            value: window.localStorage,
            writable: true,
            configurable: true
        });
        Object.defineProperty(global, 'sessionStorage', {
            value: window.sessionStorage,
            writable: true,
            configurable: true
        });

        const routes = await parseRouterForRoutes();

        if (routes.length === 0) {
            console.log(`${colors.yellow}⚠️  No routes found in Router.tsx to prerender${colors.reset}`);
            return;
        }

        console.log(`${colors.blue}📄 Found ${routes.length} route(s) in Router.tsx:${colors.reset}`);
        routes.forEach(route => {
            console.log(`   ${colors.bright}${route.path}${colors.reset} → dist/${route.outputPath}`);
        });
        console.log('');

        // Check for missing SEO configs and validate required fields
        const routesWithoutSEO: string[] = [];
        const routesWithIncompleteFields: { path: string; missing: string[] }[] = [];
        const routesWithIncompleteSitemap: { path: string; missing: string[] }[] = [];
        const requiredFields = ['title', 'description', 'canonical', 'ogType', 'ogImage'] as const;
        type RequiredField = (typeof requiredFields)[number];
        const requiredSitemapFields = ['changefreq', 'priority'] as const;
        type RequiredSitemapField = (typeof requiredSitemapFields)[number];

        routes.forEach(route => {
            if (!seoConfig[route.path]) {
                routesWithoutSEO.push(route.path);
            } else {
                // Check for missing required fields
                const config: SEOConfig = seoConfig[route.path];
                const missingFields: string[] = [];

                requiredFields.forEach((field: RequiredField) => {
                    if (!config[field]) {
                        missingFields.push(field);
                    }
                });

                if (missingFields.length > 0) {
                    routesWithIncompleteFields.push({
                        path: route.path,
                        missing: missingFields
                    });
                }

                // Check for missing sitemap fields
                if (config.sitemap) {
                    const sitemap = config.sitemap;
                    const missingSitemapFields: string[] = [];
                    requiredSitemapFields.forEach((field: RequiredSitemapField) => {
                        // Use strict undefined/null check to avoid falsy values like 0 being treated as missing
                        const value = sitemap[field];
                        if (value === undefined || value === null) {
                            missingSitemapFields.push(field);
                        }
                    });

                    if (missingSitemapFields.length > 0) {
                        routesWithIncompleteSitemap.push({
                            path: route.path,
                            missing: missingSitemapFields
                        });
                    }
                } else {
                    // No sitemap config at all
                    routesWithIncompleteSitemap.push({
                        path: route.path,
                        missing: ['sitemap config (changefreq, priority)']
                    });
                }
            }
        });

        // Early issue reporting (Optional)
        // if (routesWithoutSEO.length > 0) {
        //     console.log(`${colors.yellow}⚠️  Warning: ${routesWithoutSEO.length} route(s) missing SEO configuration:${colors.reset}`);
        //     routesWithoutSEO.forEach(path => {
        //         console.log(`   ${colors.yellow}•${colors.reset} ${path}`);
        //     });
        //     console.log('');
        // }

        // if (routesWithIncompleteFields.length > 0) {
        //     console.log(`${colors.yellow}⚠️  Warning: ${routesWithIncompleteFields.length} route(s) missing required SEO fields:${colors.reset}`);
        //     routesWithIncompleteFields.forEach(item => {
        //         console.log(`   ${colors.yellow}•${colors.reset} ${colors.bright}${item.path}${colors.reset} missing: ${colors.red}${item.missing.join(', ')}${colors.reset}`);
        //     });
        //     console.log('');
        // }

        for (const route of routes) {
            await prerenderRoute(route);
        }

        // Generate sitemap.xml
        console.log(`\n${colors.magenta}🗺️  Generating sitemap.xml...${colors.reset}`);
        const sitemap = generateSitemap(routes);
        const sitemapPath = path.resolve(__dirname, '../dist/sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap);
        console.log(`${colors.green}✅ Generated sitemap.xml${colors.reset}`);

        // Generate robots.txt
        console.log(`${colors.magenta}🤖 Generating robots.txt...${colors.reset}`);
        const robots = `User-agent: *
Allow: /
Sitemap: ${globalConfig.domain}/sitemap.xml`;
        const robotsPath = path.resolve(__dirname, '../dist/robots.txt');
        fs.writeFileSync(robotsPath, robots);
        console.log(`${colors.green}✅ Generated robots.txt${colors.reset}`);

        // Final summary
        console.log(`\n${colors.bright}${colors.green}🎉 Successfully prerendered ${routes.length} page(s) with full SEO!${colors.reset}`);

        const totalIssues = routesWithoutSEO.length + routesWithIncompleteFields.length + routesWithIncompleteSitemap.length;

        if (totalIssues > 0) {
            console.log(`\n${colors.yellow}${colors.bright}⚠️  SEO WARNINGS (${totalIssues} total):${colors.reset}`);

            if (routesWithoutSEO.length > 0) {
                console.log(`\n${colors.yellow}Routes using fallback SEO from "/" (${routesWithoutSEO.length}):${colors.reset}`);
                routesWithoutSEO.forEach(path => {
                    console.log(`   ${colors.yellow}•${colors.reset} ${path}`);
                });
            }

            if (routesWithIncompleteFields.length > 0) {
                console.log(`\n${colors.yellow}Routes with incomplete SEO fields (${routesWithIncompleteFields.length}):${colors.reset}`);
                routesWithIncompleteFields.forEach(item => {
                    console.log(`   ${colors.yellow}•${colors.reset} ${colors.bright}${item.path}${colors.reset} → missing: ${colors.red}${item.missing.join(', ')}${colors.reset}`);
                });
            }

            if (routesWithIncompleteSitemap.length > 0) {
                console.log(`\n${colors.yellow}Routes with incomplete sitemap fields (${routesWithIncompleteSitemap.length}):${colors.reset}`);
                routesWithIncompleteSitemap.forEach(item => {
                    console.log(`   ${colors.yellow}•${colors.reset} ${colors.bright}${item.path}${colors.reset} → missing: ${colors.red}${item.missing.join(', ')}${colors.reset}`);
                });

                console.log(`\n${colors.cyan}💡 Fix: Add complete sitemap config (changefreq, priority) to seo.json for these routes${colors.reset}`);
            }

            console.log(`\n${colors.cyan}💡 Fix: Add complete SEO config to seo.json for these routes${colors.reset}`);
        }

        window.close();
    } catch (error) {
        console.error(`${colors.red}❌ Pre-render failed:${colors.reset}`, error);
        process.exit(1);
    }
}

prerender();
