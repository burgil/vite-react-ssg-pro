import { useEffect, useState, type ReactElement } from 'react';
import { useLocation } from 'react-router';

type SeoEntry = { title?: string } & Record<string, unknown>;
type SeoMap = Record<string, SeoEntry> & { _global?: Record<string, unknown> };

export default function SEOTitle(): ReactElement | null {
  const location = useLocation();
  const [seo, setSeo] = useState<SeoMap | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const module = await import('../../seo.json');
        if (mounted) setSeo(module.default || module);
      } catch (err) {
        // If import fails, silently ignore
        console.warn('SEOTitle: Failed to load seo.json', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!seo) return;
    const path = location.pathname || '/';
    const config = seo[path] || seo['/'];
    if (!config) return;
    const title = (config.title as string) || (seo?._global?.siteName as string) || document.title;
    if (title && document.title !== title) {
      document.title = title;
    }
  }, [location, seo]);

  return null;
}
