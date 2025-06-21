'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'Active' | 'Under Construction' | 'Inactive';
  students: number;
  teachers: number;
  principal?: string;
  phone?: string;
  email?: string;
  facilities?: string[];
  establishedDate?: string;
  academicYear?: string;
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

// Sample data - in a real app, this would come from an API
const sampleBranches: Branch[] = [
  {
    id: 'BRN001',
    name: 'Main Campus',
    code: 'MAIN',
    address: '123 Education Street, Dhaka, Bangladesh',
    status: 'Active',
    students: 1245,
    teachers: 78,
    principal: 'Dr. Sarah Ahmed',
    phone: '+880-1234-567890',
    email: 'main@aamarschool.edu.bd',
    facilities: ['Library', 'Laboratory', 'Playground', 'Computer Lab', 'Auditorium'],
    establishedDate: '2010-01-15',
    academicYear: '2024-2025',
  },
  {
    id: 'BRN002',
    name: 'North Campus',
    code: 'NORTH',
    address: '456 Academic Avenue, Uttara, Dhaka',
    status: 'Active',
    students: 890,
    teachers: 56,
    principal: 'Prof. Mohammad Rahman',
    phone: '+880-1234-567891',
    email: 'north@aamarschool.edu.bd',
    facilities: ['Library', 'Laboratory', 'Playground', 'Computer Lab'],
    establishedDate: '2015-03-20',
    academicYear: '2024-2025',
  },
  {
    id: 'BRN003',
    name: 'South Campus',
    code: 'SOUTH',
    address: '789 Learning Lane, Dhanmondi, Dhaka',
    status: 'Active',
    students: 654,
    teachers: 42,
    principal: 'Ms. Fatima Khan',
    phone: '+880-1234-567892',
    email: 'south@aamarschool.edu.bd',
    facilities: ['Library', 'Laboratory', 'Computer Lab'],
    establishedDate: '2018-08-10',
    academicYear: '2024-2025',
  },
  {
    id: 'BRN004',
    name: 'East Campus',
    code: 'EAST',
    address: '321 Knowledge Road, Bashundhara, Dhaka',
    status: 'Under Construction',
    students: 423,
    teachers: 28,
    principal: 'Dr. Ahmed Hassan',
    phone: '+880-1234-567893',
    email: 'east@aamarschool.edu.bd',
    facilities: ['Library', 'Computer Lab'],
    establishedDate: '2020-06-01',
    academicYear: '2024-2025',
  }
];

interface BranchProviderProps {
  children: React.ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('BRN001');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches data (simulate API call)
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setBranches(sampleBranches);
        
        // Load saved branch from localStorage
        const savedBranchId = localStorage.getItem('selectedBranchId');
        if (savedBranchId && sampleBranches.find(b => b.id === savedBranchId)) {
          setSelectedBranchId(savedBranchId);
        }
      } catch (err) {
        setError('Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  // Save selected branch to localStorage
  useEffect(() => {
    if (selectedBranchId !== 'all') {
      localStorage.setItem('selectedBranchId', selectedBranchId);
    }
  }, [selectedBranchId]);

  const selectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const selectedBranch = selectedBranchId === 'all' 
    ? null 
    : branches.find(b => b.id === selectedBranchId) || null;

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
      totalStudents: branches.reduce((sum, branch) => sum + branch.students, 0),
      totalTeachers: branches.reduce((sum, branch) => sum + branch.teachers, 0),
      totalBranches: branches.length,
      activeBranches: branches.filter(b => b.status === 'Active').length,
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
  
  return data.filter(item => item.branchId === selectedBranchId);
} 