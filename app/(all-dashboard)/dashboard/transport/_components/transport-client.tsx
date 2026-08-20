'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  SearchIcon,
  BusIcon,
  UsersIcon,
  RouteIcon,
  TrashIcon,
  MoreVerticalIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserIcon,
} from 'lucide-react';
import {
  addVehicle,
  addRoute,
  deleteRoute,
  assignStudentToRoute,
  unassignStudentFromRoute,
} from '@/app/actions/transport';
import { useToast } from '@/components/ui/use-toast';

interface RouteItem {
  id: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  studentsAssigned: number;
  totalStops: number;
  startTime: string;
  endTime: string;
  status: string;
  distance: string;
}

interface StudentTransportItem {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  routeName: string;
  routeId: string;
  stopName: string;
  pickupTime: string;
  dropTime: string;
  feeStatus: string;
  parentContact: string;
  photo: string;
}

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experience: string;
  assignedRoute: string;
  busNumber: string;
  status: string;
}

interface VehicleItem {
  id: string;
  number: string;
  type: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  driverExperience: string;
  status: string;
}

interface StudentItem {
  id: string;
  name: string;
  className: string;
  rollNumber: string;
}

interface TransportClientProps {
  initialData: {
    routes: RouteItem[];
    studentTransport: StudentTransportItem[];
    drivers: DriverItem[];
    vehicles: VehicleItem[];
    allStudents: StudentItem[];
  };
}

export function TransportClient({ initialData }: TransportClientProps) {
  const [routes, setRoutes] = useState<RouteItem[]>(initialData.routes);
  const [studentTransport, setStudentTransport] = useState<StudentTransportItem[]>(initialData.studentTransport);
  const [drivers, setDrivers] = useState<DriverItem[]>(initialData.drivers);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(initialData.vehicles);
  const [allStudents] = useState<StudentItem[]>(initialData.allStudents);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('routes');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Dialog visibility states
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Add Route form states
  const [routeName, setRouteName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [distance, setDistance] = useState('20 km');
  const [startTime, setStartTime] = useState('07:00 AM');
  const [endTime, setEndTime] = useState('08:30 AM');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Add Vehicle/Driver form states
  const [busNumber, setBusNumber] = useState('');
  const [busType, setBusType] = useState('Bus');
  const [capacity, setCapacity] = useState('40');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverExperience, setDriverExperience] = useState('3 years');

  // Assign Student form states
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignRouteId, setAssignRouteId] = useState('');
  const [stopName, setStopName] = useState('');
  const [feeStatus, setFeeStatus] = useState('Paid');

  // Calculate statistics dynamically
  const activeBusesCount = vehicles.filter((v) => v.status === 'Active').length;
  const totalStudentsCount = studentTransport.length;
  const totalDriversCount = drivers.length;

  const stats = [
    { title: 'Total Routes', value: routes.length.toString(), icon: RouteIcon, color: 'blue' },
    { title: 'Active Vehicles', value: activeBusesCount.toString(), icon: BusIcon, color: 'green' },
    { title: 'Assigned Students', value: totalStudentsCount.toString(), icon: UsersIcon, color: 'purple' },
    { title: 'Total Drivers', value: totalDriversCount.toString(), icon: UserIcon, color: 'orange' },
  ];

  // Filtering lists
  const filteredRoutes = routes.filter((r) =>
    r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudentTransport = studentTransport.filter((s) =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.routeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'Maintenance':
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
    }
  };

  // Action: Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busNumber.trim() || !capacity) {
      toast({
        title: 'Error',
        description: 'Vehicle number and capacity are required.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await addVehicle({
        number: busNumber,
        type: busType,
        capacity: parseInt(capacity),
        driverName,
        driverPhone,
        driverLicense,
        driverExperience,
      });

      if (res.success && res.data) {
        toast({
          title: 'Success',
          description: `Vehicle "${busNumber}" added successfully.`,
        });

        // Add to local state
        setVehicles((prev) => [
          ...prev,
          {
            id: res.data.id,
            number: res.data.number,
            type: res.data.type,
            capacity: res.data.capacity,
            driverName: res.data.driverName || '',
            driverPhone: res.data.driverPhone || '',
            driverLicense: res.data.driverLicense || '',
            driverExperience: res.data.driverExperience || '',
            status: res.data.status,
          },
        ]);

        if (driverName) {
          setDrivers((prev) => [
            ...prev,
            {
              id: res.data.id,
              name: driverName,
              phone: driverPhone,
              licenseNumber: driverLicense,
              experience: driverExperience,
              assignedRoute: 'Unassigned',
              busNumber: busNumber,
              status: 'Active',
            },
          ]);
        }

        // Reset inputs
        setBusNumber('');
        setDriverName('');
        setDriverPhone('');
        setDriverLicense('');
        setShowVehicleDialog(false);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to add vehicle.',
          variant: 'destructive',
        });
      }
    });
  };

  // Action: Add Route
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !startPoint.trim() || !endPoint.trim() || !selectedVehicleId) {
      toast({
        title: 'Error',
        description: 'Route name, endpoints, and vehicle are required.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await addRoute({
        name: routeName,
        startPoint,
        endPoint,
        distance,
        startTime,
        endTime,
        vehicleId: selectedVehicleId,
      });

      if (res.success && res.data) {
        const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
        toast({
          title: 'Success',
          description: `Route "${routeName}" created successfully.`,
        });

        setRoutes((prev) => [
          ...prev,
          {
            id: res.data.id,
            routeName: res.data.name,
            busNumber: vehicle?.number || 'N/A',
            driverName: vehicle?.driverName || 'No Driver',
            driverPhone: vehicle?.driverPhone || 'N/A',
            capacity: vehicle?.capacity || 40,
            studentsAssigned: 0,
            totalStops: 5,
            startTime: res.data.startTime || startTime,
            endTime: res.data.endTime || endTime,
            status: res.data.status,
            distance: res.data.distance || distance,
          },
        ]);

        // Update driver's assigned route local state
        if (vehicle?.driverName) {
          setDrivers((prev) =>
            prev.map((d) => (d.busNumber === vehicle.number ? { ...d, assignedRoute: routeName } : d))
          );
        }

        // Reset
        setRouteName('');
        setStartPoint('');
        setEndPoint('');
        setShowRouteDialog(false);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to create route.',
          variant: 'destructive',
        });
      }
    });
  };

  // Action: Delete Route
  const handleDeleteRoute = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete route "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteRoute(id);
      if (res.success) {
        toast({
          title: 'Success',
          description: `Route "${name}" deleted.`,
        });
        setRoutes((prev) => prev.filter((r) => r.id !== id));
        // Remove route assignment from students locally
        setStudentTransport((prev) => prev.filter((s) => s.routeId !== id));
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to delete route.',
          variant: 'destructive',
        });
      }
    });
  };

  // Action: Assign Student
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudentId || !assignRouteId || !stopName.trim()) {
      toast({
        title: 'Error',
        description: 'Please select student, route, and enter stop name.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await assignStudentToRoute({
        studentId: assignStudentId,
        routeId: assignRouteId,
        stopName,
        transportFeeStatus: feeStatus,
      });

      if (res.success) {
        const student = allStudents.find((s) => s.id === assignStudentId);
        const route = routes.find((r) => r.id === assignRouteId);

        toast({
          title: 'Success',
          description: `Assigned ${student?.name} to ${route?.routeName}.`,
        });

        // Update local state: increment studentsAssigned count
        setRoutes((prev) =>
          prev.map((r) => (r.id === assignRouteId ? { ...r, studentsAssigned: r.studentsAssigned + 1 } : r))
        );

        // Fetch transport data or push student locally
        const newTransportItem: StudentTransportItem = {
          id: assignStudentId,
          studentName: student?.name || 'Student',
          studentId: student?.rollNumber || '',
          class: student?.className || '',
          routeName: route?.routeName || '',
          routeId: assignRouteId,
          stopName,
          pickupTime: route?.startTime || '07:00 AM',
          dropTime: route?.endTime || '02:30 PM',
          feeStatus: feeStatus,
          parentContact: 'N/A',
          photo: '',
        };

        setStudentTransport((prev) => [newTransportItem, ...prev]);
        setAssignStudentId('');
        setAssignRouteId('');
        setStopName('');
        setShowAssignDialog(false);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to assign student.',
          variant: 'destructive',
        });
      }
    });
  };

  // Action: Unassign Student
  const handleUnassignStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove transport service for ${studentName}?`)) return;

    startTransition(async () => {
      const res = await unassignStudentFromRoute(studentId);
      if (res.success) {
        const item = studentTransport.find((s) => s.id === studentId);
        toast({
          title: 'Success',
          description: `Removed transport service for ${studentName}.`,
        });

        if (item) {
          // Decrement studentsAssigned count locally
          setRoutes((prev) =>
            prev.map((r) => (r.id === item.routeId ? { ...r, studentsAssigned: Math.max(0, r.studentsAssigned - 1) } : r))
          );
        }

        setStudentTransport((prev) => prev.filter((s) => s.id !== studentId));
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to unassign student.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-[150px] p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-650 bg-clip-text text-transparent">
            Transport Management
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Manage school vehicles, routes, drivers, and student transportation.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={() => setShowRouteDialog(true)} className="gap-2 shadow-sm font-semibold">
            <PlusIcon className="h-4.5 w-4.5" />
            Add Route
          </Button>
          <Button onClick={() => setShowVehicleDialog(true)} variant="outline" className="gap-2 shadow-sm font-semibold">
            <BusIcon className="h-4.5 w-4.5 text-primary" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border border-slate-100 hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1.5">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100/60`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card className="shadow-sm border border-slate-100">
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder={
                selectedTab === 'routes'
                  ? "Search routes..."
                  : selectedTab === 'students'
                  ? "Search students transport details..."
                  : "Search driver lists..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="reports">Overview</TabsTrigger>
        </TabsList>

        {/* Tab 1: Routes List */}
        <TabsContent value="routes" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Vehicle & Driver</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                        🚍 No routes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoutes.map((route) => (
                      <TableRow key={route.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-bold text-slate-800">{route.routeName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-700">{route.busNumber}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{route.driverName}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 font-medium">{route.distance}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div>{route.startTime} - {route.endTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-bold text-slate-800">{route.studentsAssigned}</span>
                            <span className="text-muted-foreground"> / {route.capacity} seats</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(route.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-750"
                                onClick={() => handleDeleteRoute(route.id, route.routeName)}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Route
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Students */}
        <TabsContent value="students" className="space-y-4 pt-2">
          <div className="flex justify-end">
            <Button onClick={() => setShowAssignDialog(true)} className="gap-1.5 shadow-sm font-semibold">
              <UsersIcon className="h-4 w-4" />
              Assign Student to Route
            </Button>
          </div>
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assigned Route</TableHead>
                    <TableHead>Stop Name</TableHead>
                    <TableHead>Timings</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentTransport.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        🎒 No student transport mappings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudentTransport.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.photo} />
                              <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                                {item.studentName.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800">{item.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.class} • Roll: {item.studentId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{item.routeName}</TableCell>
                        <TableCell className="text-slate-650 text-sm font-medium">{item.stopName}</TableCell>
                        <TableCell className="text-slate-600 text-xs">
                          <div>Pick: {item.pickupTime}</div>
                          <div className="mt-0.5">Drop: {item.dropTime}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.feeStatus)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-650 focus:text-red-750"
                                onClick={() => handleUnassignStudent(item.id, item.studentName)}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Unassign Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Drivers */}
        <TabsContent value="drivers" className="space-y-4 pt-2">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        👤 No drivers registered in school vehicles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-800">{driver.name}</TableCell>
                        <TableCell className="text-sm text-slate-700">{driver.phone || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-slate-600 font-medium">{driver.licenseNumber || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{driver.experience || 'N/A'}</TableCell>
                        <TableCell className="text-sm font-semibold text-slate-800">{driver.busNumber}</TableCell>
                        <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Overview Reports */}
        <TabsContent value="reports" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow border border-slate-100">
              <CardHeader>
                <CardTitle className="text-base font-bold">Capacity Occupancy</CardTitle>
                <CardDescription>Visual stats of seat utilization.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.slice(0, 3).map((r) => {
                    const usagePercent = Math.min(100, Math.round((r.studentsAssigned / r.capacity) * 100) || 0);
                    return (
                      <div key={r.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{r.routeName}</span>
                          <span>{usagePercent}% ({r.studentsAssigned}/{r.capacity})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow border border-slate-100">
              <CardHeader>
                <CardTitle className="text-base font-bold">Maintenance & Fleet</CardTitle>
                <CardDescription>Overview of bus fleets status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2.5">
                    <CheckCircleIcon className="h-4.5 w-4.5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-green-800">Buses Operational</p>
                      <p className="text-[11px] text-green-750 mt-0.5">
                        All {activeBusesCount} registered vehicles are in active service state.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2.5">
                    <AlertCircleIcon className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-indigo-850">Service Coverage</p>
                      <p className="text-[11px] text-indigo-700/80 mt-0.5">
                        Transport network maps {routes.length} main geographical corridors in the city.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog 1: Add Route */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Bus Route</DialogTitle>
            <DialogDescription>Create a new transport route corridor and associate a vehicle.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRoute} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="route-name">Route Corridor Name</Label>
              <Input
                id="route-name"
                placeholder="e.g. Route D - Banani Express"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-point">Start Point</Label>
                <Input
                  id="start-point"
                  placeholder="e.g. Mirpur 10"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-point">End Point</Label>
                <Input
                  id="end-point"
                  placeholder="e.g. School Campus"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="distance">Distance</Label>
                <Input
                  id="distance"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start-time">Departure</Label>
                <Input
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time">Arrival</Label>
                <Input
                  id="end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="route-vehicle">Assign Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="route-vehicle">
                  <SelectValue placeholder="Choose vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.number} ({v.type} - Capacity: {v.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowRouteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Route'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Add Vehicle & Driver */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Fleet Vehicle & Driver</DialogTitle>
            <DialogDescription>Input vehicle number plate, category, and register the assigned driver.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddVehicle} className="space-y-4 pt-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="bus-number">Number Plate / ID</Label>
                <Input
                  id="bus-number"
                  placeholder="e.g. DHAKA-METRO-KA-1122"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Seats Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bus-type">Vehicle Type</Label>
              <Select value={busType} onValueChange={setBusType}>
                <SelectTrigger id="bus-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bus">Large School Bus</SelectItem>
                  <SelectItem value="Minibus">Coaster / Minibus</SelectItem>
                  <SelectItem value="Microbus">HiAce / Microbus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-3 mt-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Driver Credentials (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="driver-name">Driver Name</Label>
                  <Input
                    id="driver-name"
                    placeholder="e.g. Abdul Majid"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-phone">Driver Phone</Label>
                  <Input
                    id="driver-phone"
                    placeholder="e.g. +8801700000000"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="driver-license">License Number</Label>
                  <Input
                    id="driver-license"
                    placeholder="e.g. BRTA-8829"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driver-experience">Experience</Label>
                  <Input
                    id="driver-experience"
                    placeholder="e.g. 5 years"
                    value={driverExperience}
                    onChange={(e) => setDriverExperience(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowVehicleDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Assign Student */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Assign Student to Transport</DialogTitle>
            <DialogDescription>Add transport route service configuration to a student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignStudent} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="assign-student">Select Student</Label>
              <Select value={assignStudentId} onValueChange={setAssignStudentId}>
                <SelectTrigger id="assign-student">
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.className} • Roll: {s.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assign-route">Select Route Corridor</Label>
              <Select value={assignRouteId} onValueChange={setAssignRouteId}>
                <SelectTrigger id="assign-route">
                  <SelectValue placeholder="Choose route corridor" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.routeName} ({r.busNumber} • Available: {r.capacity - r.studentsAssigned} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stop-name">Stop/Pickup Point Name</Label>
              <Input
                id="stop-name"
                placeholder="e.g. Dhanmondi Lake stop"
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fee-status">Transport Fee Status</Label>
              <Select value={feeStatus} onValueChange={setFeeStatus}>
                <SelectTrigger id="fee-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowAssignDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Assigning...' : 'Assign Student'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
