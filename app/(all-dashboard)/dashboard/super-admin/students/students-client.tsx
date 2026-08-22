'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Search, 
  Building2, 
  Activity, 
  UserCheck, 
  GraduationCap, 
  Layers, 
  Calendar,
  Mail,
  Phone,
  ArrowUpDown
} from 'lucide-react';
import { toggleUserStatus } from '@/app/actions/super-admin';

interface StudentItem {
  id: string;
  rollNumber: string;
  admissionDate: Date | string;
  class: {
    name: string;
  };
  section: {
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    school: {
      id: string;
      name: string;
      code: string;
    };
    profile?: {
      gender?: string | null;
      phone?: string | null;
    } | null;
  };
}

export function StudentsClient({ initialStudents }: { initialStudents: StudentItem[] }) {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Extract unique schools list for filtering
  const schoolsMap = new Map<string, { id: string; name: string; code: string }>();
  students.forEach(s => {
    if (s.user.school) {
      schoolsMap.set(s.user.school.id, s.user.school);
    }
  });
  const schoolsList = Array.from(schoolsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Toggle user permit status
  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionKey = `user-${userId}`;
    try {
      setActionLoading(actionKey);
      const res = await toggleUserStatus(userId, newStatus);
      if (res.success) {
        toast({
          title: "Status Updated",
          description: res.message || "Student login authorization updated."
        });
        // Update local state
        setStudents(prev => prev.map(s => s.user.id === userId ? {
          ...s,
          user: { ...s.user, isActive: newStatus }
        } : s));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to update login status."
        });
      }
    } catch (error) {
      console.error('Error toggling student status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter students based on search and school dropdown select
  const filteredStudents = students.filter(student => {
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const email = student.user.email.toLowerCase();
    const roll = student.rollNumber.toLowerCase();
    const className = student.class.name.toLowerCase();
    const schoolName = student.user.school.name.toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || 
                          email.includes(query) || 
                          roll.includes(query) || 
                          className.includes(query) || 
                          schoolName.includes(query);

    const matchesSchool = schoolFilter === 'all' || student.user.school.id === schoolFilter;

    return matchesSearch && matchesSchool;
  });

  // Calculate metrics
  const totalCount = filteredStudents.length;
  const boysCount = filteredStudents.filter(s => s.user.profile?.gender === 'MALE').length;
  const girlsCount = filteredStudents.filter(s => s.user.profile?.gender === 'FEMALE').length;
  const otherCount = totalCount - boysCount - girlsCount;

  return (
    <div className="space-y-6 pb-[120px] p-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span>System-Wide Student Directory</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, and manage access permissions for all students registered across all institutions.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Students */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Registered Students</p>
              <h3 className="text-2xl font-bold">{totalCount}</h3>
              <p className="text-[10px] text-muted-foreground">Active in system</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Gender Breakdown */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full group-hover:bg-violet-500/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1 w-2/3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender Split</p>
              <h3 className="text-2xl font-bold">{totalCount}</h3>
              <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                <span>👦 {boysCount} Boys</span>
                <span>•</span>
                <span>👧 {girlsCount} Girls</span>
                {otherCount > 0 && (
                  <>
                    <span>•</span>
                    <span>⚪ {otherCount} Other</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* School Registry Count */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Associated Institutions</p>
              <h3 className="text-2xl font-bold">{schoolsList.length}</h3>
              <p className="text-[10px] text-muted-foreground">Registered on platform</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Listing Controls */}
      <Card className="shadow-md border border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Student Directory Registry</CardTitle>
              <CardDescription>Filter by school or search by name, email, roll number, or school name.</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student details..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs"
                />
              </div>

              {/* School Filter Dropdown */}
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className="w-full sm:w-56 h-9 rounded-xl border-border/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All Schools" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌐 All Institutions</SelectItem>
                  {schoolsList.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      🏫 {school.name} ({school.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">
              No students found matching your criteria.
            </div>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Roll & Class</TableHead>
                    <TableHead>Email & Contact</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead className="text-center">Permit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => {
                    const formattedDate = new Date(student.admissionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <TableRow key={student.id} className="hover:bg-muted/10">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {student.user.firstName[0]}{student.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm text-foreground">
                                {student.user.firstName} {student.user.lastName}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium capitalize">
                                Gender: {student.user.profile?.gender?.toLowerCase() || 'unspecified'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background font-semibold text-xs border-border text-foreground px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit max-w-[180px] truncate">
                            <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{student.user.school.name}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-bold text-foreground">Class {student.class.name}</div>
                          <div className="text-[10px] text-muted-foreground">Roll: {student.rollNumber} • Section {student.section.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              {student.user.email}
                            </span>
                            {student.user.profile?.phone && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                {student.user.profile.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formattedDate}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Badge className={student.user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {student.user.isActive ? "Allowed" : "Blocked"}
                            </Badge>
                            <Switch
                              checked={student.user.isActive}
                              disabled={actionLoading === `user-${student.user.id}`}
                              onCheckedChange={() => handleToggleUser(student.user.id, student.user.isActive)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}
