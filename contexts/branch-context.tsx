'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBranchesWithStats } from '@/app/actions/branches';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'Active' | 'Under Construction' | 'Inactive';
  students: number;
  teachers: number;
  phone?: string;
  email?: string;
}

interface BranchContextType {
  selectedBranchId: string;
  selectedBranch: Branch | null;
  branches: Branch[];
  selectBranch: (branchId: string) => void;
  isAllBranches: boolean;
  loading: boolean;
  error: string | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

interface BranchProviderProps {
  children: React.ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const router = useRouter();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches from DB via server action
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        const result = await getBranchesWithStats();

        if (!result.success) {
          setError('Failed to load branches');
          return;
        }

        // Map BranchWithStats → Branch (context shape)
        const mapped: Branch[] = result.data.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          address: b.address,
          status: b.isActive ? 'Active' : 'Inactive',
          students: b.totalStudents,
          teachers: b.totalTeachers,
          phone: b.phone,
          email: b.email,
        }));

        setBranches(mapped);

        // Restore last selected branch from localStorage
        const saved = localStorage.getItem('selectedBranchId');
        if (saved && (saved === 'all' || mapped.find((b) => b.id === saved))) {
          setSelectedBranchId(saved);
        } else if (mapped.length > 0) {
          setSelectedBranchId('all');
        }
      } catch (err) {
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  // Persist selected branch
  useEffect(() => {
    localStorage.setItem('selectedBranchId', selectedBranchId);
  }, [selectedBranchId]);

  const selectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    Cookies.set('selectedBranchId', branchId, { path: '/' });
    router.refresh();
  };

  const selectedBranch =
    selectedBranchId === 'all'
      ? null
      : branches.find((b) => b.id === selectedBranchId) || null;

  const isAllBranches = selectedBranchId === 'all';

  const value: BranchContextType = {
    selectedBranchId,
    selectedBranch,
    branches,
    selectBranch,
    isAllBranches,
    loading,
    error,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}

// Utility hooks for branch-specific operations
export function useBranchStats() {
  const { selectedBranch, branches, isAllBranches } = useBranch();

  if (isAllBranches) {
    return {
      totalStudents: branches.reduce((sum, b) => sum + b.students, 0),
      totalTeachers: branches.reduce((sum, b) => sum + b.teachers, 0),
      totalBranches: branches.length,
      activeBranches: branches.filter((b) => b.status === 'Active').length,
    };
  }

  return {
    totalStudents: selectedBranch?.students || 0,
    totalTeachers: selectedBranch?.teachers || 0,
    totalBranches: 1,
    activeBranches: selectedBranch?.status === 'Active' ? 1 : 0,
  };
}

export function useBranchFilter<T extends { branchId?: string }>(data: T[]): T[] {
  const { selectedBranchId, isAllBranches } = useBranch();

  if (isAllBranches) {
    return data;
  }

  return data.filter((item) => item.branchId === selectedBranchId);
}