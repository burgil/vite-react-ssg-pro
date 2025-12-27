import { Outlet, useLocation } from 'react-router';
import { type FC, Suspense, lazy, useEffect } from 'react';
import SEOTitle from './components/SEOTitle';
import LoadingScreen from './components/LoadingScreen';
const Navbar = lazy(() => import('@/components/Navbar'));
import Footer from './components/Footer';

const Layout: FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const content = (
    <>
      <SEOTitle />
      <main data-beasties-container className="min-h-screen bg-black selection:bg-blue-500/30 selection:text-blue-200 font-sans text-white">
        <Suspense fallback={<div className="h-16" />}>
          <Navbar />
        </Suspense>
        <Outlet />
        <Footer />
      </main>
    </>
  );

  return (
    <Suspense fallback={<LoadingScreen />}>
      {content}
    </Suspense>
  );
};

export default Layout;
