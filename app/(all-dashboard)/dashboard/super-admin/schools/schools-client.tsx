'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building2, 
  Search, 
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { toggleSchoolStatus, startImpersonation } from '@/app/actions/super-admin';

interface SchoolItem {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  email: string | null;
  phone: string | null;
}

export function SchoolsClient({ initialSchools }: { initialSchools: SchoolItem[] }) {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolItem[]>(initialSchools);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Toggle school active/inactive status
  const handleToggleSchool = async (schoolId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionKey = `school-${schoolId}`;
    try {
      setActionLoading(actionKey);
      const res = await toggleSchoolStatus(schoolId, newStatus);
      if (res.success) {
        toast({
          title: "Status Updated",
          description: res.message || `School status updated to ${newStatus ? "Active" : "Inactive"}`
        });
        
        // Update local state
        setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, isActive: newStatus } : s));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to update school status."
        });
      }
    } catch (error) {
      console.error('Error toggling school status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Impersonate school admin
  const handleImpersonate = async (schoolId: string) => {
    const actionKey = `impersonate-${schoolId}`;
    try {
      setActionLoading(actionKey);
      const res = await startImpersonation(schoolId);
      if (res.success) {
        toast({
          title: "Entering School Dashboard",
          description: "Transitioning view to school administrator mode..."
        });
        window.location.href = '/dashboard';
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to start impersonation"
        });
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter schools list based on search query
  const filteredSchools = schools.filter(school => {
    const name = school.name.toLowerCase();
    const code = school.code.toLowerCase();
    const email = (school.email || '').toLowerCase();
    const phone = (school.phone || '').toLowerCase();
    const query = search.toLowerCase();

    return name.includes(query) || 
           code.includes(query) || 
           email.includes(query) || 
           phone.includes(query);
  });

  return (
    <div className="space-y-6 pb-[120px] p-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span>Registered Institutions Registry</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage institution states, toggle authorization access, and impersonate the school administrator dashboard.
        </p>
      </div>

      {/* Registry Table */}
      <Card className="shadow-md border border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold">School Registry ({schools.length})</CardTitle>
              <CardDescription>Overview of all institutions currently hosted on this multi-tenant platform.</CardDescription>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, code, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          
          {filteredSchools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">
              No registered schools match your search.
            </div>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Operational Email</TableHead>
                    <TableHead>Phone Contact</TableHead>
                    <TableHead className="text-center">Permit Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map(school => (
                    <TableRow key={school.id} className="hover:bg-muted/10">
                      <TableCell className="font-bold text-sm text-foreground">
                        {school.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                        {school.code}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {school.email || 'Not Configured'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {school.phone || 'Not Configured'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={school.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {school.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg text-xs"
                            disabled={actionLoading === `impersonate-${school.id}`}
                            onClick={() => handleImpersonate(school.id)}
                          >
                            {actionLoading === `impersonate-${school.id}` ? "Entering..." : "Edit & View"}
                          </Button>
                          <Button
                            size="sm"
                            variant={school.isActive ? "destructive" : "default"}
                            className="rounded-lg text-xs"
                            disabled={actionLoading === `school-${school.id}`}
                            onClick={() => handleToggleSchool(school.id, school.isActive)}
                          >
                            {school.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}
