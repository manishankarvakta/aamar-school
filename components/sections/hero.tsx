'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
          >
            Simplify School <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Operations.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0"
          >
          Manage admissions, attendance, staff, classes, fees, and performance—all in one platform designed for modern schools.  
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-6"
          >
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              <span className="mr-2">▶</span> Watch Video
            </Button>
          </motion.div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full inline-block" /> Experienced mentor</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full inline-block" /> Quality Videos</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full inline-block" /> Affordable prices</span>
          </div>
          {/* Trust Badges */}
          <div className="mt-10 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Trusted by Educators Worldwide
            </p>
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start opacity-75">
              <div className="px-3 py-1.5 rounded-md bg-muted text-foreground font-semibold text-sm border border-border/40 hover:opacity-100 transition-opacity">
                Stanford Ed
              </div>
              <div className="px-3 py-1.5 rounded-md bg-muted text-foreground font-semibold text-sm border border-border/40 hover:opacity-100 transition-opacity">
                Global Academy
              </div>
              <div className="px-3 py-1.5 rounded-md bg-muted text-foreground font-semibold text-sm border border-border/40 hover:opacity-100 transition-opacity">
                EduLearn
              </div>
              <div className="px-3 py-1.5 rounded-md bg-muted text-foreground font-semibold text-sm border border-border/40 hover:opacity-100 transition-opacity">
                Vanguard Schools
              </div>
            </div>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center md:justify-end">
          <Image
            src="/hero.png"
            alt="Girl with books illustration"
            width={400}
            height={400}
            className="w-full max-w-xs md:max-w-md lg:max-w-lg"
          />
        </div>
      </div>
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
    </section>
  );
} 