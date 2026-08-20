'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, AlertTriangle, Users, Sparkles } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface ExamResult {
  id: string;
  examName: string;
  subjectName: string;
  obtainedMarks: number;
  fullMarks: number;
  grade: string;
  remarks: string;
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
  examResults: ExamResult[];
}

interface ParentExamsClientProps {
  data: {
    parent: {
      firstName: string;
      lastName: string;
      email: string;
    };
    children: ChildData[];
  };
}

export function ParentExamsClient({ data }: ParentExamsClientProps) {
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

  return (
    <div className="space-y-6 p-6 pb-20 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10" />
        <div className="space-y-2 relative z-10">
          <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Exam Results
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Academic Performance</h1>
          <p className="text-indigo-200 text-sm max-w-md">
            Review term exam grades, marks, and remarks for your child.
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

      {/* Exam report */}
      <Card className="shadow-md border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-700" />
            Academic Report Card - {activeChild.profile.firstName} {activeChild.profile.lastName}
          </CardTitle>
          <CardDescription>Subject-wise breakdown of marks and grades obtained.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {activeChild.examResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              📝 No exam results have been published yet for this student.
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/50 text-slate-650 font-semibold">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Exam Name</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Subject</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Marks Obtained</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Percentage</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Grade</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-600">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {activeChild.examResults.map((result) => {
                  const percentage = Math.round((result.obtainedMarks / result.fullMarks) * 100);
                  const isPassed = percentage >= 33;

                  return (
                    <tr key={result.id} className="border-b hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{result.examName}</td>
                      <td className="p-4 font-medium text-slate-700">{result.subjectName}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{result.obtainedMarks}</span> / <span className="text-muted-foreground">{result.fullMarks}</span>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={isPassed ? 'text-green-605 font-bold' : 'text-red-600 font-bold'}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          result.grade.startsWith('A') 
                            ? 'bg-green-100 text-green-800 border-green-200 font-semibold hover:bg-green-100' 
                            : result.grade === 'F' 
                            ? 'bg-red-100 text-red-800 border-red-200 font-semibold hover:bg-red-100' 
                            : 'bg-amber-100 text-amber-800 border-amber-200 font-semibold hover:bg-amber-100'
                        }>
                          {result.grade}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{result.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
