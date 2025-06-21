import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Overall Students", value: "12,200", change: "+10%", changeType: "increase" },
  { label: "New Admissions", value: "3,900", change: "+10%", changeType: "increase" },
  { label: "Dropouts", value: "10", change: "-1.8%", changeType: "decrease" },
  { label: "Boys", value: "6,000" },
  { label: "Girls", value: "6,200" },
] as const;

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

export function StudentsOverview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Students overview</CardTitle>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              120% higher than last year
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
