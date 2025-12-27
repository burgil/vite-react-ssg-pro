import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-12 md:pt-48 md:pb-24 overflow-hidden bg-[#020204]">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1b26_0%,#020204_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight font-sans">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed font-light border-l border-blue-500/30 pl-6">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

