"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const calendarData = [
  [null, null, null, null, null, null, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, 29],
  [30, 31, null, null, null, null, null]
];

const specialDates = {
  3: 'holiday',
  13: 'meeting', 
  18: 'event',
  26: 'holiday'
};

const getDateColor = (date: number | null, isSelected: boolean) => {
  if (!date) return '';
  
  if (isSelected) {
    return 'text-white bg-blue-600 border-blue-600';
  }
  
  const type = specialDates[date as keyof typeof specialDates];
  switch (type) {
    case 'holiday': return 'text-red-600 bg-red-50 hover:bg-red-100';
    case 'meeting': return 'text-green-600 bg-green-50 hover:bg-green-100';
    case 'event': return 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100';
    default: return 'hover:bg-gray-100 hover:text-gray-900';
  }
};

const formatDate = (date: number) => {
  const month = 12; // December
  const year = 2024;
  return `${date.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
};

export function DashboardCalendar() {
  const [selectedDate, setSelectedDate] = useState<number>(7);

  const handleDateClick = (date: number | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Calendar</CardTitle>
          <Button variant="outline" className="flex items-center space-x-2 h-8 text-xs">
            <span>{formatDate(selectedDate)}</span>
            <CalendarIcon className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="space-y-2">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((date, dayIndex) => (
                  <div
                    key={dayIndex}
                    onClick={() => handleDateClick(date)}
                    className={`text-center text-xs rounded cursor-pointer transition-all duration-200 w-8 h-8 flex items-center justify-center border border-transparent ${
                      date ? getDateColor(date, selectedDate === date) : 'cursor-default'
                    } ${date ? 'hover:scale-105' : ''}`}
                  >
                    {date}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-4 pt-3">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-[10px]">Holidays</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[10px]">Meetings</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-[10px]">Events</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
