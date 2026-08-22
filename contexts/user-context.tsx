'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserPermissions } from '@/app/actions/auth';

interface UserContextType {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  role: string | null;
  permissions: Record<string, Record<string, boolean>> | null;
  allowedBranches: string[] | null;
  isAdmin: boolean;
  loading: boolean;
  hasPermission: (module: string, action?: string) => boolean;
  hasBranchAccess: (branchId: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserContextType['permissions']>(null);
  const [allowedBranches, setAllowedBranches] = useState<string[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUserPermissions();
      if (res.success) {
        setUser(res.user || null);
        setRole(res.role || null);
        setIsAdmin(res.isAdmin || false);
        setPermissions(res.permissions || null);
        setAllowedBranches(res.allowedBranches || null);
      }
    } catch (error) {
      console.error('Error fetching user permissions in context:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (module: string, action: string = 'view'): boolean => {
    if (loading) return false;
    if (isAdmin) return true; // Super admins and admins have all permissions
    if (!permissions) return false;
    
    return permissions[module]?.[action] === true;
  };

  const hasBranchAccess = (branchId: string): boolean => {
    if (loading) return false;
    if (isAdmin) return true;
    if (branchId === 'all') {
      // If the staff has any allowed branches, they can view 'all' (filtered context)
      return (allowedBranches?.length || 0) > 0;
    }
    if (!allowedBranches) return false;
    return allowedBranches.includes(branchId);
  };

  const value: UserContextType = {
    user,
    role,
    permissions,
    allowedBranches,
    isAdmin,
    loading,
    hasPermission,
    hasBranchAccess,
    refreshPermissions: fetchPermissions,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
