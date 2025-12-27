import { motion } from 'framer-motion';
import { Zap, Code, Palette, Rocket } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Vite's instant HMR keeps you in the flow with sub-100ms updates.",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: Code,
    title: "TypeScript Ready",
    description: "Fully typed components with ESLint and Prettier configured.",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    icon: Palette,
    title: "Tailwind CSS 4",
    description: "Modern utility-first styling with the latest Tailwind features.",
    gradient: "from-cyan-400 to-teal-500"
  },
  {
    icon: Rocket,
    title: "Production Ready",
    description: "Optimized build with code splitting and lazy loading out of the box.",
    gradient: "from-purple-400 to-pink-500"
  }
];

export default function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black gradient-text mb-4"
          >
            Powerful Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Everything you need to build amazing web applications
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-panel p-8 rounded-2xl group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
