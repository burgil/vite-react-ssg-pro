import { FaGithub, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 mt-20">
      <div className="container mx-auto px-6">
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Policy Links */}
            <div className="flex gap-6 text-sm order-2 md:order-1">
              <Link to="/privacypolicy" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">Terms of Service</Link>
              <Link to="/cookiepolicy" className="text-gray-600 hover:text-purple-600 transition-colors">Cookie Policy</Link>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 order-1 md:order-2">
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                href="https://github.com/burgil"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <FaGithub className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                href="https://youtube.com/@BurgilBuilds"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <FaYoutube className="w-5 h-5" />
              </motion.a>
            </div>

            {/* Copyright */}
            <div className="text-gray-600 text-sm order-3 flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Create App
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
