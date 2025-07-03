import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StatCard = ({ label, value, change, changeType }: { label: string; value: string; change?: string; changeType?: "increase" | "decrease" }) => (
  <div className="flex flex-col p-3">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <div className="flex items-center gap-1">
      <p className="text-xl font-bold">{value}</p>
      {change && changeType === "increase" && (
        <Badge className="bg-green-100 text-green-800 text-[10px] px-1 py-0 h-4">
          {change}
        </Badge>
      )}
      {change && changeType === "decrease" && (
        <Badge className="bg-red-100 text-red-800 text-[10px] px-1 py-0 h-4">
          {change}
        </Badge>
      )}
    </div>
  </div>
);

export function TeachersOverview({
  totalTeachers = "89",
  newHires = "12",
  onLeave = "7",
  fullTime = "76",
  partTime = "13",
  teachersChange = "+5%",
  newHiresChange = "+15%",
  onLeaveChange = "-2%",
  teachersChangeType = "increase",
  newHiresChangeType = "increase",
  onLeaveChangeType = "decrease",
} : {
  totalTeachers?: string | number;
  newHires?: string | number;
  onLeave?: string | number;
  fullTime?: string | number;
  partTime?: string | number;
  teachersChange?: string;
  newHiresChange?: string;
  onLeaveChange?: string;
  teachersChangeType?: "increase" | "decrease";
  newHiresChangeType?: "increase" | "decrease";
  onLeaveChangeType?: "increase" | "decrease";
}) {
  const stats = [
    { label: "Total Teachers", value: totalTeachers, change: teachersChange, changeType: teachersChangeType },
    { label: "New Hires", value: newHires, change: newHiresChange, changeType: newHiresChangeType },
    { label: "On Leave", value: onLeave, change: onLeaveChange, changeType: onLeaveChangeType },
    { label: "Full-time", value: fullTime },
    { label: "Part-time", value: partTime },
  ];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Teachers overview</CardTitle>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              95% retention rate this year
            </div>
          </div>
          <Select defaultValue="last-year">
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Last 1 year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-year">Last 1 year</SelectItem>
              <SelectItem value="last-6-months">Last 6 months</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-700">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 