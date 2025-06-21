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
            Simplify School  <span className="text-accent">Operations. </span>
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
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
              <span className="mr-2">▶</span> Watch Video
            </Button>
          </motion.div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-accent rounded-full inline-block" /> Experienced mentor</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-accent rounded-full inline-block" /> Quality Videos</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><span className="w-2 h-2 bg-accent rounded-full inline-block" /> Affordable prices</span>
          </div>
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-8 mt-10 items-center justify-center md:justify-start opacity-80">
            <Image src="/logos/udemy.png" alt="Udemy" width={100} height={32} />
            <Image src="/logos/coursera.png" alt="Coursera" width={100} height={32} />
            <Image src="/logos/facebook.png" alt="Facebook" width={100} height={32} />
            <Image src="/logos/google.png" alt="Google" width={100} height={32} />
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
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
    </section>
  );
} 