import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from '@/Router';
import { LazyMotion, domAnimation } from "framer-motion"

const rootElement = document.getElementById('root')!;

// Replaced hydrateRoot with createRoot to resolve persistent hydration mismatch errors (#418).
// This ensures the client-side app fully takes over the DOM, fixing issues with
// SSR-incompatible components while preserving the SEO benefits of the pre-rendered HTML.
createRoot(rootElement).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <Router />
    </LazyMotion>
  </StrictMode>
);
