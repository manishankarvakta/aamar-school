import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Users, Calendar } from "lucide-react";

const announcements = [
  {
    title: "Staff Meeting - Curriculum Planning",
    description: "Monthly staff meeting to discuss curriculum updates and semester planning for next academic year.",
    priority: "High",
    category: "Meeting",
    date: "Dec 10, 2024",
    time: "2:00 PM",
    audience: "All Teachers"
  },
  {
    title: "Professional Development Workshop",
    description: "Workshop on modern teaching methodologies and digital classroom integration techniques.",
    priority: "Medium", 
    category: "Training",
    date: "Dec 15, 2024",
    time: "10:00 AM",
    audience: "Optional"
  },
  {
    title: "Parent-Teacher Conference Schedule",
    description: "Schedule for upcoming parent-teacher conferences. Please review your assigned time slots.",
    priority: "High",
    category: "Event",
    date: "Dec 20-22, 2024",
    time: "All Day",
    audience: "All Teachers"
  },
  {
    title: "Year-End Assessment Guidelines",
    description: "Updated guidelines for year-end student assessments and grading criteria.",
    priority: "Medium",
    category: "Academic",
    date: "Dec 8, 2024",
    time: "N/A",
    audience: "Subject Teachers"
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Meeting': return 'bg-blue-100 text-blue-800';
    case 'Training': return 'bg-purple-100 text-purple-800';
    case 'Event': return 'bg-green-100 text-green-800';
    case 'Academic': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function TeachersAnnouncements() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Staff Announcements
          </CardTitle>
          <Button variant="outline" size="sm" className="text-xs">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{announcement.title}</h4>
                <Badge className={getPriorityColor(announcement.priority)}>
                  {announcement.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {announcement.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(announcement.category)}>
                    {announcement.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {announcement.audience}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {announcement.date}
                  </div>
                  {announcement.time !== "N/A" && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {announcement.time}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Upcoming Events</span>
            <span className="text-xs text-blue-700">3 events this week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 