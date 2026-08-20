'use client';

import { useState, useEffect } from 'react';
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
import {
  getAccountsDashboardData,
  recordPayment,
  createExpense,
  createFeesForClass
} from '@/app/actions/accounts';
import { useBranch } from '@/contexts/branch-context';
import { useToast } from '@/components/ui/use-toast';
import { FeeType } from '@prisma/client';

export default function AccountsPage() {
  const { selectedBranchId } = useBranch();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const [selectedTab, setSelectedTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedType, setSelectedType] = useState('All Types');
  
  // Dialog visibility states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showFeeCategoryDialog, setShowFeeCategoryDialog] = useState(false);

  // Dynamic dashboard states
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Payment form states
  const [selectedFeeToPay, setSelectedFeeToPay] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Expense form states
  const [expenseCategory, setExpenseCategory] = useState('Utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('Cash');
  const [expenseAccountId, setExpenseAccountId] = useState('');
  const [expenseInvoiceNumber, setExpenseInvoiceNumber] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Fee category form states
  const [feeClassId, setFeeClassId] = useState('');
  const [feeType, setFeeType] = useState<FeeType>('TUITION');
  const [feeTitle, setFeeTitle] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [selectedBranchId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await getAccountsDashboardData(selectedBranchId);
      if (result.success && result.data) {
        setPaymentData(result.data.fees);
        setExpenseData(result.data.expenses);
        setAccounts(result.data.accounts);
        setStudents(result.data.students);
        setClassesList(result.data.classes);
        setDashboardStats(result.data.stats);

        if (result.data.accounts.length > 0) {
          setSelectedAccountId(result.data.accounts[0].id);
          setExpenseAccountId(result.data.accounts[0].id);
        }
        if (result.data.students.length > 0) {
          setSelectedStudentId(result.data.students[0].id);
        }
        if (result.data.classes.length > 0) {
          setFeeClassId(result.data.classes[0].id);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to load dashboard data"
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = (fee: any) => {
    setSelectedFeeToPay(fee);
    setPaymentAmount(fee.amount.toString());
    setSelectedStudentId(fee.studentId || '');
    if (accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
    setShowPaymentDialog(true);
  };

  const handleRecordPaymentSubmit = async () => {
    const targetFeeId = selectedFeeToPay?.id || unpaidFees[0]?.id;
    if (!targetFeeId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid fee to record payment"
      });
      return;
    }
    try {
      setLoading(true);
      const res = await recordPayment(targetFeeId, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId,
        paymentDate,
        accountId: selectedAccountId,
        notes: paymentNotes
      });
      if (res.success) {
        toast({
          title: "Success",
          description: res.message
        });
        setShowPaymentDialog(false);
        setSelectedFeeToPay(null);
        setPaymentAmount('');
        setTransactionId('');
        setPaymentNotes('');
        loadDashboardData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message
        });
      }
    } catch (error) {
      console.error("Payment submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordExpenseSubmit = async () => {
    if (!expenseAmount || !expenseDescription || !expenseVendor) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    try {
      setLoading(true);
      const res = await createExpense({
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        vendor: expenseVendor,
        date: expenseDate,
        paymentMethod: expensePaymentMethod,
        accountId: expenseAccountId,
        invoiceNumber: expenseInvoiceNumber,
        notes: expenseNotes
      });
      if (res.success) {
        toast({
          title: "Success",
          description: res.message
        });
        setShowExpenseDialog(false);
        setExpenseAmount('');
        setExpenseDescription('');
        setExpenseVendor('');
        setExpenseInvoiceNumber('');
        setExpenseNotes('');
        loadDashboardData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message
        });
      }
    } catch (error) {
      console.error("Expense submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeeCategorySubmit = async () => {
    if (!feeClassId || !feeTitle || !feeAmount || !feeDueDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    try {
      setLoading(true);
      const res = await createFeesForClass({
        classId: feeClassId,
        feeType: feeType,
        title: feeTitle,
        amount: parseFloat(feeAmount),
        dueDate: feeDueDate
      });
      if (res.success) {
        toast({
          title: "Success",
          description: res.message
        });
        setShowFeeCategoryDialog(false);
        setFeeTitle('');
        setFeeAmount('');
        setFeeDueDate('');
        loadDashboardData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message
        });
      }
    } catch (error) {
      console.error("Fee category creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const unpaidFees = paymentData.filter(p => p.status !== 'Paid' && p.studentId === selectedStudentId);

  // Group fees by class and title to represent fee structures dynamically
  const feeStructure = [];
  const seenStructures = new Set();
  
  for (const fee of paymentData) {
    const key = `${fee.class}-${fee.feeType}-${fee.amount}`;
    if (!seenStructures.has(key)) {
      seenStructures.add(key);
      feeStructure.push({
        id: fee.id,
        class: fee.class,
        category: fee.feeType,
        amount: fee.amount,
        frequency: fee.feeType === 'TUITION' ? 'Monthly' : 'One-time',
        dueDate: fee.dueDate,
        status: 'Active'
      });
    }
  }

  // Build filter lists dynamically
  const classes = ['All Classes', ...Array.from(new Set(paymentData.map(p => p.class)))];
  const feeTypes = ['All Types', ...Array.from(new Set(paymentData.map(p => p.feeType)))];
  const paymentStatuses = ['All Status', 'Paid', 'Pending', 'Overdue'];
  const expenseCategories = ['All Categories', 'Staff Salary', 'Utilities', 'Maintenance', 'Supplies', 'Equipment', 'Transport'];

  const stats = [
    { 
      title: 'Total Collection', 
      value: dashboardStats ? formatCurrency(dashboardStats.totalCollection) : '৳0.00', 
      icon: DollarSignIcon, 
      color: 'green', 
      change: '+12.5%' 
    },
    { 
      title: 'Pending Fees', 
      value: dashboardStats ? formatCurrency(dashboardStats.pendingFees) : '৳0.00', 
      icon: ClockIcon, 
      color: 'yellow', 
      change: '-5.2%' 
    },
    { 
      title: 'Overdue Amount', 
      value: dashboardStats ? formatCurrency(dashboardStats.overdueAmount) : '৳0.00', 
      icon: AlertCircleIcon, 
      color: 'red', 
      change: '+2.1%' 
    },
    { 
      title: 'Total Expenses', 
      value: dashboardStats ? formatCurrency(dashboardStats.totalExpenses) : '৳0.00', 
      icon: TrendingDownIcon, 
      color: 'blue', 
      change: '+8.3%' 
    },
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return CheckCircleIcon;
      case 'Pending': return ClockIcon;
      case 'Overdue': return AlertCircleIcon;
      default: return XCircleIcon;
    }
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
                              <AvatarFallback>{payment.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
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
                                 <DropdownMenuItem onClick={() => handleOpenPaymentDialog(payment)}>
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
            <Button onClick={() => setShowFeeCategoryDialog(true)} className="gap-2">
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
      <Dialog open={showPaymentDialog} onOpenChange={(open) => {
        setShowPaymentDialog(open);
        if (!open) setSelectedFeeToPay(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedFeeToPay 
                ? `Record Payment for ${selectedFeeToPay.studentName}`
                : "Record Payment"
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFeeToPay ? (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-semibold text-sm">Fee Item Details:</p>
                <p className="text-sm"><b>Student:</b> {selectedFeeToPay.studentName} ({selectedFeeToPay.class})</p>
                <p className="text-sm"><b>Fee Type:</b> {selectedFeeToPay.feeType}</p>
                <p className="text-sm"><b>Due Amount:</b> {formatCurrency(selectedFeeToPay.amount)}</p>
                <p className="text-sm"><b>Due Date:</b> {selectedFeeToPay.dueDate}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((std) => (
                        <SelectItem key={std.id} value={std.id}>
                          {std.name} ({std.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unpaid Fees</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={unpaidFees.length > 0 ? "Select fee to pay" : "No pending fees"} />
                    </SelectTrigger>
                    <SelectContent>
                      {unpaidFees.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.feeType} - {formatCurrency(fee.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Pay</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID / Reference</Label>
                <Input 
                  id="transactionId" 
                  placeholder="Enter transaction ID" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input 
                  id="paymentDate" 
                  type="date" 
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Deposit Account</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} (Balance: {formatCurrency(acc.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional notes" 
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowPaymentDialog(false);
              setSelectedFeeToPay(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleRecordPaymentSubmit} disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
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
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff Salary">Staff Salary</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseAmount">Amount</Label>
                <Input 
                  id="expenseAmount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDescription">Description</Label>
              <Input 
                id="expenseDescription" 
                placeholder="Enter expense description" 
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input 
                  id="vendor" 
                  placeholder="Enter vendor name" 
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input 
                  id="expenseDate" 
                  type="date" 
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expensePaymentMethod">Payment Method</Label>
                <Select value={expensePaymentMethod} onValueChange={setExpensePaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice/Bill Number</Label>
                <Input 
                  id="invoiceNumber" 
                  placeholder="Enter invoice number" 
                  value={expenseInvoiceNumber}
                  onChange={(e) => setExpenseInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source Account</Label>
              <Select value={expenseAccountId} onValueChange={setExpenseAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} (Balance: {formatCurrency(acc.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseNotes">Notes</Label>
              <Textarea 
                id="expenseNotes" 
                placeholder="Enter any additional notes" 
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordExpenseSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Fee Category Dialog */}
      <Dialog open={showFeeCategoryDialog} onOpenChange={setShowFeeCategoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Class Fee Category (Assign Fees)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={feeClassId} onValueChange={setFeeClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fee Type</Label>
                <Select value={feeType} onValueChange={(v) => setFeeType(v as FeeType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Fee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUITION">Tuition Fee</SelectItem>
                    <SelectItem value="EXAM">Exam Fee</SelectItem>
                    <SelectItem value="TRANSPORT">Transport Fee</SelectItem>
                    <SelectItem value="LIBRARY">Library Fee</SelectItem>
                    <SelectItem value="LABORATORY">Laboratory Fee</SelectItem>
                    <SelectItem value="SPORTS">Sports Fee</SelectItem>
                    <SelectItem value="ADMISSION">Admission Fee</SelectItem>
                    <SelectItem value="MISCELLANEOUS">Miscellaneous Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeTitle">Fee Title / Description</Label>
                <Input 
                  id="feeTitle" 
                  placeholder="e.g. Monthly Tuition Fee - March" 
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeAmount">Fee Amount (৳)</Label>
                <Input 
                  id="feeAmount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeDueDate">Due Date</Label>
              <Input 
                id="feeDueDate" 
                type="date" 
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowFeeCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFeeCategorySubmit} disabled={loading}>
              {loading ? "Assigning..." : "Assign Fees"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
