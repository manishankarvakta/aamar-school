'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Megaphone,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock
} from 'lucide-react';
import { TeacherDashboardLayout } from './teacher-dashboard-layout';

interface TeacherDashboardClientProps {
  data: {
    profile: {
      id: string;
      employeeId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      dateOfBirth?: Date | null;
      gender?: string | null;
      bloodGroup: string;
      qualification: string;
      experience: number;
      specialization: string;
      joiningDate: Date;
      branchName: string;
    };
    routine: {
      slots: Array<any>;
    };
    classesCount: number;
    studentsCount: number;
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      createdAt: Date;
      author: string;
    }>;
  };
}

export function TeacherDashboardClient({ data }: TeacherDashboardClientProps) {
  const { profile, routine, classesCount, studentsCount, announcements } = data;

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const layoutStats = {
    classesCount,
    studentsCount,
    slotsCount: routine.slots.length,
    announcementCount: announcements.length,
  };

  return (
    <TeacherDashboardLayout profile={profile} stats={layoutStats}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-700" />
                Personal & Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">FULL NAME</span>
                    <span className="text-sm font-medium">{profile.firstName} {profile.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">EMAIL ADDRESS</span>
                    <span className="text-sm font-medium break-all">{profile.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">PHONE NUMBER</span>
                    <span className="text-sm font-medium">{profile.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">ADDRESS</span>
                    <span className="text-sm font-medium">{profile.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">SPECIALIZATION</span>
                    <span className="text-sm font-medium">{profile.specialization}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">EXPERIENCE / JOINING DATE</span>
                    <span className="text-sm font-medium">{profile.experience} years / {formatDate(profile.joiningDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">DATE OF BIRTH / GENDER</span>
                    <span className="text-sm font-medium">
                      {formatDate(profile.dateOfBirth)} / {profile.gender || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">BLOOD GROUP</span>
                    <span className="text-sm font-medium">{profile.bloodGroup}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Side Panel */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-emerald-700" />
                School Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No active announcements at the moment.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border-l-4 border-emerald-600 bg-slate-50/50 p-4 rounded-r-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 text-sm">{ann.title}</h4>
                      <Badge variant={ann.type === 'URGENT' ? 'destructive' : 'secondary'} className="text-[10px] px-2 py-0.5 font-bold">
                        {ann.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{ann.message}</p>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground font-medium">
                      <span>By {ann.author}</span>
                      <span>{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </TeacherDashboardLayout>
  );
}
