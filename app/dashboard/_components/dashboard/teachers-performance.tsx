import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Award, Users } from "lucide-react";

const performanceData = [
  {
    name: "Dr. Sarah Johnson",
    department: "Mathematics",
    rating: 4.8,
    students: 156,
    improvement: "+0.2",
    status: "Excellent"
  },
  {
    name: "Prof. Michael Chen", 
    department: "Physics",
    rating: 4.6,
    students: 134,
    improvement: "+0.1",
    status: "Very Good"
  },
  {
    name: "Dr. Emily Rodriguez",
    department: "Chemistry", 
    rating: 4.9,
    students: 142,
    improvement: "+0.3",
    status: "Outstanding"
  },
  {
    name: "Ms. Lisa Thompson",
    department: "English",
    rating: 4.4,
    students: 98,
    improvement: "-0.1",
    status: "Good"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Outstanding': return 'bg-green-100 text-green-800';
    case 'Excellent': return 'bg-blue-100 text-blue-800';
    case 'Very Good': return 'bg-purple-100 text-purple-800';
    case 'Good': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function TeachersPerformance() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Teacher Performance</CardTitle>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            Avg. 4.7/5.0
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {performanceData.map((teacher, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">{teacher.students}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs font-medium">{teacher.rating}</span>
                  <span className={`text-xs ml-1 ${teacher.improvement.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {teacher.improvement}
                  </span>
                </div>
                <Badge className={getStatusColor(teacher.status)}>
                  {teacher.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Top Performer</span>
            </div>
            <span className="text-sm text-blue-700">Dr. Emily Rodriguez - Chemistry</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 