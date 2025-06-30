"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Users2,
  UserCheck,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  User,
  MapPin,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  getParents,
  getParentStats,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
} from "@/app/actions/parents";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Import server actions - Note: Server actions file created, ready to use
// import {
//   getParents,
//   getParentById,
//   createParent,
//   updateParent,
//   deleteParent,
//   getParentStats,
//   searchParents
// } from "@/actions/parents";

interface Parent {
  id: string;
  parentId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  relation: string;
  occupation?: string;
  students: StudentInfo[];
  totalStudents: number;
  lastContact?: Date;
  status: string;
  createdAt?: Date;
}

interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  branch?: string;
}

interface ParentDetails {
  id: string;
  parent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null | undefined;
    dateOfBirth: Date | null | undefined;
    gender: string | null | undefined;
    address: string | null | undefined;
    nationality: string | null | undefined;
    religion: string | null | undefined;
    relation: string;
  };
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  branch?: {
    name: string;
    address: string;
    phone: string;
  } | null;
  students: any[];
  totalStudents: number;
  status: string;
}

interface ParentStats {
  totalParents: number;
  activeParents: number;
  inactiveParents?: number;
  maleParents?: number;
  femaleParents?: number;
  newThisMonth: number;
  parentsWithMultipleChildren: number;
  messagesSent: number;
  pendingIssues: number;
}

const getStatusColor = (status: string) => {
  return status === "Active"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
};

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [stats, setStats] = useState<ParentStats>({
    totalParents: 0,
    activeParents: 0,
    newThisMonth: 0,
    parentsWithMultipleChildren: 0,
    messagesSent: 0,
    pendingIssues: 0,
  });
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedParents, setPaginatedParents] = useState<Parent[]>([]);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedParentDetails, setSelectedParentDetails] =
    useState<ParentDetails | null>(null);

  // Form states
  const [actionLoading, setActionLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPurpose, setAppointmentPurpose] = useState("");

  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchParents();
    fetchStats();
  }, []);

  // Search and filter effect - this should be the main filtering logic
  useEffect(() => {
    let filtered = parents;

    // Apply search filter first if there's a search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (parent) =>
          parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.relation.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (parent) => parent.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Apply class filter (by student's class)
    if (classFilter !== "all") {
      filtered = filtered.filter((parent) =>
        parent.students.some((student) =>
          student.class.toLowerCase().includes(classFilter.toLowerCase()),
        ),
      );
    }

    setFilteredParents(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [parents, statusFilter, classFilter, searchQuery]);

  // Pagination effect - calculate paginated results
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredParents.slice(startIndex, endIndex);
    setPaginatedParents(paginated);
  }, [filteredParents, currentPage, itemsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredParents.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Mock functions for now - replace with real server actions when ready
  const mockGetParents = () => ({
    success: true,
    data: [],
  });

  const mockGetParentStats = () => ({
    success: true,
    data: {
      totalParents: 0,
      activeParents: 0,
      newThisMonth: 0,
      parentsWithMultipleChildren: 0,
      messagesSent: 0,
      pendingIssues: 0,
    },
  });

  const fetchParents = async () => {
    try {
      setLoading(true);
      const result = await getParents();
      if (result && result.success && result.data) {
        // Transform the nested data structure to match Parent interface
        const transformedParents = (result.data as any[]).map(
          (parent: any) => ({
            id: parent.id,
            parentId: parent.id,
            name: `${parent.user?.firstName || ""} ${parent.user?.lastName || ""}`.trim(),
            firstName: parent.user?.firstName || "",
            lastName: parent.user?.lastName || "",
            email: parent.user?.email || "",
            phone: parent.user?.profile?.phone || "N/A",
            relation: parent.relation || "Parent",
            occupation: parent.user?.profile?.occupation || "N/A",
            students:
              parent.students?.map((student: any) => ({
                id: student.id,
                name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
                rollNumber: student.rollNumber || "N/A",
                class: student.section?.class?.name || "N/A",
                branch: student.section?.class?.branch?.name || "N/A",
              })) || [],
            totalStudents: parent.students?.length || 0,
            lastContact: parent.user?.updatedAt || new Date(),
            status: parent.user?.isActive ? "Active" : "Inactive",
            createdAt: parent.user?.createdAt || new Date(),
          }),
        );
        setParents(transformedParents);
        setFilteredParents(transformedParents);
      } else {
        console.error("Failed to fetch parents");
      }
    } catch (error) {
      console.error("Failed to fetch parents");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getParentStats();
      if (result.success && result.data) {
        // Transform stats data to match ParentStats interface
        const statsData = result.data as any;
        setStats({
          totalParents: statsData.totalParents || 0,
          activeParents: statsData.activeParents || 0,
          inactiveParents: statsData.inactiveParents || 0,
          maleParents: statsData.maleParents || 0,
          femaleParents: statsData.femaleParents || 0,
          newThisMonth: statsData.newThisMonth || 0,
          parentsWithMultipleChildren:
            statsData.parentsWithMultipleChildren || 0,
          messagesSent: statsData.messagesSent || 0,
          pendingIssues: statsData.pendingIssues || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleViewDetails = async (parent: Parent) => {
    try {
      setActionLoading(true);
      const result = await getParentById(parent.id);
      if (result.success && result.data) {
        // Transform parent details data to match ParentDetails interface
        const parentData = result.data as any;
        const transformedDetails: ParentDetails = {
          id: parentData.id,
          parent: {
            firstName: parentData.user?.firstName || "",
            lastName: parentData.user?.lastName || "",
            email: parentData.user?.email || "",
            phone: parentData.user?.profile?.phone || null,
            dateOfBirth: parentData.user?.profile?.dateOfBirth || null,
            gender: parentData.user?.profile?.gender || null,
            address: parentData.user?.profile?.address || null,
            nationality: parentData.user?.profile?.nationality || null,
            religion: parentData.user?.profile?.religion || null,
            relation: parentData.relation || "Parent",
          },
          school: {
            name: "School Name", // TODO: Get from session or config
            address: "School Address",
            phone: "School Phone",
            email: "school@example.com",
          },
          branch: parentData.user?.branch
            ? {
                name: parentData.user.branch.name,
                address: parentData.user.branch.address,
                phone: parentData.user.branch.phone,
              }
            : null,
          students: parentData.students || [],
          totalStudents: parentData.students?.length || 0,
          status: parentData.user?.isActive ? "Active" : "Inactive",
        };

        setSelectedParentDetails(transformedDetails);
        setSelectedParent(parent);
        setViewDialogOpen(true);
      } else {
        console.error("Failed to fetch parent details");
      }
    } catch (error) {
      console.error("Failed to fetch parent details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setEditDialogOpen(true);
  };

  const handleDelete = (parent: Parent) => {
    setSelectedParent(parent);
    setDeleteDialogOpen(true);
  };

  const handleMessage = (parent: Parent) => {
    setSelectedParent(parent);
    setMessageDialogOpen(true);
    setMessageSubject(""); // Reset form
    setMessageText("");
  };

  const handlePhone = (parent: Parent) => {
    setSelectedParent(parent);
    setPhoneDialogOpen(true);
  };

  const handleCalendar = (parent: Parent) => {
    setSelectedParent(parent);
    setCalendarDialogOpen(true);
    setAppointmentDate(""); // Reset form
    setAppointmentTime("");
    setAppointmentPurpose("");
  };

  const handleSendMessage = async () => {
    if (!selectedParent || !messageSubject.trim() || !messageText.trim()) {
      console.error("Please fill in all message fields");
      return;
    }

    try {
      setActionLoading(true);

      // Here you would integrate with your messaging system
      // For now, we'll simulate the action
      console.log("Sending message to:", selectedParent.email);
      console.log("Subject:", messageSubject);
      console.log("Message:", messageText);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Message sent successfully!");
      setMessageDialogOpen(false);
      setMessageSubject("");
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (
      !selectedParent ||
      !appointmentDate ||
      !appointmentTime ||
      !appointmentPurpose.trim()
    ) {
      console.error("Please fill in all appointment fields");
      return;
    }

    try {
      setActionLoading(true);

      // Here you would integrate with your calendar/appointment system
      console.log("Scheduling appointment with:", selectedParent.name);
      console.log("Date:", appointmentDate);
      console.log("Time:", appointmentTime);
      console.log("Purpose:", appointmentPurpose);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Appointment scheduled successfully!");
      setCalendarDialogOpen(false);
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentPurpose("");
    } catch (error) {
      console.error("Failed to schedule appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallParent = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== "N/A") {
      // Open phone dialer on mobile or copy to clipboard on desktop
      if (typeof window !== "undefined") {
        window.open(`tel:${phoneNumber}`, "_self");
      }
    }
  };

  const handleEmailParent = (email: string) => {
    if (email) {
      // Open email client
      if (typeof window !== "undefined") {
        window.open(`mailto:${email}`, "_self");
      }
    }
  };

  const handleCreateParent = async (formData: FormData) => {
    try {
      setActionLoading(true);

      // Extract form data values
      const parentData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        gender: formData.get("gender") as "MALE" | "FEMALE" | "OTHER",
        occupation: formData.get("occupation") as string,
        relationship: formData.get("relationship") as string,
        emergencyContact: formData.get("emergencyContact") as string,
        branchId: formData.get("branchId") as string,
      };

      const result = await createParent(parentData);

      if (result.success) {
        console.log("Parent created successfully");
        setAddDialogOpen(false);
        fetchParents();
        fetchStats();
      } else {
        console.error("Failed to create parent:", result.message);
      }
    } catch (error) {
      console.error("Failed to create parent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateParent = async (formData: FormData) => {
    if (!selectedParent) return;

    try {
      setActionLoading(true);

      // Extract form data values
      const parentData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        gender: formData.get("gender") as "MALE" | "FEMALE" | "OTHER",
        occupation: formData.get("occupation") as string,
        relationship: formData.get("relationship") as string,
        emergencyContact: formData.get("emergencyContact") as string,
        branchId: formData.get("branchId") as string,
      };

      const result = await updateParent(selectedParent.id, parentData);

      if (result.success) {
        console.log("Parent updated successfully");
        setEditDialogOpen(false);
        fetchParents();
        fetchStats();
      } else {
        console.error("Failed to update parent:", result.message);
      }
    } catch (error) {
      console.error("Failed to update parent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent) return;

    try {
      setActionLoading(true);
      const result = await deleteParent(selectedParent.id);

      if (result.success) {
        console.log("Parent deleted successfully");
        setDeleteDialogOpen(false);
        fetchParents();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete parent",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete parent");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading parents...</span>
        </div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Parent Management
            </h1>
            <p className="text-muted-foreground">
              Manage parent profiles, communication, and student relationships
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
            onClick={()=> setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Parent
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Parents
                  </p>
                  <p className="text-2xl font-bold">{stats.totalParents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Parents
                  </p>
                  <p className="text-2xl font-bold">{stats.activeParents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Messages Sent
                  </p>
                  <p className="text-2xl font-bold">{stats.messagesSent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Issues
                  </p>
                  <p className="text-2xl font-bold">{stats.pendingIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Parents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search parents by name, email, or phone..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class 1">Class 1</SelectItem>
                  <SelectItem value="Class 2">Class 2</SelectItem>
                  <SelectItem value="Class 3">Class 3</SelectItem>
                  <SelectItem value="Class 4">Class 4</SelectItem>
                  <SelectItem value="Class 5">Class 5</SelectItem>
                  <SelectItem value="Class 6">Class 6</SelectItem>
                  <SelectItem value="Class 7">Class 7</SelectItem>
                  <SelectItem value="Class 8">Class 8</SelectItem>
                  <SelectItem value="Class 9">Class 9</SelectItem>
                  <SelectItem value="Class 10">Class 10</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parents List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Parents Directory ({filteredParents.length} total)
              </CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) =>
                    handleItemsPerPageChange(Number(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredParents.length === 0 ? (
              <div className="text-center py-8">
                <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No parents found</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedParents.map((parent) => (
                    <div
                      key={parent.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {parent.firstName?.[0]}
                              {parent.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{parent.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {parent.relation} - {parent.occupation}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {parent.email}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {parent.phone || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge className={getStatusColor(parent.status)}>
                              {parent.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last contact:{" "}
                              {parent.lastContact
                                ? new Date(
                                    parent.lastContact,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(parent)}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(parent)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(parent)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMessage(parent)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Message</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePhone(parent)}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Call</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCalendar(parent)}
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Schedule</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      {/* Children Information */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">
                          Children ({parent.totalStudents}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {parent.students.map((student, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {student.name} - {student.class} (
                              {student.rollNumber})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {startItem} to {endItem} of{" "}
                        {filteredParents.length} results
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {/* Show page numbers */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </Button>
                            );
                          },
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Parent Details
                {selectedParentDetails &&
                  ` - ${selectedParentDetails.parent.firstName} ${selectedParentDetails.parent.lastName}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedParentDetails ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>
                        <p>
                          {selectedParentDetails.parent.firstName}{" "}
                          {selectedParentDetails.parent.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p>{selectedParentDetails.parent.email}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p>{selectedParentDetails.parent.phone || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium">Relation:</span>
                        <p>{selectedParentDetails.parent.relation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span>
                        <p>{selectedParentDetails.parent.gender || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date of Birth:</span>
                        <p>
                          {selectedParentDetails.parent.dateOfBirth
                            ? new Date(
                                selectedParentDetails.parent.dateOfBirth,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Address:</span>
                        <p>{selectedParentDetails.parent.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Students Information */}
                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center">
                      <Users2 className="h-5 w-5 mr-2" />
                      Children ({selectedParentDetails.totalStudents})
                    </h4>
                    {selectedParentDetails.students.length > 0 ? (
                      <div className="space-y-3">
                        {selectedParentDetails.students.map((student, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Roll No: {student?.rollNumber} | Class:{" "}
                                  {student?.class?.displayName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Branch: {student?.class?.branch}
                                </p>
                                {student?.class?.teacher && (
                                  <p className="text-sm text-muted-foreground">
                                    Class Teacher: {student?.class?.teacher?.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No children registered
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Failed to load parent details
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Parent
                {selectedParent && ` - ${selectedParent.name}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedParent ? (
                <form action={handleUpdateParent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        name="firstName"
                        defaultValue={selectedParent.firstName}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        name="lastName"
                        defaultValue={selectedParent.lastName}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        name="email"
                        type="email"
                        defaultValue={selectedParent.email}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input name="phone" defaultValue={selectedParent.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label>Relation *</Label>
                      <Select
                        name="relation"
                        defaultValue={selectedParent.relation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select name="gender">
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Address</Label>
                      <Textarea name="address" rows={3} />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Update Parent
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Failed to load parent data
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Parent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this parent? This action cannot be
                undone.
              </p>

              {selectedParent && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Deleting: {selectedParent.name}
                      </p>
                      <p className="text-sm text-yellow-700">
                        Email: {selectedParent.email}
                      </p>
                      {selectedParent.totalStudents > 0 && (
                        <p className="text-sm text-red-600 font-medium">
                          Warning: This parent has {selectedParent.totalStudents}{" "}
                          associated student(s).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteParent}
                  disabled={actionLoading}
                >
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Delete Parent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Parent Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a new parent profile and link to students
              </p>

              <form action={handleCreateParent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input name="lastName" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Relation *</Label>
                    <Select name="relation" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select name="gender">
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input name="dateOfBirth" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input name="nationality" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Textarea name="address" rows={3} />
                  </div>
                  <input
                    type="hidden"
                    name="schoolId"
                    value="clz123456schoolid"
                  />
                  <input
                    type="hidden"
                    name="branchId"
                    value="clz123456branchid"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Parent
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to {selectedParent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Enter message subject"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setMessageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={actionLoading}>
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Phone Dialog */}
        <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact {selectedParent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Call</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedParent?.phone || "No phone number"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCallParent(selectedParent?.phone || "")}
                  disabled={
                    !selectedParent?.phone || selectedParent.phone === "N/A"
                  }
                >
                  Call
                </Button>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedParent?.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleEmailParent(selectedParent?.email || "")}
                >
                  Email
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPhoneDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calendar Dialog */}
        <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Schedule Appointment with {selectedParent?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  rows={3}
                  value={appointmentPurpose}
                  onChange={(e) => setAppointmentPurpose(e.target.value)}
                  placeholder="Reason for appointment (e.g., Parent-teacher meeting, discuss grades, etc.)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCalendarDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleAppointment}
                  disabled={actionLoading}
                >
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Send Announcement</h3>
                  <p className="text-sm text-muted-foreground">
                    Broadcast message to all parents
                  </p>
                </div>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Schedule Meeting</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan parent-teacher conferences
                  </p>
                </div>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generate Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Parent engagement analytics
                  </p>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
