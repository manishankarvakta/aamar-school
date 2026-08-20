'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden select-none">
      {/* Premium ambient glowing background mesh-blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col items-center max-w-lg text-center">
        
        {/* Animated "404" gradient visual */}
        <div className="relative mb-6 flex items-center justify-center">
          <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary/80 select-none animate-pulse">
            404
          </h1>
          {/* Decorative rings rotating slowly */}
          <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-110 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-0 border border-primary/10 rounded-full scale-125 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
        </div>

        {/* Logo Icon Badge */}
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 transform transition-transform duration-300 hover:scale-105">
          <span className="text-primary-foreground font-black text-lg tracking-tighter">AS</span>
        </div>

        {/* Heading & description */}
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি!
        </h2>
        <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed max-w-md">
          দুঃখিত, আপনি যে লিংকটি খুঁজছেন সেটি হয়তো পরিবর্তন করা হয়েছে অথবা এর কোনো অস্তিত্ব নেই। অনুগ্রহ করে লিংকটি আবার পরীক্ষা করে দেখুন।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 h-11 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-sm transition-all duration-200 hover:-translate-x-1 active:translate-x-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>পেছনে যান</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:opacity-95 transition-all duration-200 hover:scale-[1.02] active:scale-100"
          >
            <Home className="w-4 h-4" />
            <span>হোম পেজে যান</span>
          </Link>
        </div>

        {/* Quick Links Section */}
        <div className="w-full border-t border-border/60 pt-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-4">
            সহায়ক কিছু লিংক
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/login" className="text-xs font-semibold text-foreground/75 hover:text-primary transition-colors">
              লগইন পোর্টাল
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hidden sm:inline" />
            <Link href="/dashboard" className="text-xs font-semibold text-foreground/75 hover:text-primary transition-colors">
              ড্যাশবোর্ড
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hidden sm:inline" />
            <Link href="/docs" className="text-xs font-semibold text-foreground/75 hover:text-primary transition-colors">
              ডকুমেন্টেশন
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hidden sm:inline" />
            <Link href="/contact" className="text-xs font-semibold text-foreground/75 hover:text-primary transition-colors">
              হেল্প সেন্টার
            </Link>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-1 text-[10px] text-muted-foreground font-medium">
        <span>Powered by</span>
        <span className="font-semibold text-foreground/80">TechSoul</span>
      </div>
    </div>
  );
}
