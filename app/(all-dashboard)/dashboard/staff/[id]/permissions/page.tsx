'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getStaffPermissions, updateStaffPermissions } from '@/app/actions/staff';
import { getBranchesWithStats } from '@/app/actions/branches';
import { ArrowLeft, Shield, ChevronDown, ChevronRight, Lock, Save, RefreshCw, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleConfig {
  key: string;
  name: string;
  actions: { key: string; label: string }[];
}

const MODULES_STRUCTURE: ModuleConfig[] = [
  {
    key: 'dashboard',
    name: 'Dashboard Overview',
    actions: [
      { key: 'view', label: 'View Dashboard' }
    ]
  },
  {
    key: 'admissions',
    name: 'Admissions Panel',
    actions: [
      { key: 'view', label: 'View Admissions' },
      { key: 'create', label: 'Process Admissions' },
      { key: 'edit', label: 'Edit Applications' },
      { key: 'delete', label: 'Delete Applications' }
    ]
  },
  {
    key: 'students',
    name: 'Student Directory',
    actions: [
      { key: 'view', label: 'View Students' },
      { key: 'create', label: 'Add New Student' },
      { key: 'edit', label: 'Modify Profiles' },
      { key: 'delete', label: 'Remove Students' }
    ]
  },
  {
    key: 'parents',
    name: 'Parent Directory',
    actions: [
      { key: 'view', label: 'View Parents' },
      { key: 'create', label: 'Add Parents' },
      { key: 'edit', label: 'Modify Details' },
      { key: 'delete', label: 'Remove Accounts' }
    ]
  },
  {
    key: 'teachers',
    name: 'Teacher Directory',
    actions: [
      { key: 'view', label: 'View Teachers' },
      { key: 'create', label: 'Add Teachers' },
      { key: 'edit', label: 'Modify Profiles' },
      { key: 'delete', label: 'Remove Accounts' }
    ]
  },
  {
    key: 'classes',
    name: 'Classes Management',
    actions: [
      { key: 'view', label: 'View Classes' },
      { key: 'create', label: 'Create Class' },
      { key: 'edit', label: 'Edit Setup' },
      { key: 'delete', label: 'Remove Class' }
    ]
  },
  {
    key: 'subjects',
    name: 'Subjects Setup',
    actions: [
      { key: 'view', label: 'View Subjects' },
      { key: 'create', label: 'Add Subjects' },
      { key: 'edit', label: 'Edit Syllabus' },
      { key: 'delete', label: 'Remove Subjects' }
    ]
  },
  {
    key: 'class-routine',
    name: 'Class Routine Planner',
    actions: [
      { key: 'view', label: 'View Schedule Page' },
      { key: 'view_class_schedule', label: 'View Class Timetables' },
      { key: 'view_teacher_schedule', label: 'View Teacher Schedules' },
      { key: 'create', label: 'Add/Edit Schedules' }
    ]
  },
  {
    key: 'attendance',
    name: 'Attendance Tracking',
    actions: [
      { key: 'view', label: 'View Attendance Logs' },
      { key: 'create', label: 'Mark Attendance' }
    ]
  },
  {
    key: 'exams',
    name: 'Exam Control',
    actions: [
      { key: 'view', label: 'View Exam Schedules' },
      { key: 'create', label: 'Create Exams/Grades' },
      { key: 'edit', label: 'Update Results' },
      { key: 'delete', label: 'Delete Records' }
    ]
  },
  {
    key: 'branches',
    name: 'Branches Overview',
    actions: [
      { key: 'view', label: 'View Campus Info' },
      { key: 'create', label: 'Add Branches' },
      { key: 'edit', label: 'Update Status' }
    ]
  },
  {
    key: 'announcements',
    name: 'Announcements Bulletin',
    actions: [
      { key: 'view', label: 'View Bulletins' },
      { key: 'create', label: 'Publish Announcements' },
      { key: 'edit', label: 'Edit Announcements' },
      { key: 'delete', label: 'Remove Post' }
    ]
  },
  {
    key: 'accounts',
    name: 'Accounts & Ledger',
    actions: [
      { key: 'view', label: 'View Fee Status & Ledger' },
      { key: 'create', label: 'Process Fees / Transactions' },
      { key: 'edit', label: 'Modify Transactions' }
    ]
  },
  {
    key: 'library',
    name: 'Library Logbook',
    actions: [
      { key: 'view', label: 'View Book Inventory' },
      { key: 'create', label: 'Issue / Return Books' },
      { key: 'edit', label: 'Manage Inventory' }
    ]
  },
  {
    key: 'transport',
    name: 'Transport Logs',
    actions: [
      { key: 'view', label: 'View Routes & Vehicles' },
      { key: 'create', label: 'Add Vehicles / Routes' },
      { key: 'edit', label: 'Modify Routes' }
    ]
  },
  {
    key: 'staff',
    name: 'Staff Directory',
    actions: [
      { key: 'view', label: 'View Staff Records' },
      { key: 'create', label: 'Add Staff Member' },
      { key: 'edit', label: 'Update Profile' },
      { key: 'delete', label: 'Delete Account' }
    ]
  },
  {
    key: 'settings',
    name: 'Administration Settings',
    actions: [
      { key: 'view', label: 'View Settings' },
      { key: 'edit', label: 'Modify Global Configurations' }
    ]
  }
];

const MODULE_GROUPS = [
  {
    title: 'Academics',
    modules: ['dashboard', 'admissions', 'students', 'parents', 'teachers', 'classes', 'subjects', 'class-routine', 'attendance', 'exams'],
  },
  {
    title: 'Management',
    modules: ['branches', 'announcements', 'accounts', 'library', 'transport', 'staff'],
  },
  {
    title: 'Administration',
    modules: ['settings'],
  }
];

export default function StaffPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const staffId = params.id as string;

  // Data states
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [branches, setBranches] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [allowedBranches, setAllowedBranches] = useState<string[]>([]);
  const [template, setTemplate] = useState('custom');

  // Accordion UI state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    MODULES_STRUCTURE.reduce((acc, m) => ({ ...acc, [m.key]: m.key === 'class-routine' }), {})
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [permRes, branchRes] = await Promise.all([
          getStaffPermissions(staffId),
          getBranchesWithStats()
        ]);

        if (permRes.success && permRes.data) {
          setStaffName(`${permRes.data.user.firstName} ${permRes.data.user.lastName}`);
          setStaffEmail(permRes.data.user.email);
          setPermissions((permRes.data.permissions as Record<string, Record<string, boolean>>) || {});
          setAllowedBranches((permRes.data.allowedBranches as string[]) || []);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: permRes.error || 'Failed to load permissions data.'
          });
          router.push('/dashboard/staff');
          return;
        }

        if (branchRes.success && branchRes.data) {
          setBranches(branchRes.data.map(b => ({ id: b.id, name: b.name, code: b.code })));
        }
      } catch (error) {
        console.error('Error loading permissions configuration:', error);
      } finally {
        setLoading(false);
      }
    }

    if (staffId) loadData();
  }, [staffId]);

  const toggleExpand = (moduleKey: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }));
  };

  const handlePermissionChange = (moduleKey: string, actionKey: string, checked: boolean) => {
    setTemplate('custom');
    setPermissions(prev => {
      const modulePerms = { ...(prev[moduleKey] || {}) };
      
      // If view permission is unchecked, uncheck everything else in this module
      if (actionKey === 'view' && !checked) {
        Object.keys(modulePerms).forEach(k => {
          modulePerms[k] = false;
        });
      } else {
        modulePerms[actionKey] = checked;
        // If any action is checked, view permission MUST be checked
        if (checked) {
          modulePerms['view'] = true;
        }
      }

      return { ...prev, [moduleKey]: modulePerms };
    });
  };

  const handleBranchChange = (branchId: string, checked: boolean) => {
    setAllowedBranches(prev => {
      if (checked) {
        return prev.includes(branchId) ? prev : [...prev, branchId];
      } else {
        return prev.filter(id => id !== branchId);
      }
    });
  };

  const selectAllBranches = () => {
    setAllowedBranches(branches.map(b => b.id));
  };

  const clearAllBranches = () => {
    setAllowedBranches([]);
  };

  const applyTemplate = (templateName: string) => {
    setTemplate(templateName);
    const newPerms: Record<string, Record<string, boolean>> = {};

    if (templateName === 'super-admin' || templateName === 'admin') {
      MODULES_STRUCTURE.forEach(m => {
        const moduleActions: Record<string, boolean> = {};
        m.actions.forEach(a => {
          moduleActions[a.key] = true;
        });
        newPerms[m.key] = moduleActions;
      });
      // All branches
      setAllowedBranches(branches.map(b => b.id));
    } else if (templateName === 'standard') {
      // General staff template: View routine, view students, view dashboard
      newPerms['dashboard'] = { view: true };
      newPerms['class-routine'] = { view: true, view_class_schedule: true };
      newPerms['students'] = { view: true };
      newPerms['attendance'] = { view: true };
    } else if (templateName === 'clear') {
      // Clear all
      setAllowedBranches([]);
    }

    setPermissions(newPerms);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateStaffPermissions(staffId, permissions, allowedBranches);
      if (res.success) {
        toast({
          title: 'Success',
          description: `Permissions for "${staffName}" updated successfully.`
        });
        router.push('/dashboard/staff');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: res.error || 'Failed to update permissions.'
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading Configuration System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 p-4 max-w-full mx-auto px-6">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/staff')}
          className="rounded-xl gap-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 py-1 px-3 gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <Shield className="w-3 h-3" />
            Security Control
          </Badge>
        </div>
      </div>

      {/* Staff profile summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Permissions for {staffName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure access controls, module access routes, and branch-level restrictions. ({staffEmail})
          </p>
        </div>
        
        {/* Template Select */}
        <div className="space-y-1.5 w-full md:w-64">
          <Label htmlFor="template" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Designation Template</Label>
          <Select value={template} onValueChange={applyTemplate}>
            <SelectTrigger id="template" className="rounded-xl h-10 border-slate-200">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="custom">Custom Configuration</SelectItem>
              <SelectItem value="super-admin">Super Admin (All Access)</SelectItem>
              <SelectItem value="admin">Admin Template</SelectItem>
              <SelectItem value="standard">Standard Support Staff</SelectItem>
              <SelectItem value="clear">Clear All Access</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Branch Restriction (1/3 width) */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-sm border-slate-100 rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Branch Level Authorization
              </CardTitle>
              <CardDescription className="text-xs">
                Restrict this staff member to view and manage data only within designated campuses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {branches.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  🏢 No branches configured in organization.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {branches.map(branch => {
                    const isChecked = allowedBranches.includes(branch.id);
                    return (
                      <label 
                        key={branch.id} 
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50/50 transition-all ${
                          isChecked ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleBranchChange(branch.id, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-800">{branch.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">Code: {branch.code}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllBranches}
                  className="flex-1 text-xs rounded-lg"
                >
                  Select All
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllBranches}
                  className="flex-1 text-xs text-red-650 hover:bg-red-50/30 rounded-lg"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Route/Module Checkboxes (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-2">Module Access Configurations</h2>
          
          {MODULE_GROUPS.map(group => {
            const groupModules = MODULES_STRUCTURE.filter(m => group.modules.includes(m.key));
            if (groupModules.length === 0) return null;

            return (
              <Card key={group.title} className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-3.5 px-5">
                  <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100">
                  {groupModules.map(module => {
                    const isExpanded = expandedModules[module.key] || false;
                    const modulePerms = permissions[module.key] || {};
                    const isModuleViewChecked = modulePerms['view'] === true;

                    return (
                      <div key={module.key} className="bg-white">
                        {/* Accordion Header */}
                        <div 
                          className={cn(
                            "flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50/30 transition-colors select-none",
                            isExpanded && "bg-slate-50/10"
                          )}
                          onClick={() => toggleExpand(module.key)}
                        >
                          <div className="flex items-center gap-3.5">
                            <input
                              type="checkbox"
                              checked={isModuleViewChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handlePermissionChange(module.key, 'view', e.target.checked)}
                              className="w-4.5 h-4.5 text-indigo-650 border-slate-350 rounded focus:ring-primary focus:ring-2 accent-slate-800 cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 hover:text-slate-900">{module.name}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-mono font-medium">
                                /dashboard/{module.key === 'dashboard' ? '' : module.key}
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-400">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="pl-12 pr-4 pb-4 bg-white">
                            <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 bg-slate-50/30 rounded-xl border border-slate-100">
                              {module.actions.map(action => {
                                const isChecked = modulePerms[action.key] === true;
                                
                                return (
                                  <label 
                                    key={action.key}
                                    className={cn(
                                      "flex items-center gap-2 cursor-pointer select-none py-1.5 px-3 rounded-lg hover:bg-slate-50/80 transition-colors",
                                      !isModuleViewChecked && action.key !== 'view' && "opacity-40 cursor-not-allowed"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={action.key !== 'view' && !isModuleViewChecked}
                                      onChange={(e) => handlePermissionChange(module.key, action.key, e.target.checked)}
                                      className="w-4 h-4 text-indigo-650 border-slate-300 rounded focus:ring-primary focus:ring-2 accent-slate-800 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/staff')}
              className="rounded-xl h-11 px-6 font-semibold"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="rounded-xl h-11 px-8 gap-2 font-bold shadow-lg shadow-indigo-650/15"
              disabled={isPending}
            >
              <Save className="w-4.5 h-4.5" />
              {isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
