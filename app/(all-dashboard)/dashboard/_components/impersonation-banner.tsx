'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { stopImpersonation } from '@/app/actions/super-admin';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useTransition } from 'react';

export function ImpersonationBanner({ schoolName }: { schoolName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      const res = await stopImpersonation();
      if (res.success) {
        // Use window.location.href to fully refresh and clear react context state safely
        window.location.href = '/dashboard/super-admin';
      }
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs md:text-sm font-bold py-2 px-6 flex items-center justify-between shadow-md border-b border-amber-400/20 shrink-0 relative z-50">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4.5 w-4.5 animate-pulse text-amber-100" />
        <span>
          Impersonating School: <span className="underline decoration-wavy decoration-amber-200">{schoolName}</span> (Viewing as Administrator)
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleExit}
        disabled={isPending}
        className="text-white hover:text-amber-600 hover:bg-white h-7 text-xs font-bold gap-1 rounded-lg border border-white/20 transition-all duration-200"
      >
        <LogOut className="h-3.5 w-3.5" />
        {isPending ? 'Exiting...' : 'Exit Impersonation'}
      </Button>
    </div>
  );
}
