import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './Layout'

const Home = lazy(() => import('./pages/home'))
const About = lazy(() => import('./pages/about'))
const SuspenseExample = lazy(() => import('./pages/SuspenseExample'))

function Router() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="suspense-example" element={<SuspenseExample />} />
            <Route
              path='*'
              element={
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                  <h1 className="text-3xl font-bold mb-4">404</h1>
                  <Link to="/" className="text-green-400 hover:text-green-300">Home</Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default Router
