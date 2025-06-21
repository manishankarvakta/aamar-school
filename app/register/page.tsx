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
    <Button type="submit" className="w-full" disabled={pending}>
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-card-foreground">Create Your School</h1>
          <p className="text-muted-foreground">
            Get started by creating your school and an administrator account.
          </p>
        </div>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>
            <Input id="schoolName" name="schoolName" type="text" placeholder="e.g., Aamar International School" required />
            {state?.errors?.schoolName && <p className="text-red-500 text-sm">{state.errors.schoolName[0]}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Your First Name</Label>
              <Input id="firstName" name="firstName" type="text" placeholder="John" required />
              {state?.errors?.firstName && <p className="text-red-500 text-sm">{state.errors.firstName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Your Last Name</Label>
              <Input id="lastName" name="lastName" type="text" placeholder="Doe" required />
              {state?.errors?.lastName && <p className="text-red-500 text-sm">{state.errors.lastName[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Your Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
              {state?.errors?.email && <p className="text-red-500 text-sm">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Your Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required />
              {state?.errors?.phone && <p className="text-red-500 text-sm">{state.errors.phone[0]}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
              {state?.errors?.password && <p className="text-red-500 text-sm">{state.errors.password[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <SubmitButton />
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
