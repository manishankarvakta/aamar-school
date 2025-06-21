import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  MegaphoneIcon, 
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  AlertTriangle,
  Calendar,
  Send,
  FileText,
  CheckCircle,
  Bookmark
} from "lucide-react";

// Types for announcements
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "general" | "urgent" | "event" | "academic" | "holiday";
  audience: string[];
  author: string;
  authorAvatar: string;
  createdAt: string;
  scheduledAt?: string;
  status: "draft" | "scheduled" | "published" | "archived";
  priority: "low" | "medium" | "high";
  readCount: number;
  totalRecipients: number;
  attachments?: string[];
}

// Sample announcement data
const announcementsData: Announcement[] = [
  {
    id: 1,
    title: "Annual Sports Day - Registration Open",
    content: "We are excited to announce that registration for our Annual Sports Day is now open. Students from all grades are encouraged to participate in various sporting events...",
    type: "event",
    audience: ["Students", "Parents"],
    author: "Admin",
    authorAvatar: "/avatars/admin.png",
    createdAt: "2024-12-15",
    scheduledAt: "2024-12-16",
    status: "published",
    priority: "medium",
    readCount: 1247,
    totalRecipients: 1580,
    attachments: ["sports_day_form.pdf"]
  },
  {
    id: 2,
    title: "Emergency: School Closure Due to Weather",
    content: "Due to severe weather conditions, the school will remain closed tomorrow (December 16, 2024). All classes and activities are suspended until further notice...",
    type: "urgent",
    audience: ["Students", "Parents", "Teachers", "Staff"],
    author: "Principal",
    authorAvatar: "/avatars/principal.png",
    createdAt: "2024-12-15",
    status: "published",
    priority: "high",
    readCount: 2145,
    totalRecipients: 2156
  },
  {
    id: 3,
    title: "Parent-Teacher Conference Schedule",
    content: "The next Parent-Teacher conference is scheduled for December 20-21, 2024. Please check your individual schedules sent via email...",
    type: "academic",
    audience: ["Parents", "Teachers"],
    author: "Academic Coordinator",
    authorAvatar: "/avatars/coordinator.png",
    createdAt: "2024-12-14",
    status: "published",
    priority: "medium",
    readCount: 892,
    totalRecipients: 1247
  },
  {
    id: 4,
    title: "New Library Hours - Winter Break",
    content: "During the winter break, the library will operate on reduced hours. New timings: Monday-Friday 9:00 AM to 4:00 PM...",
    type: "general",
    audience: ["Students", "Teachers"],
    author: "Librarian",
    authorAvatar: "/avatars/librarian.png",
    createdAt: "2024-12-13",
    status: "scheduled",
    scheduledAt: "2024-12-18",
    priority: "low",
    readCount: 0,
    totalRecipients: 1456
  },
  {
    id: 5,
    title: "Christmas Holiday Notice",
    content: "School will be closed from December 23, 2024 to January 2, 2025 for Christmas holidays. Classes will resume on January 3, 2025...",
    type: "holiday",
    audience: ["Students", "Parents", "Teachers", "Staff"],
    author: "Admin",
    authorAvatar: "/avatars/admin.png",
    createdAt: "2024-12-10",
    status: "published",
    priority: "medium",
    readCount: 1987,
    totalRecipients: 2156
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "urgent": return "bg-red-100 text-red-800";
    case "event": return "bg-blue-100 text-blue-800";
    case "academic": return "bg-purple-100 text-purple-800";
    case "holiday": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "scheduled": return <Clock className="h-4 w-4 text-blue-600" />;
    case "draft": return <FileText className="h-4 w-4 text-gray-600" />;
    case "archived": return <Bookmark className="h-4 w-4 text-gray-400" />;
    default: return null;
  }
};

export default function AnnouncementsPage() {
  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create, manage, and track school-wide communications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MegaphoneIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Announcements</p>
                <p className="text-2xl font-bold">147</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">8,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input placeholder="Announcement title..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Audience</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea 
                  placeholder="Write your announcement here..." 
                  className="min-h-[120px]" 
                />
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
                <Button variant="outline" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search announcements..." className="pl-8" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcementsData.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority} priority
                      </Badge>
                      {getStatusIcon(announcement.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={announcement.authorAvatar} alt={announcement.author} />
                          <AvatarFallback>{announcement.author[0]}</AvatarFallback>
                        </Avatar>
                        {announcement.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {announcement.createdAt}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {announcement.audience.join(", ")}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {announcement.readCount}/{announcement.totalRecipients} read
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {announcement.attachments && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Attachments:</p>
                    <div className="flex space-x-2">
                      {announcement.attachments.map((attachment, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          📎 {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 