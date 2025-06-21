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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  EyeIcon,
  CreditCardIcon,
  BanknoteIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  SendIcon,
  WalletIcon,
  ReceiptIcon,
  FileTextIcon,
  PieChartIcon,
  BarChart3Icon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';

// Sample data
const feeStructure = [
  {
    id: 1,
    class: 'Grade 10',
    category: 'Tuition Fee',
    amount: 15000,
    frequency: 'Monthly',
    dueDate: '5th of every month',
    status: 'Active'
  },
  {
    id: 2,
    class: 'Grade 10',
    category: 'Exam Fee',
    amount: 2500,
    frequency: 'Quarterly',
    dueDate: 'End of Quarter',
    status: 'Active'
  },
  {
    id: 3,
    class: 'Grade 9',
    category: 'Tuition Fee',
    amount: 14000,
    frequency: 'Monthly',
    dueDate: '5th of every month',
    status: 'Active'
  },
  {
    id: 4,
    class: 'All Classes',
    category: 'Transport Fee',
    amount: 3000,
    frequency: 'Monthly',
    dueDate: '10th of every month',
    status: 'Active'
  }
];

const paymentData = [
  {
    id: 1,
    studentId: 'STD2024001',
    studentName: 'Alice Johnson',
    class: 'Grade 10',
    rollNo: 'A001',
    feeType: 'Tuition Fee',
    amount: 15000,
    dueDate: '2024-02-05',
    paidDate: '2024-02-03',
    status: 'Paid',
    paymentMethod: 'Online',
    transactionId: 'TXN123456789',
    parent: 'John Johnson',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 2,
    studentId: 'STD2024002',
    studentName: 'Michael Chen',
    class: 'Grade 10',
    rollNo: 'A002',
    feeType: 'Tuition Fee',
    amount: 15000,
    dueDate: '2024-02-05',
    paidDate: null,
    status: 'Pending',
    paymentMethod: null,
    transactionId: null,
    parent: 'David Chen',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 3,
    studentId: 'STD2024003',
    studentName: 'Emma Rodriguez',
    class: 'Grade 9',
    rollNo: 'B001',
    feeType: 'Tuition Fee',
    amount: 14000,
    dueDate: '2024-01-05',
    paidDate: null,
    status: 'Overdue',
    paymentMethod: null,
    transactionId: null,
    parent: 'Carlos Rodriguez',
    photo: '/api/placeholder/40/40'
  },
  {
    id: 4,
    studentId: 'STD2024001',
    studentName: 'Alice Johnson',
    class: 'Grade 10',
    rollNo: 'A001',
    feeType: 'Transport Fee',
    amount: 3000,
    dueDate: '2024-02-10',
    paidDate: '2024-02-08',
    status: 'Paid',
    paymentMethod: 'Cash',
    transactionId: 'CASH001',
    parent: 'John Johnson',
    photo: '/api/placeholder/40/40'
  }
];

const expenseData = [
  {
    id: 1,
    category: 'Staff Salary',
    description: 'Monthly salary payment',
    amount: 125000,
    date: '2024-02-01',
    status: 'Paid',
    vendor: 'Staff Members',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 2,
    category: 'Utilities',
    description: 'Electricity bill',
    amount: 8500,
    date: '2024-02-03',
    status: 'Paid',
    vendor: 'Power Company',
    paymentMethod: 'Online'
  },
  {
    id: 3,
    category: 'Maintenance',
    description: 'Building repairs',
    amount: 15000,
    date: '2024-02-05',
    status: 'Pending',
    vendor: 'ABC Contractors',
    paymentMethod: 'Cheque'
  },
  {
    id: 4,
    category: 'Supplies',
    description: 'Office stationery',
    amount: 2500,
    date: '2024-02-07',
    status: 'Paid',
    vendor: 'Office Mart',
    paymentMethod: 'Cash'
  }
];

const classes = ['All Classes', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const feeTypes = ['All Types', 'Tuition Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Lab Fee', 'Sports Fee'];
const paymentStatuses = ['All Status', 'Paid', 'Pending', 'Overdue', 'Partial'];
const expenseCategories = ['All Categories', 'Staff Salary', 'Utilities', 'Maintenance', 'Supplies', 'Equipment', 'Transport'];

export default function AccountsPage() {
  const [selectedTab, setSelectedTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const stats = [
    { title: 'Total Collection', value: '৳8,45,000', icon: DollarSignIcon, color: 'green', change: '+12.5%' },
    { title: 'Pending Fees', value: '৳1,25,000', icon: ClockIcon, color: 'yellow', change: '-5.2%' },
    { title: 'Overdue Amount', value: '৳45,000', icon: AlertCircleIcon, color: 'red', change: '+2.1%' },
    { title: 'Total Expenses', value: '৳3,85,000', icon: TrendingDownIcon, color: 'blue', change: '+8.3%' },
  ];

  const filteredPayments = paymentData.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || payment.class === selectedClass;
    const matchesStatus = selectedStatus === 'All Status' || payment.status === selectedStatus;
    const matchesType = selectedType === 'All Types' || payment.feeType === selectedType;
    return matchesSearch && matchesClass && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return CheckCircleIcon;
      case 'Pending': return ClockIcon;
      case 'Overdue': return AlertCircleIcon;
      case 'Partial': return CreditCardIcon;
      default: return XCircleIcon;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const calculateTotalCollection = () => {
    return paymentData
      .filter(payment => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const calculatePendingAmount = () => {
    return paymentData
      .filter(payment => payment.status === 'Pending' || payment.status === 'Overdue')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accounts & Fee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage school finances, fee collection, and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPaymentDialog(true)} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Record Payment
          </Button>
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Financial Report
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
                  <div className="flex items-center gap-1 mt-1">
                    {stat.change.startsWith('+') ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
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
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Fee Type" />
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
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
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="fees">Fee Structure</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={payment.photo} />
                              <AvatarFallback>{payment.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payment.studentName}</p>
                              <p className="text-sm text-muted-foreground">{payment.class} • {payment.rollNo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.feeType}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{payment.dueDate}</p>
                            {payment.paidDate && (
                              <p className="text-muted-foreground">Paid: {payment.paidDate}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethod || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.transactionId || (
                            <span className="text-muted-foreground">-</span>
                          )}
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
                              {payment.status !== 'Paid' && (
                                <DropdownMenuItem>
                                  <CreditCardIcon className="h-4 w-4 mr-2" />
                                  Record Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <ReceiptIcon className="h-4 w-4 mr-2" />
                                Generate Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <SendIcon className="h-4 w-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fee Structure</h3>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Fee Category
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.class}</TableCell>
                      <TableCell>{fee.category}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(fee.amount)}</span>
                      </TableCell>
                      <TableCell>{fee.frequency}</TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={fee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {fee.status}
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
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Fee
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Fee
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

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Management</h3>
            <Button onClick={() => setShowExpenseDialog(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseData.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600">{formatCurrency(expense.amount)}</span>
                      </TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
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
                              View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PrinterIcon className="h-4 w-4 mr-2" />
                              Print Voucher
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Expense
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
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Collected</span>
                    <span className="font-semibold text-green-600">{formatCurrency(calculateTotalCollection())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Amount</span>
                    <span className="font-semibold text-yellow-600">{formatCurrency(calculatePendingAmount())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Rate</span>
                    <span className="font-semibold">85.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['January', 'February', 'March'].map((month, index) => (
                    <div key={month} className="flex justify-between items-center">
                      <span>{month}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(Math.floor(Math.random() * 200000) + 500000)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentData.filter(p => p.status === 'Overdue').slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{payment.studentName}</p>
                        <p className="text-xs text-muted-foreground">{payment.feeType}</p>
                      </div>
                      <span className="text-red-600 font-semibold text-sm">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Overdue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.slice(1, 5).map((category) => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(Math.floor(Math.random() * 50000) + 10000)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${Math.floor(Math.random() * 40) + 30}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Online Payment</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash Payment</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bank Transfer</span>
                    <span className="font-semibold">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-2 rounded-full"></div>
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
                    <ReceiptIcon className="h-4 w-4" />
                    Generate Fee Receipts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <SendIcon className="h-4 w-4" />
                    Send Payment Reminders
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Financial Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentSelect">Student</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentData.map((payment) => (
                      <SelectItem key={payment.studentId} value={payment.studentId}>
                        {payment.studentName} - {payment.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeTypeSelect">Fee Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.slice(1).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input id="transactionId" placeholder="Enter transaction ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input id="paymentDate" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Enter any additional notes" />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPaymentDialog(false)}>
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseCategory">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseAmount">Amount</Label>
                <Input id="expenseAmount" type="number" placeholder="Enter amount" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDescription">Description</Label>
              <Input id="expenseDescription" placeholder="Enter expense description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input id="vendor" placeholder="Enter vendor name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input id="expenseDate" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expensePaymentMethod">Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice/Bill Number</Label>
                <Input id="invoiceNumber" placeholder="Enter invoice number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseNotes">Notes</Label>
              <Textarea id="expenseNotes" placeholder="Enter any additional notes" />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowExpenseDialog(false)}>
              Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
