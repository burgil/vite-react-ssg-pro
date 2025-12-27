import { defineConfig, type PluginOption, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";
import viteCompression from "vite-plugin-compression";
import Inspect from "vite-plugin-inspect";
import { qrcode } from "vite-plugin-qrcode";
import { beasties } from "vite-plugin-beasties";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import tailwindcss from '@tailwindcss/vite';
// import reactScan from '@react-scan/vite-plugin-react-scan';

/* ========================================
 * 🔧 GLOBAL PROJECT CONFIGURATION
 * ========================================
 * Customize these settings for your project.
 * These values control optimization behavior,
 * prerendering, and critical path performance.
 */
const PROJECT_CONFIG = {
  // Files to warmup during dev server start for faster initial load
  warmupFiles: [
    './src/main.tsx',
    './src/Router.tsx',
    './src/pages/home.tsx',
    './src/components/Hero.tsx',
  ],

  // Manual chunk splitting for vendor libraries
  // Adjust based on your project's dependencies
  vendorChunks: {
    // Vendor chunks
    'react-vendor': ['react', 'react-dom', 'react-router'],
    'framer-motion': ['framer-motion'],
    // Split Lucide icons into separate chunk to enable tree-shaking
    'lucide-icons': ['lucide-react'],
    'react-icons': ['react-icons'],
  },

  // Beasties (Critical CSS) configuration
  beastiesConfig: {
    inlineThreshold: 0, // Always inline critical CSS
    minimumExternalSize: 5000, // If external CSS < 5kb after pruning, inline it all
    pruneSource: true, // Remove inlined CSS from external stylesheets
    mergeStylesheets: false, // Keep separate <style> tags for better caching
    preload: 'swap' as const,
    noscriptFallback: true,
    inlineFonts: false, // Don't inline fonts - let the HTML template handle font loading
    preloadFonts: false, // Don't preload fonts - let the HTML template handle it
    compress: true,
    logLevel: 'warn' as const,
    keyframes: 'critical', // Only inline critical animations
    reduceInlineStyles: false, // Don't process inline <style> tags
    // Force-include interactive/hover states for better UX
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
    passes: 3, // 3-pass compression for maximum size reduction
    dropConsole: true, // Remove console.log in production
    dropDebugger: true,
    ecma: 2020 as const,
    hoist_funs: true,
    hoist_props: true,
    pure_getters: true,
    toplevel: true,
  }
};

/* https://vitejs.dev/config/ */
export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  const enableAnalyzer = process.env.ANALYZE === 'true';

  const possiblePlugins: (PluginOption | false | undefined)[] = [
    react(),
    tailwindcss(),
    !isProduction && Inspect(),
    !isProduction && qrcode(),
    isProduction && beasties({
      options: {
        external: true,
        ...PROJECT_CONFIG.beastiesConfig,
      },
    }),
    // Enable compression only when explicitly requested via env var.
    // This prevents compressed assets from being generated before prerendering runs.
    process.env.VITE_BUILD_COMPRESSION === 'true' && viteCompression({
      algorithm: 'gzip',
      deleteOriginFile: false,
    }),
    process.env.VITE_BUILD_COMPRESSION === 'true' && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
    }),
    enableAnalyzer && visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'sunburst',
    }),
    checker({
      typescript: {
        root: '.',
        tsconfigPath: './tsconfig.json',
        buildMode: true,
      },
      overlay: {
        initialIsOpen: false,
        position: 'br',
      },
      terminal: true,
      eslint: {
        lintCommand: 'eslint .',
        useFlatConfig: true
      }
    })
  ];

  const sharedPlugins = possiblePlugins.filter((plugin): plugin is PluginOption => Boolean(plugin));

  const config: UserConfig = {
    build: {
      target: 'es2020',
      cssMinify: 'lightningcss',
      chunkSizeWarningLimit: 1000,
      modulePreload: {
        polyfill: false, // Beasties handles preloading
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks based on PROJECT_CONFIG
            for (const [chunkName, modules] of Object.entries(PROJECT_CONFIG.vendorChunks)) {
              if (modules.some(mod => id.includes(`node_modules/${mod}`))) {
                return chunkName;
              }
            }
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        parse: {
          ecma: 2020,
        },
        compress: {
          arrows: true,
          booleans: true,
          collapse_vars: true,
          comparisons: true,
          dead_code: true,
          drop_console: PROJECT_CONFIG.terserConfig.dropConsole && isProduction,
          drop_debugger: PROJECT_CONFIG.terserConfig.dropDebugger,
          ecma: PROJECT_CONFIG.terserConfig.ecma,
          hoist_funs: PROJECT_CONFIG.terserConfig.hoist_funs,
          hoist_props: PROJECT_CONFIG.terserConfig.hoist_props,
          passes: PROJECT_CONFIG.terserConfig.passes,
          pure_getters: PROJECT_CONFIG.terserConfig.pure_getters,
          toplevel: PROJECT_CONFIG.terserConfig.toplevel,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
        module: true,
        toplevel: true,
      }
    },
    plugins: sharedPlugins,
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      target: 'es2020',
    },
    server: {
      warmup: {
        clientFiles: PROJECT_CONFIG.warmupFiles,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  };

  return config;
});
