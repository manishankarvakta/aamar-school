'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BuildingIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBranch } from '@/contexts/branch-context';

interface BranchSelectorProps {
  showAllOption?: boolean;
  compact?: boolean;
}

export function BranchSelector({ 
  showAllOption = true,
  compact = false 
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedBranchId, selectedBranch, branches, selectBranch } = useBranch();

  const handleBranchSelect = (branchId: string) => {
    selectBranch(branchId);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Construction': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <Select value={selectedBranchId} onValueChange={handleBranchSelect}>
        <SelectTrigger className="min-w-[200px] w-full">
          <div className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            <SelectValue placeholder="Select branch" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">All Branches</SelectItem>
          )}
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              <div className="flex items-center gap-2">
                <span>{branch.name}</span>
                <Badge className={`${getStatusColor(branch.status)} text-xs`}>
                  {branch.code}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-auto p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">
                {selectedBranchId === 'all' ? 'All Branches' : selectedBranch?.name}
              </p>
              {selectedBranch && (
                <p className="text-sm text-muted-foreground">
                  {selectedBranch.students} students • {selectedBranch.teachers} teachers
                </p>
              )}
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="font-medium mb-3">Select Branch</h4>
          <div className="space-y-2">
            {showAllOption && (
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBranchId === 'all' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleBranchSelect('all')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BuildingIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">All Branches</p>
                    <p className="text-sm text-muted-foreground">View data from all branches</p>
                  </div>
                </div>
                {selectedBranchId === 'all' && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </div>
            )}
            
            {branches.map((branch) => (
              <div
                key={branch.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBranchId === branch.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleBranchSelect(branch.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BuildingIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{branch.name}</p>
                      <Badge className={getStatusColor(branch.status)}>
                        {branch.code}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {branch.students} students • {branch.teachers} teachers
                    </p>
                  </div>
                </div>
                {selectedBranchId === branch.id && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 