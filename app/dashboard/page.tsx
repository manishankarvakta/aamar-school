import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsOverview } from "./_components/dashboard/students-overview";
import { TeachersOverview } from "./_components/dashboard/teachers-overview";
import { getSubjects, getSubjectStats } from "@/app/actions/subjects";
import { getTeacherStats } from "@/app/actions/teachers";
import { OverallAttendance } from "./_components/dashboard/overall-attendance";
import { Announcements } from "./_components/dashboard/announcements";
import { Performance } from "./_components/dashboard/performance";
import { DashboardCalendar } from "./_components/dashboard/calendar";
import { OnLeave } from "./_components/dashboard/on-leave";
import { TeachersAttendance } from "./_components/dashboard/teachers-attendance";
import { TeachersPerformance } from "./_components/dashboard/teachers-performance";
import { TeachersOnLeave } from "./_components/dashboard/teachers-on-leave";
import { TeachersAnnouncements } from "./_components/dashboard/teachers-announcements";
import { Book, FlaskConical, Library, Ruler } from "lucide-react";

const icons = [
  { Icon: Book, props: { className: "absolute top-8 left-8 w-12 h-12 text-gray-700/40 transform -rotate-12 opacity-40" } },
  { Icon: FlaskConical, props: { className: "absolute top-16 right-1/4 w-10 h-10 text-gray-700/40 transform rotate-12 opacity-40" } },
  { Icon: Ruler, props: { className: "absolute bottom-4 left-1/4 w-12 h-12 text-gray-700/40 transform rotate-6 opacity-40" } },
  { Icon: Library, props: { className: "absolute top-4 right-8 w-16 h-16 text-gray-700/40 transform -rotate-6 opacity-40" } },
];

export default async function DashboardPage() {
  // Fetch data in parallel
  const [subjectsResult, subjectStatsResult, teacherStatsResult] = await Promise.all([
    getSubjects(),
    getSubjectStats(),
    getTeacherStats(),
  ]);

  // Extract data safely
  const totalStudents = subjectsResult.success
    ? subjectsResult.data.reduce((sum: number, s: any) => sum + (s.class?.studentCount || 0), 0)
    : 0;
  const totalSubjects = subjectStatsResult.success ? subjectStatsResult.data.totalSubjects : 0;
  const totalTeachers = teacherStatsResult.success && teacherStatsResult.data && typeof teacherStatsResult.data === 'object' && 'totalTeachers' in teacherStatsResult.data
    ? teacherStatsResult.data.totalTeachers
    : 0;
  const activeTeachers = teacherStatsResult.success && teacherStatsResult.data && typeof teacherStatsResult.data === 'object' && 'activeTeachers' in teacherStatsResult.data
    ? teacherStatsResult.data.activeTeachers
    : 0;

  return (
    <div className="flex-1 space-y-3">
      <Tabs defaultValue="students" className="space-y-3">
        <div className="relative px-6 overflow-hidden pt-4">
          {/* {icons.map(({ Icon, props }, index) => (
            <Icon key={index} {...props} />
          ))} */}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="mb-3">
                  <h2 className="text-xl font-bold">Welcome Back,</h2>
                  <p className="text-xs">Here&apos;s your updated overview</p>
              </div>
              <TabsList className="border border-slate-700 h-8">
                  <TabsTrigger value="students" className=" text-xs px-3">Students</TabsTrigger>
                  <TabsTrigger value="teachers" className=" text-xs px-3">Teachers</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="students" className="space-y-3 px-4 md:px-6 mt-[-80px] z-10 pb-[150px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <StudentsOverview totalStudents={totalStudents} totalSubjects={totalSubjects} />
              <OverallAttendance />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Performance />
                <DashboardCalendar />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <OnLeave />
              <Announcements />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="teachers" className="space-y-3 px-4 md:px-6 mt-[-80px] z-10 pb-[150px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <TeachersOverview totalTeachers={totalTeachers} activeTeachers={activeTeachers} />
              <TeachersAttendance />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TeachersPerformance />
                <DashboardCalendar />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <TeachersOnLeave />
              <TeachersAnnouncements />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
