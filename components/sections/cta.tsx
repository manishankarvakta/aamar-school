'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of schools that have streamlined their operations and
            enhanced their educational experience with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-700 hover:bg-white/90 border-none font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 transition-all"
            >
              Schedule Demo
            </Button>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-sm text-white/80"
          >
            No credit card required. 14-day free trial.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
} 