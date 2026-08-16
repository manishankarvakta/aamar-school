import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Activity,
  GraduationCap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TeacherPerformance {
  id: string;
  name: string;
  department: string;
  qualification: string;
  experience: number;
  rating: number;
  students: number;
  classes: number;
  attendanceRate: number;
  improvement: string;
  status: string;
  initials: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { badge: string; ring: string; dot: string }> = {
  Outstanding: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    ring: "ring-emerald-400",
    dot: "bg-emerald-500",
  },
  Excellent: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    ring: "ring-blue-400",
    dot: "bg-blue-500",
  },
  "Very Good": {
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
    ring: "ring-violet-400",
    dot: "bg-violet-500",
  },
  Good: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    ring: "ring-amber-400",
    dot: "bg-amber-500",
  },
  Average: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ring: "ring-gray-400",
    dot: "bg-gray-400",
  },
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="relative inline-block">
          <Star className="h-3 w-3 text-gray-200 dark:text-gray-700 fill-current" />
          {i < full && (
            <Star className="h-3 w-3 text-yellow-400 fill-current absolute inset-0" />
          )}
          {i === full && partial > 0 && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partial * 100}%` }}
            >
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function AttendanceBar({ rate }: { rate: number }) {
  const color =
    rate >= 90
      ? "bg-emerald-500"
      : rate >= 75
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-7 shrink-0">
        {rate}%
      </span>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TeachersPerformance({
  performanceDataList = [],
}: {
  performanceDataList?: TeacherPerformance[];
}) {
  const avgRating =
    performanceDataList.length > 0
      ? (
          performanceDataList.reduce((s, t) => s + t.rating, 0) /
          performanceDataList.length
        ).toFixed(1)
      : "0.0";

  const topTeacher =
    performanceDataList.length > 0 ? performanceDataList[0] : null;

  return (
    <Card className="overflow-hidden">
      {/* ── Header ── */}
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-violet-500" />
            Teacher Performance
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            Avg {avgRating} / 5.0
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        {/* ── Empty state ── */}
        {performanceDataList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
            <GraduationCap className="w-8 h-8 opacity-30" />
            <p className="text-xs">No teacher data available.</p>
          </div>
        ) : (
          <>
            {/* ── Teacher list ── */}
            <div className="space-y-2">
              {performanceDataList.map((teacher, idx) => {
                const styles =
                  STATUS_STYLES[teacher.status] ?? STATUS_STYLES["Average"];
                const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isPositive = teacher.improvement.startsWith("+");

                return (
                  <div
                    key={teacher.id ?? idx}
                    className="group rounded-xl border bg-card hover:bg-muted/40 transition-all duration-200 p-2.5 space-y-2"
                  >
                    {/* Row 1: Avatar + Name + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${avatarGrad} ring-2 ${styles.ring} ring-offset-1 flex items-center justify-center`}
                        >
                          <span className="text-[10px] font-bold text-white">
                            {teacher.initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate leading-tight">
                            {teacher.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate leading-tight">
                            {teacher.department} · {teacher.experience}y exp
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`text-[9px] px-1.5 py-0 h-4 shrink-0 font-semibold border-0 ${styles.badge}`}
                      >
                        {teacher.status}
                      </Badge>
                    </div>

                    {/* Row 2: Star rating + improvement */}
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={teacher.rating} />
                        <span className="text-[10px] font-semibold text-foreground">
                          {teacher.rating}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-500"
                          }`}
                        >
                          {teacher.improvement}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />
                          {teacher.students}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <BookOpen className="w-2.5 h-2.5" />
                          {teacher.classes}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Attendance bar */}
                    <div className="flex items-center gap-1.5 px-0.5">
                      <Activity className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                      <AttendanceBar rate={teacher.attendanceRate} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Top performer banner ── */}
            {topTeacher && (
              <div className="mt-1 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200/60 dark:border-violet-800/40 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <span className="text-[11px] font-semibold text-violet-800 dark:text-violet-300">
                    Top Performer
                  </span>
                </div>
                <span className="text-[11px] text-violet-700 dark:text-violet-400 font-medium truncate max-w-[120px]">
                  {topTeacher.name}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}