"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import * as React from "react";

const attendanceStats = [
  { label: "Teachers Present", value: "82", color: "text-green-600" },
  { label: "Teachers Absent", value: "7", color: "text-red-600" },
  { label: "Late arrivals", value: "3", color: "text-yellow-600" },
];

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

export function TeachersAttendance() {
  const [date, setDate] = React.useState<Date | undefined>(new Date("2024-12-07"));
  
  return (
    <Card className="">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Teachers Attendance</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 h-9 text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>07-12-2024</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
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
              <p className="text-sm font-medium text-blue-900">Staff Attendance Reports</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        </div>
        
      </CardContent>
    </Card>
  );
} 