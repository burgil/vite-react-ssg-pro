import { useEffect, type ReactElement } from 'react';
import { useLocation } from 'react-router';
import seoJson from '@/seo.json';

type SeoEntry = { title?: string } & Record<string, unknown>;
type SeoMap = Record<string, SeoEntry> & { _global?: Record<string, unknown> };

const seo = seoJson as SeoMap;

export default function SEOTitle(): ReactElement | null {
  const location = useLocation();

  useEffect(() => {
    if (!seo) return;
    const path = location.pathname || '/';
    const config = seo[path] || seo['/'];
    if (!config) return;
    const title = (config.title as string) || (seo?._global?.siteName as string) || document.title;
    if (title && document.title !== title) {
      document.title = title;
    }
  }, [location]);

  return null;
}
