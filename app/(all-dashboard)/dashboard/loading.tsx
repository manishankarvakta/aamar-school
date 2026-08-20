'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/40 overflow-hidden relative">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Spinner and Logo */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Spinner ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-violet-500 animate-spin" style={{ animationDuration: '1s' }} />
        
        {/* Pulsing inner dot */}
        <div className="absolute w-16 h-16 rounded-full border border-dashed border-primary/20 animate-pulse" />
        
        {/* Core logo badge */}
        <div className="absolute w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-black text-sm tracking-tighter">AS</span>
        </div>
      </div>

      {/* Loading texts */}
      <h3 className="text-lg font-bold text-foreground mb-1">Retrieving Dashboard Data</h3>
      <p className="text-xs text-muted-foreground animate-pulse">Syncing configurations and rendering components...</p>

      {/* Skeleton placeholders for visual interest */}
      <div className="w-full max-w-md mt-8 space-y-3 opacity-60">
        <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full animate-pulse" />
          <div className="h-3 bg-muted rounded-full w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
