'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('data', data);

      if (res.ok) {
        Cookies.set('auth_token', data.token, { expires: 1 }); // Expires in 1 day
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        if (data.role === 'SUPER_ADMIN') {
          router.push('/dashboard/super-admin');
        } else if (data.role === 'STUDENT') {
          router.push('/dashboard/student-dashboard');
        } else if (data.role === 'PARENT') {
          router.push('/dashboard/parent-dashboard');
        } else if (data.role === 'TEACHER') {
          router.push('/dashboard/teacher-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({
          title: 'Login Failed',
          description: data.error || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-background">
      
      {/* Left side: Premium Animated Image / Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
        
        {/* Background ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Decorative Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Section - Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-2 font-bold text-xl">
          <div className="w-9 h-9 bg-white text-zinc-950 rounded-xl flex items-center justify-center shadow-lg font-black text-base">
            AS
          </div>
          <span className="text-white tracking-tight">Aamar <span className="text-indigo-400 font-normal">School</span></span>
        </Link>

        {/* Middle Section - Visual Info */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Portal access</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Manage your school with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">AI-Powered</span> tools
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            All-in-one smart school management system designed to connect educators, parents, and students in one digital ecosystem.
          </p>

          {/* Testimonial / Stat Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300" />
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Aamar School Dashboard</p>
                <p className="text-xs text-zinc-400 leading-normal">
                  "Empowering education through seamless automation, smart grading, and real-time routine synchronization."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 flex justify-between text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Aamar School</span>
          <span>Powered by TechSoul</span>
        </div>

      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile brand logo (visible only on lg:hidden) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-2">
              <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg font-black text-sm">
                AS
              </div>
              <span className="text-primary tracking-tight">Aamar <span className="text-foreground font-normal">School</span></span>
            </Link>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Smart Management System</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome Back!</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
