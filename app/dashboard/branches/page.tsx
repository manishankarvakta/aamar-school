'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  BuildingIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  BarChartIcon,
  EyeIcon,
  SettingsIcon,
} from 'lucide-react';

// Sample data for branches
const branches = [
  {
    id: 1,
    branchId: 'BRN001',
    name: 'Main Campus',
    code: 'MAIN',
    address: '123 Education Street, Dhaka, Bangladesh',
    phone: '+880-1234-567890',
    email: 'main@aamarschool.edu.bd',
    principal: 'Dr. Sarah Ahmed',
    totalStudents: 1245,
    totalTeachers: 78,
    totalClasses: 45,
    establishedDate: '2010-01-15',
    status: 'Active',
    facilities: ['Library', 'Laboratory', 'Playground', 'Computer Lab', 'Auditorium'],
    academicYear: '2024-2025',
  },
  {
    id: 2,
    branchId: 'BRN002',
    name: 'North Campus',
    code: 'NORTH',
    address: '456 Academic Avenue, Uttara, Dhaka',
    phone: '+880-1234-567891',
    email: 'north@aamarschool.edu.bd',
    principal: 'Prof. Mohammad Rahman',
    totalStudents: 890,
    totalTeachers: 56,
    totalClasses: 32,
    establishedDate: '2015-03-20',
    status: 'Active',
    facilities: ['Library', 'Laboratory', 'Playground', 'Computer Lab'],
    academicYear: '2024-2025',
  },
  {
    id: 3,
    branchId: 'BRN003',
    name: 'South Campus',
    code: 'SOUTH',
    address: '789 Learning Lane, Dhanmondi, Dhaka',
    phone: '+880-1234-567892',
    email: 'south@aamarschool.edu.bd',
    principal: 'Ms. Fatima Khan',
    totalStudents: 654,
    totalTeachers: 42,
    totalClasses: 28,
    establishedDate: '2018-08-10',
    status: 'Active',
    facilities: ['Library', 'Laboratory', 'Computer Lab'],
    academicYear: '2024-2025',
  },
  {
    id: 4,
    branchId: 'BRN004',
    name: 'East Campus',
    code: 'EAST',
    address: '321 Knowledge Road, Bashundhara, Dhaka',
    phone: '+880-1234-567893',
    email: 'east@aamarschool.edu.bd',
    principal: 'Dr. Ahmed Hassan',
    totalStudents: 423,
    totalTeachers: 28,
    totalClasses: 18,
    establishedDate: '2020-06-01',
    status: 'Under Construction',
    facilities: ['Library', 'Computer Lab'],
    academicYear: '2024-2025',
  }
];

const statuses = ['All Status', 'Active', 'Under Construction', 'Inactive'];

export default function BranchesPage() {
  const [selectedTab, setSelectedTab] = useState('branches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const stats = [
    { title: 'Total Branches', value: '4', icon: BuildingIcon, color: 'blue' },
    { title: 'Active Branches', value: '3', icon: BuildingIcon, color: 'green' },
    { title: 'Total Students', value: '3,212', icon: UsersIcon, color: 'purple' },
    { title: 'Total Teachers', value: '204', icon: BookOpenIcon, color: 'orange' },
  ];

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.branchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Status' || branch.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Construction': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage school branches, facilities, and campus information
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Branch ID</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Teachers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BuildingIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-muted-foreground">{branch.code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{branch.branchId}</TableCell>
                      <TableCell>{branch.principal}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {branch.phone}
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <MailIcon className="h-3 w-3" />
                            {branch.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{branch.totalStudents}</TableCell>
                      <TableCell className="text-center font-semibold">{branch.totalTeachers}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(branch.status)}>
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Branch
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <SettingsIcon className="h-4 w-4 mr-2" />
                              Manage Facilities
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UsersIcon className="h-4 w-4 mr-2" />
                              View Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Deactivate Branch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <div className="grid gap-4">
            {filteredBranches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BuildingIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{branch.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {branch.address}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(branch.status)}>
                      {branch.status}
                    </Badge>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Available Facilities</h5>
                    <div className="flex flex-wrap gap-2">
                      {branch.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline">{facility}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBranches.map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BuildingIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    {branch.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Students</p>
                        <p className="text-lg font-bold text-blue-600">{branch.totalStudents}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Teachers</p>
                        <p className="text-lg font-bold text-green-600">{branch.totalTeachers}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Classes</p>
                        <p className="text-lg font-bold text-purple-600">{branch.totalClasses}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Facilities</p>
                        <p className="text-lg font-bold text-orange-600">{branch.facilities.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Branch Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Under Construction</span>
                    <span className="font-semibold text-yellow-600">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Main Campus</span>
                    <span className="font-semibold">{branches[0].totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>North Campus</span>
                    <span className="font-semibold">{branches[1].totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>South Campus</span>
                    <span className="font-semibold">{branches[2].totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>East Campus</span>
                    <span className="font-semibold">{branches[3].totalStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facilities Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Libraries</span>
                    <span className="font-semibold">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Laboratories</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Computer Labs</span>
                    <span className="font-semibold">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Playgrounds</span>
                    <span className="font-semibold">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Branch Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input id="branchName" placeholder="Enter branch name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input id="branchCode" placeholder="e.g., MAIN" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedDate">Established Date</Label>
                  <Input id="establishedDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter complete address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Branch email" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Administrative Information</h3>
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Name</Label>
                <Input id="principal" placeholder="Principal name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input id="academicYear" placeholder="e.g., 2024-2025" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Textarea id="facilities" placeholder="e.g., Library, Laboratory, Playground" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Add Branch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 