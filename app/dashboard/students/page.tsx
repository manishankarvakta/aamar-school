"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  GraduationCap,
  X,
  Loader2,
} from "lucide-react";
import {
  getStudents,
  getStudentStats,
  updateStudent,
} from "@/app/actions/students";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [paginatedStudents, setPaginatedStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("paginatedStudents", paginatedStudents);
  console.log("All student's details:", filteredStudents);
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination states (like parents page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Edit form states
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    rollNumber: "",
    isActive: true,
    admissionDate: "",
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    relation: "",
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [studentsResult, statsResult] = await Promise.all([
          getStudents(),
          getStudentStats(),
        ]);

        if (!studentsResult.success) {
          throw new Error(studentsResult.error || "Failed to load students");
        }

        if (!statsResult.success) {
          throw new Error(statsResult.error || "Failed to load stats");
        }

        const studentsData = studentsResult.data || [];
        const statsData = statsResult.data || {};
        // console.log("studentsData", studentsData);
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setStats(statsData);
      } catch (err) {
        console.error("Load data error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        // Set empty arrays to prevent map errors
        setStudents([]);
        setFilteredStudents([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter students based on search and filters
  useEffect(() => {
    // Ensure students is an array before filtering
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }

    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((student: any) => {
        if (!student?.user) return false;

        const firstName = student.user.firstName || "";
        const lastName = student.user.lastName || "";
        const email = student.user.email || "";
        const rollNumber = student.rollNumber || "";

        return (
          firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Class filter
    if (selectedClass !== "all") {
      filtered = filtered.filter((student: any) => {
        if (!student?.section?.class) return false;
        return (
          `${student.section.class.name || ""} - ${student.section.name || ""}`.trim() ===
          selectedClass
        );
      });
    }

    // Branch filter
    if (selectedBranch !== "all") {
      filtered = filtered.filter((student: any) => {
        if (!student?.user?.branch) return false;
        return student.user.branch.name === selectedBranch;
      });
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter(
          (student: any) => student?.user?.isActive === true,
        );
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter(
          (student: any) => student?.user?.isActive === false,
        );
      }
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, searchTerm, selectedClass, selectedBranch, selectedStatus]);

  // Pagination effect - calculate paginated results (like parents page)
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredStudents.slice(startIndex, endIndex);
    setPaginatedStudents(paginated);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Calculate pagination info (like parents page)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredStudents.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Get unique values for filters - with safety checks
  const uniqueClasses = Array.from(
    new Set(
      (students || [])
        .filter((s: any) => s?.section?.class?.name && s?.section?.name)
        .map((s: any) => `${s.section.class.name} - ${s.section.name}`),
    ),
  );

  const uniqueBranches = Array.from(
    new Set(
      (students || [])
        .filter((s: any) => s?.user?.branch?.name)
        .map((s: any) => s.user.branch.name),
    ),
  );

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);

    // Populate form with current student data
    setEditForm({
      firstName: student.user.firstName || "",
      lastName: student.user.lastName || "",
      email: student.user.email || "",
      phone: student.user.profile?.phone || "",
      address: student.user.profile?.address || "",
      dateOfBirth: student.user.profile?.dateOfBirth
        ? new Date(student.user.profile.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: student.user.profile?.gender || "",
      bloodGroup: student.user.profile?.bloodGroup || "",
      rollNumber: student.rollNumber || "",
      isActive: student.user.isActive,
      admissionDate: new Date(student.admissionDate)
        .toISOString()
        .split("T")[0],
      parentFirstName: student.parent?.user.firstName || "",
      parentLastName: student.parent?.user.lastName || "",
      parentEmail: student.parent?.user.email || "",
      parentPhone: student.parent?.user.profile?.phone || "",
      relation: student.parent?.relation || "",
    });

    setEditDialogOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStudent = async () => {
    if (!selectedStudent) return;

    try {
      setEditLoading(true);

      const result = await updateStudent(selectedStudent.id, editForm);

      if (result.success) {
        toast({
          title: "Success",
          description: "Student updated successfully",
        });

        // Refresh the data
        const studentsResult = await getStudents();
        if (studentsResult.success) {
          setStudents(studentsResult.data || []);
          setFilteredStudents(studentsResult.data || []);
        }

        setEditDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update student",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Error loading data
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  console.log("filteredStudents", filteredStudents);

  return (
    <div className="space-y-6 p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student records, profiles, and academic information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/admissions">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All enrolled students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Male</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.maleStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">Male students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Female</CardTitle>
              <User className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {stats?.femaleStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">Female students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fees
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.studentsWithFees || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Students with dues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Admissions
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.recentAdmissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((className: string) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {uniqueBranches.map((branch: string) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents?.length || 0} of {students?.length || 0}{" "}
              students
            </p>
            {(searchTerm ||
              selectedClass !== "all" ||
              selectedBranch !== "all" ||
              selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClass("all");
                  setSelectedBranch("all");
                  setSelectedStatus("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                A comprehensive list of all enrolled students with their details
              </CardDescription>
            </div>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents && paginatedStudents?.length > 0 ? (
                  paginatedStudents?.map((student: any, index) => {
                    const user = student?.user;
                    const profile = user?.profile;
                    const parent = student?.parent;
                    const section = student?.section;
                    const className = section?.class;

                    if (!user || !className) {
                      return null; // Skip invalid records
                    }

                    return (
                      <TableRow key={student?.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile?.avatar || undefined} />
                              <AvatarFallback>
                                {user?.firstName?.[0] || "S"}
                                {user?.lastName?.[0] || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user?.firstName || ""} {user?.lastName || ""}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student?.rollNumber || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {className?.name || ""} - {section?.name || ""}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {className?.academicYear || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {user.branch?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {parent ? (
                            <div>
                              <div className="font-medium">
                                {parent.user?.firstName || ""}{" "}
                                {parent.user?.lastName || ""}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {parent.relation || ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              No parent
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{profile?.phone || "N/A"}</div>
                            <div className="text-muted-foreground">
                              {profile?.address || "No address"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={
                              user.isActive ? "bg-green-100 text-green-800" : ""
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {loading ? "Loading students..." : "No students found"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {filteredStudents.length}{" "}
              results
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
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

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedStudent.user.profile?.avatar || undefined}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedStudent.user.firstName[0]}
                      {selectedStudent.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xl font-semibold">
                      {selectedStudent.user.firstName}{" "}
                      {selectedStudent.user.lastName}
                    </h4>
                    <p className="text-muted-foreground">
                      {selectedStudent.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.user.profile?.dateOfBirth
                        ? new Date(
                            selectedStudent.user.profile.dateOfBirth,
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.user.profile?.gender || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Blood Group</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.user.profile?.bloodGroup ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.user.profile?.address || "Not specified"}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedStudent.user.profile?.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedStudent.user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Roll Number</Label>
                    <p className="text-sm font-mono">
                      {selectedStudent.rollNumber}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Class</Label>
                    <p className="text-sm">
                      {selectedStudent.section.class.name}{" "}
                      {selectedStudent.section.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Academic Year</Label>
                    <p className="text-sm">
                      {selectedStudent.section.class.academicYear}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Branch</Label>
                    <p className="text-sm">
                      {selectedStudent.user.branch?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Admission Date
                    </Label>
                    <p className="text-sm">
                      {new Date(
                        selectedStudent.admissionDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      variant={
                        selectedStudent.user.isActive ? "default" : "secondary"
                      }
                      className={
                        selectedStudent.user.isActive
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {selectedStudent.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Parent Information */}
                {selectedStudent?.parent && (
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold">Parent/Guardian</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">
                          {selectedStudent?.parent?.user?.firstName}{" "}
                          {selectedStudent?.parent?.user?.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Relation</Label>
                        <p className="text-sm">
                          {selectedStudent?.parent?.relation}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">
                          {selectedStudent.parent.user.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">
                          {selectedStudent.parent.user.profile?.phone ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStudent.attendance.length > 0
                        ? Math.round(
                            (selectedStudent.attendance.filter(
                              (a: any) => a.status === "PRESENT",
                            ).length /
                              selectedStudent.attendance.length) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedStudent.examResults.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Exams</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        selectedStudent.fees.filter(
                          (f: any) => f.status === "PENDING",
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pending Fees
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) =>
                      handleFormChange("firstName", e.target.value)
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) =>
                      handleFormChange("lastName", e.target.value)
                    }
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="Email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      handleFormChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) => handleFormChange("gender", value)}
                  >
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
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={editForm.bloodGroup}
                    onValueChange={(value) =>
                      handleFormChange("bloodGroup", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editForm.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  placeholder="Complete address"
                  rows={3}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={editForm.rollNumber}
                    onChange={(e) =>
                      handleFormChange("rollNumber", e.target.value)
                    }
                    placeholder="Roll number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      handleFormChange("isActive", value === "active")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionDate">Admission Date</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={editForm.admissionDate}
                  onChange={(e) =>
                    handleFormChange("admissionDate", e.target.value)
                  }
                />
              </div>

              {/* Parent Information */}
              {selectedStudent?.parent && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-base font-semibold">
                    Parent/Guardian Information
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentFirstName">Parent First Name</Label>
                      <Input
                        id="parentFirstName"
                        value={editForm.parentFirstName}
                        onChange={(e) =>
                          handleFormChange("parentFirstName", e.target.value)
                        }
                        placeholder="Parent first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentLastName">Parent Last Name</Label>
                      <Input
                        id="parentLastName"
                        value={editForm.parentLastName}
                        onChange={(e) =>
                          handleFormChange("parentLastName", e.target.value)
                        }
                        placeholder="Parent last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={editForm.parentEmail}
                        onChange={(e) =>
                          handleFormChange("parentEmail", e.target.value)
                        }
                        placeholder="Parent email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone">Parent Phone</Label>
                      <Input
                        id="parentPhone"
                        value={editForm.parentPhone}
                        onChange={(e) =>
                          handleFormChange("parentPhone", e.target.value)
                        }
                        placeholder="Parent phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relation">Relation</Label>
                    <Select
                      value={editForm.relation}
                      onValueChange={(value) =>
                        handleFormChange("relation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Uncle">Uncle</SelectItem>
                        <SelectItem value="Aunt">Aunt</SelectItem>
                        <SelectItem value="Grandfather">Grandfather</SelectItem>
                        <SelectItem value="Grandmother">Grandmother</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStudent} disabled={editLoading}>
              {editLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents.slice(0, 3).map((student: any) => (
                <div key={student.id} className="flex items-center space-x-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {student.user.firstName[0]}
                      {student.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {student.user.firstName} {student.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student?.section?.class?.name} {student?.section?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents
                .filter((s: any) =>
                  s.fees.some((f: any) => f.status === "PENDING"),
                )
                .slice(0, 3)
                .map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {student.user.firstName[0]}
                          {student.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {student.user.firstName} {student.user.lastName}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      Due
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents
              .slice(0, 5)
              .map((student: any) => {
                const totalAttendance = student.attendance.length;
                const presentCount = student.attendance.filter(
                  (a: any) => a.status === "PRESENT",
                ).length;
                const attendancePercentage =
                  totalAttendance > 0
                    ? (presentCount / totalAttendance) * 100
                    : 0;

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {student.user.firstName[0]}
                          {student.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {student.user.firstName} {student.user.lastName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        attendancePercentage < 80
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {/* {attendancePercentage.toFixed(0)}% */}
                      {attendancePercentage}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
