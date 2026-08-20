'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { registerSchoolAndAdmin } from '../actions/auth';
import { useEffect } from 'react';
import { ShieldCheck, GraduationCap } from 'lucide-react';

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  schoolId?: string;
  aamarId?: string;
  redirectTo?: string;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create School & Admin Account'}
    </Button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState<FormState, FormData>(registerSchoolAndAdmin, null);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Registration Successful',
        description: state.message,
      });
      router.push('/login?message=registration-complete');
    } else if (state && !state.success) {
      toast({
        title: 'Registration Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);

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
            <span>Institution Setup Access</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Register your institution to get <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">smart controls</span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Quickly onboard your school, setup admin controls, register students, and automatically organize classes and sections.
          </p>

          {/* Testimonial / Stat Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300" />
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Administrative Intelligence</p>
                <p className="text-xs text-zinc-400 leading-normal">
                  "Manage billing, design routines, check attendance stats, and view exam grades from a unified multi-tenant dashboard."
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

      {/* Right side: Registration Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-xl space-y-8">
          
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
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Create Your School</h2>
            <p className="text-sm text-muted-foreground">
              Get started by creating your school and an administrator account.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            
            {/* School Name */}
            <div className="space-y-1.5">
              <Label htmlFor="schoolName" className="text-sm font-medium text-foreground">School Name</Label>
              <Input 
                id="schoolName" 
                name="schoolName" 
                type="text" 
                placeholder="e.g., Aamar International School" 
                required 
                className="h-11 rounded-xl"
              />
              {state?.errors?.schoolName && <p className="text-destructive text-xs font-semibold">{state.errors.schoolName[0]}</p>}
            </div>

            {/* Admin Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">Your First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  placeholder="John" 
                  required 
                  className="h-11 rounded-xl"
                />
                {state?.errors?.firstName && <p className="text-destructive text-xs font-semibold">{state.errors.firstName[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Your Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  placeholder="Doe" 
                  required 
                  className="h-11 rounded-xl"
                />
                {state?.errors?.lastName && <p className="text-destructive text-xs font-semibold">{state.errors.lastName[0]}</p>}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Your Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  required 
                  className="h-11 rounded-xl"
                />
                {state?.errors?.email && <p className="text-destructive text-xs font-semibold">{state.errors.email[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Your Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+1234567890" 
                  required 
                  className="h-11 rounded-xl"
                />
                {state?.errors?.phone && <p className="text-destructive text-xs font-semibold">{state.errors.phone[0]}</p>}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-11 rounded-xl"
                />
                {state?.errors?.password && <p className="text-destructive text-xs font-semibold">{state.errors.password[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
