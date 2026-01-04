import { Link } from 'react-router';
import { FaGithub, FaYoutube } from 'react-icons/fa';
import { m as motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Suspense Example', href: '/suspense-example' },
    { name: 'About', href: '/about' }
  ];
  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-4 left-0 right-0 z-50 mx-4"
      >
        <div className="container mx-auto px-6 py-4 glass-panel rounded-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold"
              >
                C
              </motion.div>
              <span className="text-xl font-bold gradient-text">Create App</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex gap-3 items-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-purple-600 transition-colors"
                href="https://github.com/burgil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-purple-600 transition-colors"
                href="https://youtube.com/@GenZv1Dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5" />
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href="https://payhip.com/b/OaDoU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Pro
                </a>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 backdrop-blur-lg bg-white/90 pt-28 px-6 md:hidden"
        >
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-xl font-medium text-gray-700 hover:text-purple-600 transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-6 items-center pt-4 border-t border-gray-200">
                <a href="https://github.com/burgil" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-600">GitHub</a>
                <a href="https://youtube.com/@GenZv1Dev" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-purple-600">YouTube</a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
