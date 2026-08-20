'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  Activity, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  RefreshCw,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
  Users2
} from 'lucide-react';
import { 
  getSuperAdminStats, 
  getSchoolsList, 
  getSchoolData, 
  toggleSchoolStatus, 
  toggleUserStatus,
  deleteSchoolUser
} from '@/app/actions/super-admin';

interface SchoolItem {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  email: string | null;
  phone: string | null;
}

interface SchoolDetails {
  school: {
    id: string;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    isActive: boolean;
  };
  stats: {
    totalStudents: number;
    boys: number;
    girls: number;
    totalTeachers: number;
    maleTeachers: number;
    femaleTeachers: number;
    totalStaff: number;
    totalParents: number;
  };
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
  students: Array<{
    id: string;
    rollNumber: string;
    admissionDate: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
      profile?: {
        phone?: string | null;
        gender?: string | null;
      } | null;
    };
    class: {
      name: string;
    };
    section: {
      name: string;
    };
    parent?: {
      user: {
        firstName: string;
        lastName: string;
      };
    } | null;
  }>;
  teachers: Array<{
    id: string;
    qualification: string;
    experience: number;
    specialization: string | null;
    joiningDate: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
      profile?: {
        phone?: string | null;
        gender?: string | null;
      } | null;
    };
  }>;
  parents: Array<{
    id: string;
    relation: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
      profile?: {
        phone?: string | null;
      } | null;
    };
    students: Array<{
      user: {
        firstName: string;
        lastName: string;
      };
    }>;
  }>;
}

export default function SuperAdminPage() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [overallStats, setOverallStats] = useState<any>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  
  // Search terms for different tabs
  const [userSearch, setUserSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [loading, setLoading] = useState(true);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load initial global stats and schools
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch school details when selected school changes
  useEffect(() => {
    if (selectedSchoolId !== 'all') {
      loadSchoolDetails(selectedSchoolId);
    } else {
      setSchoolDetails(null);
    }
  }, [selectedSchoolId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, schoolsRes] = await Promise.all([
        getSuperAdminStats(),
        getSchoolsList()
      ]);

      if (statsRes.success && statsRes.data) {
        setOverallStats(statsRes.data);
      }
      if (schoolsRes.success && schoolsRes.data) {
        setSchools(schoolsRes.data);
      }
    } catch (error) {
      console.error('Error loading super admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load system data."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolDetails = async (schoolId: string) => {
    try {
      setSchoolLoading(true);
      const res = await getSchoolData(schoolId);
      if (res.success && res.data) {
        setSchoolDetails(res.data as any);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to load school details."
        });
      }
    } catch (error) {
      console.error('Error loading school details:', error);
    } finally {
      setSchoolLoading(false);
    }
  };

  // Toggle school active/inactive status
  const handleToggleSchool = async (schoolId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionKey = `school-${schoolId}`;
    try {
      setActionLoading(actionKey);
      const res = await toggleSchoolStatus(schoolId, newStatus);
      if (res.success) {
        toast({
          title: "Success",
          description: res.message
        });
        
        // Update schools list state
        setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, isActive: newStatus } : s));
        
        // Update currently viewed school details status
        if (schoolDetails && schoolDetails.school.id === schoolId) {
          setSchoolDetails(prev => prev ? {
            ...prev,
            school: { ...prev.school, isActive: newStatus }
          } : null);
        }
        
        // Refresh overall stats
        const statsRes = await getSuperAdminStats();
        if (statsRes.success && statsRes.data) {
          setOverallStats(statsRes.data);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to toggle status."
        });
      }
    } catch (error) {
      console.error('Error toggling school:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle user login permission status
  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionKey = `user-${userId}`;
    try {
      setActionLoading(actionKey);
      const res = await toggleUserStatus(userId, newStatus);
      if (res.success) {
        toast({
          title: "Success",
          description: res.message
        });
        
        // Update user status inside school details state
        if (schoolDetails) {
          setSchoolDetails(prev => prev ? {
            ...prev,
            users: prev.users.map(u => u.id === userId ? { ...u, isActive: newStatus } : u),
            students: prev.students.map(s => s.user.id === userId ? { ...s, user: { ...s.user, isActive: newStatus } } : s),
            teachers: prev.teachers.map(t => t.user.id === userId ? { ...t, user: { ...t.user, isActive: newStatus } } : t),
            parents: prev.parents.map(p => p.user.id === userId ? { ...p, user: { ...p.user, isActive: newStatus } } : p)
          } : null);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to update user login status."
        });
      }
    } catch (error) {
      console.error('Error toggling user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User (Cascades to Student/Teacher/Parent)
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This will also remove any related academic, attendance, and exam profiles.")) {
      return;
    }

    const actionKey = `delete-${userId}`;
    try {
      setActionLoading(actionKey);
      const res = await deleteSchoolUser(userId);
      if (res.success) {
        toast({
          title: "Deleted",
          description: res.message
        });
        
        // Refresh school details if one is selected
        if (selectedSchoolId !== 'all') {
          loadSchoolDetails(selectedSchoolId);
        }
        
        // Refresh overall stats
        const statsRes = await getSuperAdminStats();
        if (statsRes.success && statsRes.data) {
          setOverallStats(statsRes.data);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to delete user."
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Super Admin Control Panel...</p>
      </div>
    );
  }

  // Get active statistics to display
  const stats = selectedSchoolId === 'all' || !schoolDetails
    ? {
        schools: overallStats?.totalSchools || 0,
        students: overallStats?.totalStudents || 0,
        boys: overallStats?.studentGender.male || 0,
        girls: overallStats?.studentGender.female || 0,
        teachers: overallStats?.totalTeachers || 0,
        maleTeachers: overallStats?.teacherGender.male || 0,
        femaleTeachers: overallStats?.teacherGender.female || 0,
        staff: overallStats?.totalStaff || 0,
        parents: overallStats?.totalParents || 0
      }
    : {
        schools: 1,
        students: schoolDetails.stats.totalStudents,
        boys: schoolDetails.stats.boys,
        girls: schoolDetails.stats.girls,
        teachers: schoolDetails.stats.totalTeachers,
        maleTeachers: schoolDetails.stats.maleTeachers,
        femaleTeachers: schoolDetails.stats.femaleTeachers,
        staff: schoolDetails.stats.totalStaff,
        parents: schoolDetails.stats.totalParents
      };

  // Filters for separate tabs
  const filteredUsers = schoolDetails?.users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const filteredTeachers = schoolDetails?.teachers.filter(teacher => {
    const name = `${teacher.user.firstName} ${teacher.user.lastName}`.toLowerCase();
    const email = teacher.user.email.toLowerCase();
    const qualification = teacher.qualification.toLowerCase();
    const query = teacherSearch.toLowerCase();
    return name.includes(query) || email.includes(query) || qualification.includes(query);
  }) || [];

  const filteredStudents = schoolDetails?.students.filter(student => {
    const name = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const email = student.user.email.toLowerCase();
    const roll = student.rollNumber.toLowerCase();
    const className = student.class.name.toLowerCase();
    const query = studentSearch.toLowerCase();
    return name.includes(query) || email.includes(query) || roll.includes(query) || className.includes(query);
  }) || [];

  const filteredParents = schoolDetails?.parents.filter(parent => {
    const name = `${parent.user.firstName} ${parent.user.lastName}`.toLowerCase();
    const email = parent.user.email.toLowerCase();
    const relation = parent.relation.toLowerCase();
    const query = parentSearch.toLowerCase();
    return name.includes(query) || email.includes(query) || relation.includes(query);
  }) || [];

  return (
    <div className="space-y-6 pb-[120px] p-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <span>Super Admin Control Panel</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global management of schools, student counts, teachers, staff, and user login controls.
          </p>
        </div>

        {/* School Dropdown Selector */}
        <div className="w-full md:w-72">
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
            <SelectTrigger className="w-full h-11 rounded-xl shadow-sm border-border/80">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select School / Organisation" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 All Schools (aggregated stats)</SelectItem>
              {schools.map(school => (
                <SelectItem key={school.id} value={school.id}>
                  🏫 {school.name} ({school.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of aggregated/filtered statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Schools */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Institutions</p>
              <h3 className="text-2xl font-bold">{stats.schools}</h3>
              <p className="text-[10px] text-muted-foreground">Registered on platform</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full group-hover:bg-violet-500/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1 w-2/3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students</p>
              <h3 className="text-2xl font-bold">{stats.students}</h3>
              <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                <span>👦 {stats.boys} Boys</span>
                <span>•</span>
                <span>👧 {stats.girls} Girls</span>
              </div>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1 w-2/3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teachers</p>
              <h3 className="text-2xl font-bold">{stats.teachers}</h3>
              <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                <span>👨 {stats.maleTeachers} Male</span>
                <span>•</span>
                <span>👩 {stats.femaleTeachers} Female</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Staff & Parents */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff & Parents</p>
              <h3 className="text-2xl font-bold">{stats.staff + stats.parents}</h3>
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span>🔧 {stats.staff} Staff</span>
                <span>•</span>
                <span>👪 {stats.parents} Parents</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedSchoolId !== 'all' && schoolDetails ? (
        <div className="space-y-6">
          
          {/* Main management panel tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted rounded-xl w-full border">
              <TabsTrigger value="overview" className="rounded-lg py-2.5 font-bold text-xs">🏫 School Overview</TabsTrigger>
              <TabsTrigger value="teachers" className="rounded-lg py-2.5 font-bold text-xs">👨‍🏫 Teachers ({schoolDetails.teachers.length})</TabsTrigger>
              <TabsTrigger value="students" className="rounded-lg py-2.5 font-bold text-xs">🧑‍🎓 Students ({schoolDetails.students.length})</TabsTrigger>
              <TabsTrigger value="parents" className="rounded-lg py-2.5 font-bold text-xs">👪 Parents ({schoolDetails.parents.length})</TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg py-2.5 font-bold text-xs">🔑 All User Logins</TabsTrigger>
            </TabsList>

            {/* TAB: School Overview */}
            <TabsContent value="overview" className="mt-4 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* School Details */}
                <Card className="lg:col-span-1 shadow-md border border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">School Details</CardTitle>
                    <CardDescription>Administrative information and controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">School Name</p>
                          <p className="text-sm font-medium text-foreground">{schoolDetails.school.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">School Code</p>
                          <p className="text-sm font-mono font-bold text-foreground">{schoolDetails.school.code}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Address</p>
                          <p className="text-sm font-medium text-foreground">{schoolDetails.school.address || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Phone Number</p>
                          <p className="text-sm font-medium text-foreground">{schoolDetails.school.phone || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Email Address</p>
                          <p className="text-sm font-medium text-foreground">{schoolDetails.school.email || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Globe className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Website</p>
                          {schoolDetails.school.website ? (
                            <a href={schoolDetails.school.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline block truncate">
                              {schoolDetails.school.website}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-foreground">Not Provided</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Operational Status</h4>
                        <p className="text-[10px] text-muted-foreground">Disable school logins immediately</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={schoolDetails.school.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {schoolDetails.school.isActive ? "Active" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={schoolDetails.school.isActive}
                          disabled={actionLoading !== null}
                          onCheckedChange={() => handleToggleSchool(schoolDetails.school.id, schoolDetails.school.isActive)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick stats distribution summary */}
                <Card className="lg:col-span-2 shadow-md border border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Demographic Breakdown</CardTitle>
                    <CardDescription>Academic and organizational gender ratios</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Student Gender Split</h4>
                      <div className="flex h-5 rounded-full overflow-hidden w-full bg-muted">
                        <div 
                          className="bg-sky-400 flex items-center justify-center text-[10px] text-white font-bold" 
                          style={{ width: `${stats.students > 0 ? (stats.boys / stats.students) * 100 : 50}%` }}
                        >
                          {stats.boys > 0 && `Boy: ${stats.boys}`}
                        </div>
                        <div 
                          className="bg-pink-400 flex items-center justify-center text-[10px] text-white font-bold" 
                          style={{ width: `${stats.students > 0 ? (stats.girls / stats.students) * 100 : 50}%` }}
                        >
                          {stats.girls > 0 && `Girl: ${stats.girls}`}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Teacher Gender Split</h4>
                      <div className="flex h-5 rounded-full overflow-hidden w-full bg-muted">
                        <div 
                          className="bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold" 
                          style={{ width: `${stats.teachers > 0 ? (stats.maleTeachers / stats.teachers) * 100 : 50}%` }}
                        >
                          {stats.maleTeachers > 0 && `Male: ${stats.maleTeachers}`}
                        </div>
                        <div 
                          className="bg-amber-400 flex items-center justify-center text-[10px] text-white font-bold" 
                          style={{ width: `${stats.teachers > 0 ? (stats.femaleTeachers / stats.teachers) * 100 : 50}%` }}
                        >
                          {stats.femaleTeachers > 0 && `Female: ${stats.femaleTeachers}`}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold">Total Staff Members</span>
                        <p className="text-2xl font-bold text-foreground mt-0.5">{stats.staff}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold">Associated Parents</span>
                        <p className="text-2xl font-bold text-foreground mt-0.5">{stats.parents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Teachers */}
            <TabsContent value="teachers" className="mt-4 focus-visible:outline-none">
              <Card className="shadow-md border border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">Manage School Teachers</CardTitle>
                      <CardDescription>View, search and delete qualifications, experience, and login status.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search name, email..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                      No teachers found.
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Email Address</TableHead>
                            <TableHead>Qualification & Exp</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead className="text-center">Permit Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTeachers.map(teacher => (
                            <TableRow key={teacher.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold text-sm">
                                      {teacher.user.firstName} {teacher.user.lastName}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-semibold">
                                      {teacher.specialization || 'General Subject'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-muted-foreground">
                                {teacher.user.email}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-foreground font-semibold">{teacher.qualification}</div>
                                <div className="text-[10px] text-muted-foreground">{teacher.experience} years experience</div>
                              </TableCell>
                              <TableCell className="text-sm font-medium capitalize">
                                {teacher.user.profile?.gender?.toLowerCase() || 'Other'}
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
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 rounded-lg"
                                  disabled={actionLoading === `delete-${teacher.user.id}`}
                                  onClick={() => handleDeleteUser(teacher.user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Students */}
            <TabsContent value="students" className="mt-4 focus-visible:outline-none">
              <Card className="shadow-md border border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">Manage School Students</CardTitle>
                      <CardDescription>View rolls, class sections, parent contacts, and student logins.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search name, class, roll..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                      No students found.
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Roll No & Class</TableHead>
                            <TableHead>Parent Info</TableHead>
                            <TableHead>Email Address</TableHead>
                            <TableHead className="text-center">Permit Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map(student => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {student.user.firstName[0]}{student.user.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold text-sm">
                                      {student.user.firstName} {student.user.lastName}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground capitalize">
                                      Gender: {student.user.profile?.gender?.toLowerCase() || 'Other'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-foreground font-semibold">Class {student.class.name}</div>
                                <div className="text-[10px] text-muted-foreground">Roll: {student.rollNumber} • Section: {student.section.name}</div>
                              </TableCell>
                              <TableCell>
                                {student.parent ? (
                                  <div className="text-sm font-semibold text-foreground">
                                    👪 {student.parent.user.firstName} {student.parent.user.lastName}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">No Parent linked</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm font-medium text-muted-foreground">
                                {student.user.email}
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
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 rounded-lg"
                                  disabled={actionLoading === `delete-${student.user.id}`}
                                  onClick={() => handleDeleteUser(student.user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Parents */}
            <TabsContent value="parents" className="mt-4 focus-visible:outline-none">
              <Card className="shadow-md border border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">Manage School Parents</CardTitle>
                      <CardDescription>View relationships, parent contacts, and linked children profiles.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search parent name, relation..."
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredParents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                      No parents found.
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead>Parent</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Email & Phone</TableHead>
                            <TableHead>Linked Students</TableHead>
                            <TableHead className="text-center">Permit Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredParents.map(parent => (
                            <TableRow key={parent.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {parent.user.firstName[0]}{parent.user.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="font-semibold text-sm">
                                    {parent.user.firstName} {parent.user.lastName}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium capitalize">
                                {parent.relation}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-foreground font-semibold">{parent.user.email}</div>
                                <div className="text-[10px] text-muted-foreground">{parent.user.profile?.phone || 'No Phone contact'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {parent.students.map((child, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[9px] font-semibold">
                                      {child.user.firstName} {child.user.lastName}
                                    </Badge>
                                  ))}
                                  {parent.students.length === 0 && (
                                    <span className="text-[10px] text-muted-foreground">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Badge className={parent.user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                    {parent.user.isActive ? "Allowed" : "Blocked"}
                                  </Badge>
                                  <Switch
                                    checked={parent.user.isActive}
                                    disabled={actionLoading === `user-${parent.user.id}`}
                                    onCheckedChange={() => handleToggleUser(parent.user.id, parent.user.isActive)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 rounded-lg"
                                  disabled={actionLoading === `delete-${parent.user.id}`}
                                  onClick={() => handleDeleteUser(parent.user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: All Users */}
            <TabsContent value="users" className="mt-4 focus-visible:outline-none">
              <Card className="shadow-md border border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">User Permission Control Room</CardTitle>
                      <CardDescription>Full login authorization switch for all users within the school directory.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative w-full sm:w-56">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search name, email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-9 h-9 rounded-xl text-xs"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-36 h-9 rounded-xl border-border/80 text-xs">
                          <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Roles</SelectItem>
                          <SelectItem value="ADMIN">Administrators</SelectItem>
                          <SelectItem value="TEACHER">Teachers</SelectItem>
                          <SelectItem value="STUDENT">Students</SelectItem>
                          <SelectItem value="PARENT">Parents</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                      No users match your criteria.
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email Address</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">Allow Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="font-semibold text-sm">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-muted-foreground">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-bold text-[10px] uppercase">
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <span className="text-[10px] font-semibold text-muted-foreground">
                                    {user.isActive ? "Allowed" : "Blocked"}
                                  </span>
                                  <Switch
                                    checked={user.isActive}
                                    disabled={actionLoading === `user-${user.id}`}
                                    onCheckedChange={() => handleToggleUser(user.id, user.isActive)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 rounded-lg"
                                  disabled={actionLoading === `delete-${user.id}`}
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      ) : (
        <Card className="shadow-md border border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold">School Registry ({schools.length})</CardTitle>
            <CardDescription>Overview of all institutions currently hosted on this multi-tenant platform.</CardDescription>
          </CardHeader>
          <CardContent>
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
                  {schools.map(school => (
                    <TableRow key={school.id}>
                      <TableCell className="font-bold text-sm text-foreground">
                        {school.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-bold text-muted-foreground">
                        {school.code}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-semibold">
                        {school.email || 'Not Configured'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {school.phone || 'Not Configured'}
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
                            onClick={() => setSelectedSchoolId(school.id)}
                          >
                            Edit & View
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
          </CardContent>
        </Card>
      )}

    </div>
  );
}
