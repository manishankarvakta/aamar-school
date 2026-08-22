'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Search, 
  Building2, 
  UserCheck, 
  Briefcase, 
  Calendar,
  Mail,
  Phone,
  Bookmark
} from 'lucide-react';
import { toggleUserStatus } from '@/app/actions/super-admin';

interface TeacherItem {
  id: string;
  qualification: string;
  experience: number;
  specialization: string | null;
  joiningDate: Date | string;
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

export function TeachersClient({ initialTeachers }: { initialTeachers: TeacherItem[] }) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Extract unique schools list for filtering
  const schoolsMap = new Map<string, { id: string; name: string; code: string }>();
  teachers.forEach(t => {
    if (t.user.school) {
      schoolsMap.set(t.user.school.id, t.user.school);
    }
  });
  const schoolsList = Array.from(schoolsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Toggle user login status
  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionKey = `user-${userId}`;
    try {
      setActionLoading(actionKey);
      const res = await toggleUserStatus(userId, newStatus);
      if (res.success) {
        toast({
          title: "Status Updated",
          description: res.message || "Teacher login authorization updated."
        });
        setTeachers(prev => prev.map(t => t.user.id === userId ? {
          ...t,
          user: { ...t.user, isActive: newStatus }
        } : t));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to update login status."
        });
      }
    } catch (error) {
      console.error('Error toggling teacher status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter teachers list
  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.toLowerCase();
    const email = teacher.user.email.toLowerCase();
    const qualification = teacher.qualification.toLowerCase();
    const specialization = (teacher.specialization || '').toLowerCase();
    const schoolName = teacher.user.school.name.toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || 
                          email.includes(query) || 
                          qualification.includes(query) || 
                          specialization.includes(query) || 
                          schoolName.includes(query);

    const matchesSchool = schoolFilter === 'all' || teacher.user.school.id === schoolFilter;

    return matchesSearch && matchesSchool;
  });

  // Calculate metrics
  const totalCount = filteredTeachers.length;
  const maleCount = filteredTeachers.filter(t => t.user.profile?.gender === 'MALE').length;
  const femaleCount = filteredTeachers.filter(t => t.user.profile?.gender === 'FEMALE').length;
  const otherCount = totalCount - maleCount - femaleCount;

  return (
    <div className="space-y-6 pb-[120px] p-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span>System-Wide Teachers Directory</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, and manage access permissions for all academic instructors registered across all institutions.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Teachers */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Registered Teachers</p>
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
                <span>👨 {maleCount} Male</span>
                <span>•</span>
                <span>👩 {femaleCount} Female</span>
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

        {/* Institution Count */}
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
              <CardTitle className="text-lg font-bold">Teachers Directory Registry</CardTitle>
              <CardDescription>Filter by school or search by name, email, qualification, or school name.</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teacher details..."
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
          
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">
              No teachers found matching your criteria.
            </div>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Qualification & Exp</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Email & Contact</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead className="text-center">Permit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map(teacher => {
                    const formattedDate = new Date(teacher.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <TableRow key={teacher.id} className="hover:bg-muted/10">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm text-foreground">
                                {teacher.user.firstName} {teacher.user.lastName}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium capitalize">
                                Gender: {teacher.user.profile?.gender?.toLowerCase() || 'unspecified'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-background font-semibold text-xs border-border text-foreground px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit max-w-[180px] truncate">
                            <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{teacher.user.school.name}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-bold text-foreground">{teacher.qualification}</div>
                          <div className="text-[10px] text-muted-foreground">{teacher.experience} Years Experience</div>
                        </TableCell>
                        <TableCell>
                          {teacher.specialization ? (
                            <Badge variant="secondary" className="font-bold text-[10px] uppercase flex items-center gap-1 w-fit bg-secondary/40 text-secondary-foreground">
                              <Bookmark className="h-3 w-3 text-muted-foreground" />
                              {teacher.specialization}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">General</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              {teacher.user.email}
                            </span>
                            {teacher.user.profile?.phone && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                {teacher.user.profile.phone}
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
                            <Badge className={teacher.user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {teacher.user.isActive ? "Allowed" : "Blocked"}
                            </Badge>
                            <Switch
                              checked={teacher.user.isActive}
                              disabled={actionLoading === `user-${teacher.user.id}`}
                              onCheckedChange={() => handleToggleUser(teacher.user.id, teacher.user.isActive)}
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
