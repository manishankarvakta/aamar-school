import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Calendar } from "lucide-react";
import Link from 'next/link';

// Types
interface ScheduleItem {
  subject: string;
  teacher: string;
  room: string;
  isBreak?: boolean;
}

// Sample data for class routine
const timeSlots = [
  "9:00 - 9:45",
  "9:45 - 10:30", 
  "10:30 - 11:15",
  "11:15 - 11:30", // Break
  "11:30 - 12:15",
  "12:15 - 1:00",
  "1:00 - 1:45", // Lunch
  "1:45 - 2:30",
  "2:30 - 3:15"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const sampleSchedule: Record<string, Record<string, ScheduleItem>> = {
  "Monday": {
    "9:00 - 9:45": { subject: "Mathematics", teacher: "Ms. Sarah", room: "Room 101" },
    "9:45 - 10:30": { subject: "English", teacher: "Mr. John", room: "Room 102" },
    "10:30 - 11:15": { subject: "Science", teacher: "Dr. Smith", room: "Lab 1" },
    "11:15 - 11:30": { subject: "Break", teacher: "", room: "", isBreak: true },
    "11:30 - 12:15": { subject: "History", teacher: "Ms. Davis", room: "Room 103" },
    "12:15 - 1:00": { subject: "Physical Ed", teacher: "Coach Mike", room: "Gym" },
    "1:00 - 1:45": { subject: "Lunch Break", teacher: "", room: "", isBreak: true },
    "1:45 - 2:30": { subject: "Art", teacher: "Ms. Wilson", room: "Art Room" },
    "2:30 - 3:15": { subject: "Music", teacher: "Mr. Brown", room: "Music Room" }
  },
  // Add similar data for other days...
};

const getScheduleItem = (day: string, time: string) => {
  const daySchedule = sampleSchedule[day as keyof typeof sampleSchedule];
  if (!daySchedule) return null;
  return daySchedule[time as keyof typeof daySchedule] || null;
};

export default function ClassRoutinePage() {
  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Routine</h1>
          <p className="text-muted-foreground">
            Manage and view class schedules and timetables
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Link href="/dashboard/class-routine/addRoutine">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select defaultValue="7th-a">
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7th-a">Class 7A</SelectItem>
                  <SelectItem value="7th-b">Class 7B</SelectItem>
                  <SelectItem value="8th-a">Class 8A</SelectItem>
                  <SelectItem value="8th-b">Class 8B</SelectItem>
                  <SelectItem value="9th-a">Class 9A</SelectItem>
                  <SelectItem value="10th-a">Class 10A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Academic Year</label>
              <Select defaultValue="2024-25">
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select defaultValue="term-1">
                <SelectTrigger>
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term-1">Term 1</SelectItem>
                  <SelectItem value="term-2">Term 2</SelectItem>
                  <SelectItem value="term-3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Weekly Schedule - Class 7A</CardTitle>
            <Badge variant="secondary">Current Week</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium">
                    Time
                  </th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 font-medium bg-gray-50">
                      {timeSlot}
                    </td>
                    {daysOfWeek.map((day) => {
                      const scheduleItem = getScheduleItem(day, timeSlot);
                      
                      if (!scheduleItem) {
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3 text-center text-gray-400">
                            -
                          </td>
                        );
                      }

                      if (scheduleItem.isBreak) {
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3 text-center">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              {scheduleItem.subject}
                            </Badge>
                          </td>
                        );
                      }

                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{scheduleItem.subject}</div>
                            <div className="text-xs text-gray-600">{scheduleItem.teacher}</div>
                            <div className="text-xs text-gray-500">{scheduleItem.room}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">Total Periods/Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Teaching Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">45min</div>
            <p className="text-xs text-muted-foreground">Period Duration</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 