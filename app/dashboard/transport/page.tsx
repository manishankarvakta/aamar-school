'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  BusIcon,
  MapPinIcon,
  UsersIcon,
  RouteIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  EyeIcon,
  DownloadIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserIcon,
  CarIcon,
} from 'lucide-react';

// Sample data
const routeData = [
  {
    id: 1,
    routeName: 'Route A - City Center',
    busNumber: 'SCH-001',
    driverName: 'John Driver',
    driverPhone: '+1234567890',
    capacity: 45,
    studentsAssigned: 38,
    totalStops: 12,
    startTime: '07:00 AM',
    endTime: '08:30 AM',
    status: 'Active',
    distance: '25 km'
  },
  {
    id: 2,
    routeName: 'Route B - Suburban',
    busNumber: 'SCH-002',
    driverName: 'Mike Wilson',
    driverPhone: '+1234567891',
    capacity: 50,
    studentsAssigned: 42,
    totalStops: 15,
    startTime: '06:45 AM',
    endTime: '08:15 AM',
    status: 'Active',
    distance: '30 km'
  },
  {
    id: 3,
    routeName: 'Route C - Industrial Area',
    busNumber: 'SCH-003',
    driverName: 'Sarah Brown',
    driverPhone: '+1234567892',
    capacity: 40,
    studentsAssigned: 35,
    totalStops: 10,
    startTime: '07:15 AM',
    endTime: '08:45 AM',
    status: 'Maintenance',
    distance: '20 km'
  }
];

const studentTransport = [
  {
    id: 1,
    studentName: 'Alice Johnson',
    studentId: 'STD2024001',
    class: 'Grade 10',
    routeName: 'Route A - City Center',
    stopName: 'Central Mall',
    pickupTime: '07:30 AM',
    dropTime: '02:45 PM',
    feeStatus: 'Paid',
    parentContact: '+1234567890',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    studentName: 'Michael Chen',
    studentId: 'STD2024002',
    class: 'Grade 10',
    routeName: 'Route B - Suburban',
    stopName: 'Green Park',
    pickupTime: '07:15 AM',
    dropTime: '02:30 PM',
    feeStatus: 'Pending',
    parentContact: '+1234567891',
    photo: '/api/placeholder/40/40'
  }
];

const driverData = [
  {
    id: 1,
    name: 'John Driver',
    phone: '+1234567890',
    licenseNumber: 'DL123456789',
    experience: '8 years',
    assignedRoute: 'Route A - City Center',
    busNumber: 'SCH-001',
    status: 'Active',
    rating: 4.8,
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    name: 'Mike Wilson',
    phone: '+1234567891',
    licenseNumber: 'DL987654321',
    experience: '5 years',
    assignedRoute: 'Route B - Suburban',
    busNumber: 'SCH-002',
    status: 'Active',
    rating: 4.6,
    photo: '/api/placeholder/40/40'
  }
];

export default function TransportPage() {
  const [selectedTab, setSelectedTab] = useState('routes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const stats = [
    { title: 'Total Routes', value: '12', icon: RouteIcon, color: 'blue' },
    { title: 'Active Buses', value: '10', icon: BusIcon, color: 'green' },
    { title: 'Students Using Transport', value: '385', icon: UsersIcon, color: 'purple' },
    { title: 'Total Drivers', value: '15', icon: UserIcon, color: 'orange' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transport Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage bus routes, drivers, and student transportation
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRouteDialog(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Route
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Routes
          </Button>
        </div>
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes, drivers, or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Details</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeData.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{route.routeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Bus: {route.busNumber} • {route.totalStops} stops • {route.distance}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{route.driverName}</p>
                          <p className="text-sm text-muted-foreground">{route.driverPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Students</span>
                            <span>{route.studentsAssigned}/{route.capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(route.studentsAssigned / route.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Start: {route.startTime}</p>
                          <p className="text-muted-foreground">End: {route.endTime}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(route.status)}>
                          {route.status}
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
                              View Route Map
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Route
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                              <UsersIcon className="h-4 w-4 mr-2" />
                              Assign Students
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Route
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

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentTransport.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.photo} />
                            <AvatarFallback>{student.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                            <p className="text-sm text-muted-foreground">{student.class} • {student.studentId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.routeName}</TableCell>
                      <TableCell>{student.stopName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Pickup: {student.pickupTime}</p>
                          <p className="text-muted-foreground">Drop: {student.dropTime}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.feeStatus)}>
                          {student.feeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.parentContact}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Change Route
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              Contact Parent
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
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

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Assigned Route</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverData.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={driver.photo} />
                            <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">{driver.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{driver.experience}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver.assignedRoute}</p>
                          <p className="text-sm text-muted-foreground">Bus: {driver.busNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{driver.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status}
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RouteIcon className="h-4 w-4 mr-2" />
                              Change Route
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

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routeData.map((route) => (
                    <div key={route.id} className="flex justify-between items-center">
                      <span className="text-sm">{route.routeName}</span>
                      <span className="font-semibold">
                        {Math.round((route.studentsAssigned / route.capacity) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transport Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Students</span>
                    <span className="font-semibold">385</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fees Collected</span>
                    <span className="font-semibold text-green-600">৳3,85,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Fees</span>
                    <span className="font-semibold text-yellow-600">৳25,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Route List
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    View Route Map
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    Send Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Route Name</Label>
                <Input placeholder="Enter route name" />
              </div>
              <div className="space-y-2">
                <Label>Bus Number</Label>
                <Input placeholder="Enter bus number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRouteDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowRouteDialog(false)}>Add Route</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std1">Alice Johnson - Grade 10</SelectItem>
                  <SelectItem value="std2">Michael Chen - Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Route</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose route" />
                </SelectTrigger>
                <SelectContent>
                  {routeData.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAssignDialog(false)}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
