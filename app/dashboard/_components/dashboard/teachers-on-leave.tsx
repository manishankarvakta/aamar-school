import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";

const getLeaveTypeColor = (type: string) => {
  switch (type) {
    case 'Sick Leave': return 'bg-red-100 text-red-800';
    case 'Personal Leave': return 'bg-blue-100 text-blue-800';
    case 'Emergency Leave': return 'bg-orange-100 text-orange-800';
    case 'Annual Leave': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function TeachersOnLeave({
  teachersOnLeaveList = [],
}: {
  teachersOnLeaveList?: Array<{
    name: string;
    department: string;
    leaveType: string;
    duration: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Teachers on Leave</CardTitle>
          <Badge variant="outline" className="text-xs">
            {teachersOnLeaveList.length} teachers
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {teachersOnLeaveList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No teachers on leave today.</p>
        ) : (
          <div className="space-y-4">
            {teachersOnLeaveList.map((teacher, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.department}</p>
                  </div>
                  <Badge className={getStatusColor(teacher.status)}>
                    {teacher.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getLeaveTypeColor(teacher.leaveType)}>
                    {teacher.leaveType}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {teacher.duration}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {teacher.startDate}
                  </div>
                  <span>to {teacher.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">Coverage Arranged</span>
            <span className="text-xs text-yellow-700">All classes covered by substitute teachers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 