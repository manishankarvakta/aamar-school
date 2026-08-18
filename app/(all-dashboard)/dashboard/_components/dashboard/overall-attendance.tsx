"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import * as React from "react";
import { format } from "date-fns";
import { getAttendanceStats, getStudentsAttendanceList } from "@/app/actions/attendance";

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

// Helper to convert Date object to YYYY-MM-DD string at local time
const formatDateLocal = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export function OverallAttendance({
  present = 0,
  absent = 0,
  late = 0,
}: {
  present?: number;
  absent?: number;
  late?: number;
}) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [stats, setStats] = React.useState({ present, absent, late });
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  // Sync props to state if props change from parent
  React.useEffect(() => {
    setStats({ present, absent, late });
  }, [present, absent, late]);

  const handleDateChange = async (newDate: Date | undefined) => {
    setDate(newDate);
    if (!newDate) return;

    setLoading(true);
    try {
      const dateStr = formatDateLocal(newDate);
      const result = await getAttendanceStats(dateStr);
      if (result.success && result.stats) {
        setStats({
          present: result.stats.presentToday,
          absent: result.stats.absentToday,
          late: result.stats.lateToday,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!date) return;
    setDownloading(true);
    try {
      const dateStr = formatDateLocal(date);
      const result = await getStudentsAttendanceList(dateStr);
      if (result.success && result.data) {
        // Generate CSV content
        const headers = ["Roll No", "Student ID", "Name", "Class", "Section", "Attendance Status", "Parent Contact"];
        const rows = result.data.map(student => [
          student.rollNo,
          student.studentId,
          student.name,
          student.class,
          student.section,
          student.today,
          student.parentContact
        ]);

        // Convert to CSV string (with quotes to handle commas/spaces in fields)
        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))
        ].join("\r\n");

        // Add UTF-8 BOM so Excel opens it with proper encoding
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);

        const formattedDate = format(date, "dd-MM-yyyy");
        link.setAttribute("download", `Student_Attendance_${formattedDate}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const attendanceStats = [
    { label: "No. of Present", value: loading ? "..." : stats.present.toLocaleString(), color: "text-green-600" },
    { label: "No. of Absent", value: loading ? "..." : stats.absent.toLocaleString(), color: "text-red-600" },
    { label: "Late arrivals", value: loading ? "..." : stats.late.toLocaleString(), color: "text-yellow-600" },
  ];

  return (
    <Card className="">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Overall Attendance</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 h-9 text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>{date ? format(date, "dd-MM-yyyy") : "Select date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {attendanceStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
          <div className="">
            <div className="flex flex-col items-center justify-between bg-blue-50 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Attendance Reports</p>
              </div>
              <Button 
                onClick={handleDownload} 
                disabled={downloading || !date} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
