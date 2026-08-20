'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, AlertTriangle, Users, Sparkles } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Fee {
  id: string;
  title: string;
  feeType: string;
  amount: number;
  lateFee: number;
  dueDate: Date;
  status: string;
}

interface ChildData {
  profile: {
    id: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    className: string;
    sectionName: string;
    gender?: string | null;
    bloodGroup: string;
    phone: string;
  };
  fees: Fee[];
  totalDue: number;
}

interface ParentFeesClientProps {
  data: {
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
    children: ChildData[];
  };
}

export function ParentFeesClient({ data }: ParentFeesClientProps) {
  const { parent, children } = data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedChildIndex = parseInt(searchParams.get('child') || '0', 10);
  const activeChild = children[selectedChildIndex] || children[0];

  const handleChildSelect = (val: string) => {
    router.push(`${pathname}?child=${val}`);
  };

  if (!activeChild) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">No Students Linked</h2>
        <p className="text-muted-foreground text-sm">
          There are currently no students associated with your parent account. Please contact the school administration.
        </p>
      </div>
    );
  }

  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 pb-20 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Billing & Invoices
          </span>
          <h1 className="text-2xl font-bold tracking-tight">School Fees & Dues</h1>
          <p className="text-indigo-200 text-sm max-w-md">
            Review academic fees, invoices, late charges, and billing statements.
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 ? (
          <div className="space-y-1.5 relative z-10 w-full md:w-60 bg-white/10 p-3 rounded-xl border border-white/20">
            <label className="text-xs text-indigo-150 font-bold uppercase tracking-wider block">SELECT CHILD</label>
            <Select value={selectedChildIndex.toString()} onValueChange={handleChildSelect}>
              <SelectTrigger className="bg-white text-slate-800 border-none h-10">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child, idx) => (
                  <SelectItem key={child.profile.id} value={idx.toString()}>
                    {child.profile.firstName} ({child.profile.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-3 rounded-xl text-sm flex items-center gap-3 relative z-10 shrink-0">
            <Users className="h-5 w-5" />
            <div className="text-left">
              <span className="text-xs text-indigo-200 block font-medium uppercase tracking-wider">CHILD</span>
              <span className="font-bold">{activeChild.profile.firstName} {activeChild.profile.lastName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left col: stats */}
        <div className="space-y-6">
          <Card className="border border-red-100 bg-red-50/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-red-800 uppercase tracking-wider">Total Pending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-extrabold text-red-650">৳{activeChild.totalDue}</span>
              <p className="text-xs text-slate-600 mt-2 font-medium">All outstanding academic billing for {activeChild.profile.firstName}.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right col: Table */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md border border-slate-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Fee Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeChild.fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        💰 No fee records found for this student.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeChild.fees.map((fee) => (
                      <TableRow key={fee.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-800">{fee.title}</TableCell>
                        <TableCell className="text-sm text-slate-700 capitalize">{fee.feeType.toLowerCase()}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-900">৳{fee.amount}</TableCell>
                        <TableCell className="text-sm text-red-500 font-medium">৳{fee.lateFee}</TableCell>
                        <TableCell className="text-sm text-slate-650 font-medium">{formatDate(fee.dueDate)}</TableCell>
                        <TableCell>
                          <Badge className={
                            fee.status === 'PAID' 
                              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' 
                              : fee.status === 'PENDING' 
                              ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100' 
                              : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                          }>
                            {fee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
