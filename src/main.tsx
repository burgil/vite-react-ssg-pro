import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from '@/Router';
import { LazyMotion, domAnimation } from "framer-motion"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <Router />
    </LazyMotion>
  </StrictMode>,
)
