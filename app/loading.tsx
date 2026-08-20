'use client';

import React, { useEffect, useState } from 'react';

export default function Loading() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const statuses = [
    'Initializing Aamar School...',
    'Loading academic database...',
    'Configuring secure portal...',
    'Establishing connection...',
    'Optimizing dashboard views...',
    'Ready to learn...'
  ];

  // Rotate loading text messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress bar percentage increment
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // reset to loop smoothly during loading
        }
        const increment = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + increment, 100);
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden select-none">
      {/* Premium background glowing mesh-blobs */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Main Loader Container */}
      <div className="relative flex flex-col items-center text-center px-4 max-w-sm">
        
        {/* Animated Logo & Spinner section */}
        <div className="relative mb-8 flex items-center justify-center w-32 h-32">
          {/* Animated gradient outer glowing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-l-violet-500 animate-spin" style={{ animationDuration: '1.2s' }} />
          
          {/* Inner pulsating ring */}
          <div className="absolute w-24 h-24 rounded-full border border-dotted border-primary/40 animate-pulse" />
          
          {/* Central Logo Badge */}
          <div className="absolute w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 transform transition-transform duration-300 hover:scale-105">
            <span className="text-primary-foreground font-black text-2xl tracking-tighter">AS</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-1.5 justify-center">
          <span className="text-primary">Aamar</span>
          <span className="relative text-foreground">
            School
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-violet-500 rounded-full" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mb-8">
          Smart School Management System
        </p>

        {/* Progress bar container */}
        <div className="w-56 h-1.5 bg-muted rounded-full overflow-hidden mb-3 relative border border-border/10">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage & Status text */}
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs font-mono font-semibold text-foreground/50">
            {progress}%
          </span>
          <div className="h-6 overflow-hidden">
            <p className="text-xs text-foreground/80 font-medium tracking-wide animate-pulse">
              {statuses[statusIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Credits */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-1 text-[10px] text-muted-foreground font-medium">
        <span>Powered by</span>
        <span className="font-semibold text-foreground/80">TechSoul</span>
      </div>
    </div>
  );
}
