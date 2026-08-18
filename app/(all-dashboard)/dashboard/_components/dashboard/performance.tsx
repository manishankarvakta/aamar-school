"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


const COLORS = ['#3B82F6', '#E5E7EB'];

export function Performance({
  boys = 0,
  girls = 0,
  averagePercentage = 85,
  grade = "Excellent",
}: {
  boys?: number;
  girls?: number;
  averagePercentage?: number;
  grade?: string;
}) {
  const chartData = [
    { name: 'Performance', value: averagePercentage },
    { name: 'Remaining', value: 100 - averagePercentage },
  ];

  
  const total = boys + girls;
  const boysPercent = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercent = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Performance</CardTitle>
          <div className="flex space-x-2">
            <Select defaultValue="all-classes">
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-classes">All Classes</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="full-year">
              <SelectTrigger className="w-[85px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-year">Full year</SelectItem>
                <SelectItem value="half-year">Half year</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center space-y-6">
          {/* Much Larger Semi-circular Performance Chart */}
          <div className="relative w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="65%"
                  outerRadius="95%"
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Smaller Text Inside Chart */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
              <div className="text-2xl font-bold text-blue-600">{averagePercentage}%</div>
              <div className="text-sm text-green-600 font-medium">{grade}</div>
            </div>
          </div>
          
          {/* Gender Distribution */}
          <div className="w-full space-y-3">
            <h4 className="text-sm font-medium text-center text-muted-foreground">Gender Distribution</h4>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Boys ({boysPercent}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Girls ({girlsPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
