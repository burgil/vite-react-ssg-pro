import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20">
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-20 w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20 blur-xl"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-20 w-32 h-32 bg-linear-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"
      />
      
      <div className="container mx-auto px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Vite + React + TypeScript</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="gradient-text">Build Amazing</span>
            <br />
            <span className="text-gray-800">Web Apps Fast</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A modern starter template with everything you need: beautiful animations, icons, routing, and more. Start building in seconds.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/about" 
                className="group px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a 
                href="https://github.com/burgil" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-8 py-4 glass-panel rounded-xl font-semibold text-gray-700 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
              >
                View on GitHub
                <Star className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Built with Vite for instant HMR' },
              { icon: Sparkles, title: 'Beautiful UI', desc: 'Smooth animations with Framer Motion' },
              { icon: Star, title: 'Modern Stack', desc: 'React 19 + TypeScript + Tailwind' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-2xl text-center"
              >
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
