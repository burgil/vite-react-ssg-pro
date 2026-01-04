import PageHeader from '@/components/PageHeader';
import { m as motion } from 'framer-motion';
import { Code, Zap, Package } from 'lucide-react';

export default function AboutPage() {
  const features = [
    { icon: Code, title: 'Clean Code', description: 'TypeScript + ESLint configured' },
    { icon: Zap, title: 'Fast Dev', description: 'Vite HMR for instant updates' },
    { icon: Package, title: 'Ready to Ship', description: 'Build & deploy out of the box' }
  ];

  return (
    <main className="min-h-screen bg-[#020204] font-sans text-white">
      <PageHeader title="About This Template" description="A production-ready Vite + React 19 template with SSG, achieving 100/100 PageSpeed scores." />

      <section className="py-16 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400 mb-8">
            This repository contains a reusable Vite + React template with minimal pages and components to get you started quickly.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 rounded-lg border border-white/10"
              >
                <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
