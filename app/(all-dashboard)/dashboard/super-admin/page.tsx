'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building2, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  ArrowRight,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { getSuperAdminStats } from '@/app/actions/super-admin';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer
} from 'recharts';

export default function SuperAdminPage() {
  const { toast } = useToast();
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load initial global stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getSuperAdminStats();
      if (res.success && res.data) {
        setOverallStats(res.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load system stats."
        });
      }
    } catch (error) {
      console.error('Error loading super admin stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load system data."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Control Center...</p>
      </div>
    );
  }

  const stats = {
    schools: overallStats?.totalSchools || 0,
    students: overallStats?.totalStudents || 0,
    boys: overallStats?.studentGender.male || 0,
    girls: overallStats?.studentGender.female || 0,
    teachers: overallStats?.totalTeachers || 0,
    maleTeachers: overallStats?.teacherGender.male || 0,
    femaleTeachers: overallStats?.teacherGender.female || 0,
    staff: overallStats?.totalStaff || 0,
    parents: overallStats?.totalParents || 0
  };

  return (
    <div className="space-y-8 pb-[120px] p-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <span>Super Admin Control Center</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global management hub for registered institutions, student directories, teacher directories, and operational logs.
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm" className="gap-2 rounded-xl h-10">
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </Button>
      </div>

      {/* Grid of aggregated statistics */}
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

      {/* Chart Section */}
      {stats.schools > 0 && overallStats?.topSchools?.length > 0 && (
        <Card className="shadow-md border border-border/60 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Institution Population Distribution</span>
            </CardTitle>
            <CardDescription>
              Demographics (Students and Teachers) for the top 5 schools (sorted by student population).
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-4 h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overallStats.topSchools}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  className="text-xs font-semibold fill-muted-foreground"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  className="text-xs font-semibold fill-muted-foreground"
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border/85 p-3 rounded-xl shadow-xl space-y-1.5 backdrop-blur-md">
                          <p className="text-xs font-bold text-foreground">{payload[0].payload.name}</p>
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span className="text-blue-500 font-medium">
                              🧑‍🎓 Students: <strong className="text-foreground">{payload[0].value}</strong>
                            </span>
                            <span className="text-violet-500 font-medium">
                              👨‍🏫 Teachers: <strong className="text-foreground">{payload[1].value}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <RechartsLegend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="students" 
                  name="Students" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                />
                <Bar 
                  dataKey="teachers" 
                  name="Teachers" 
                  fill="#8b5cf6" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Navigation Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Quick Management Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Schools */}
          <Card className="shadow-md border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[250px] relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-all duration-300" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Institutions Registry</CardTitle>
                  <CardDescription>Manage school accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 flex-1 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add institutions, toggle school active states, verify system-wide configurations, or impersonate administrators directly to review dashboard configurations.
              </p>
              <div className="pt-4 flex items-center justify-between z-10">
                <span className="text-xs font-bold text-muted-foreground">
                  🏫 {stats.schools} Schools
                </span>
                <Link href="/dashboard/super-admin/schools" passHref>
                  <Button size="sm" className="gap-1 rounded-lg text-xs font-semibold">
                    Manage Schools
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card: Students */}
          <Card className="shadow-md border border-border/60 hover:border-violet-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[250px] relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/5 rounded-full group-hover:bg-violet-500/10 transition-all duration-300" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 text-violet-500 rounded-xl shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Students Directory</CardTitle>
                  <CardDescription>System-wide student list</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 flex-1 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check registered student details across all hosting tenants, view classes and sections, run global roll searches, or suspend login access instantly.
              </p>
              <div className="pt-4 flex items-center justify-between z-10">
                <span className="text-xs font-bold text-muted-foreground">
                  🧑‍🎓 {stats.students} Students
                </span>
                <Link href="/dashboard/super-admin/students" passHref>
                  <Button size="sm" variant="secondary" className="gap-1 rounded-lg text-xs font-semibold bg-violet-500 hover:bg-violet-600 text-white">
                    Manage Students
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card: Teachers */}
          <Card className="shadow-md border border-border/60 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-[250px] relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-all duration-300" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Teachers Directory</CardTitle>
                  <CardDescription>System-wide instructor list</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 flex-1 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed">
                View instructor profiles, qualifications, and specializations across all school nodes. Control authentication switches or audit employee lists globally.
              </p>
              <div className="pt-4 flex items-center justify-between z-10">
                <span className="text-xs font-bold text-muted-foreground">
                  👨‍🏫 {stats.teachers} Teachers
                </span>
                <Link href="/dashboard/super-admin/teachers" passHref>
                  <Button size="sm" variant="secondary" className="gap-1 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white">
                    Manage Teachers
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
