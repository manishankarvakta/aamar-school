'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[75vh] p-6">
      <div className="relative max-w-md w-full bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl overflow-hidden text-center">
        {/* Neon Glow Blobs */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Padlock / Shield Icon */}
          <div className="mx-auto w-16 h-16 bg-red-50/80 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl flex items-center justify-center text-red-500 shadow-inner animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">
              Access Restricted
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Your staff account does not have authorization to view this page. Please contact the administrator to update your route permissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button 
              variant="outline" 
              className="gap-2 rounded-xl h-11"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link href="/dashboard" passHref className="flex-1">
              <Button className="w-full gap-2 rounded-xl h-11 shadow-lg shadow-primary/15">
                <Home className="w-4 h-4" />
                Dashboard Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PermissionGuard({
  permission,
  action = 'view',
  children,
}: {
  permission: string;
  action?: string;
  children: React.ReactNode;
}) {
  const { role, permissions, loading, isAdmin } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <div className="absolute text-[10px] font-bold text-primary animate-pulse">AS</div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  // Check custom permission
  const hasPerm = permissions?.[permission]?.[action] === true;

  if (!hasPerm) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}
