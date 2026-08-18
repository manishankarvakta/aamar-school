"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { getBDHolidaysForMonth } from "@/lib/bd-holidays";
import {
  getCalendarEvents,
  addCalendarEvent,
  deleteCalendarEvent,
  getDefaultSchoolId,
} from "@/app/actions/calendar";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type EventType = "EVENT" | "MEETING";

interface CalEvent {
  id: string;
  title: string;
  type: EventType;
  description: string | null;
}

type EventMap = Record<number, CalEvent[]>;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const grid: (number | null)[][] = [];
  let day = 1;
  for (let week = 0; week < 6; week++) {
    const row: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = week * 7 + col;
      if (cellIndex < firstDay || day > daysInMonth) {
        row.push(null);
      } else {
        row.push(day++);
      }
    }
    grid.push(row);
    if (day > daysInMonth) break;
  }
  return grid;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function DashboardCalendar() {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1; // 1-indexed
  const todayDay = now.getDate();

  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(todayDay);

  // Data
  const [holidays, setHolidays] = useState<Record<number, string>>({});
  const [eventMap, setEventMap] = useState<EventMap>({});
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDay, setDialogDay] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EventType>("EVENT");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch school id once ──
  useEffect(() => {
    getDefaultSchoolId().then((res) => {
      if (res.success) setSchoolId(res.schoolId);
    });
  }, []);

  // ── Load holidays + events when month/year changes ──
  const loadData = useCallback(() => {
    setHolidays(getBDHolidaysForMonth(year, month));
    startTransition(async () => {
      const res = await getCalendarEvents(year, month);
      if (res.success) setEventMap(res.data as EventMap);
    });
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Navigation ──
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  // ── Cell styling ──
  const getCellClass = (day: number | null, isToday: boolean, isSelected: boolean) => {
    if (!day) return "";
    const hasHoliday = !!holidays[day];
    const events = eventMap[day] ?? [];
    const hasMeeting = events.some((e) => e.type === "MEETING");
    const hasEvent = events.some((e) => e.type === "EVENT");

    let base =
      "relative text-center text-xs rounded-lg cursor-pointer transition-all duration-200 w-8 h-8 flex items-center justify-center font-medium select-none ";

    if (isSelected) {
      base += "ring-2 ring-blue-500 ring-offset-1 bg-blue-600 text-white ";
    } else if (isToday) {
      base += "ring-2 ring-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ";
    } else {
      base += "text-foreground hover:bg-muted hover:scale-105 ";
    }

    // Dot indicator colors (priority: holiday > meeting > event)
    if (hasHoliday) base += "!text-red-600 dark:!text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 ";
    else if (hasMeeting) base += "!text-green-700 dark:!text-green-400 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 ";
    else if (hasEvent) base += "!text-yellow-700 dark:!text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50 hover:bg-yellow-100 ";

    return base;
  };

  const getDotColor = (day: number): string | null => {
    if (holidays[day]) return "bg-red-500";
    const events = eventMap[day] ?? [];
    if (events.some((e) => e.type === "MEETING")) return "bg-green-500";
    if (events.some((e) => e.type === "EVENT")) return "bg-yellow-500";
    return null;
  };

  // ── Open add dialog ──
  const openDialog = (day: number) => {
    setDialogDay(day);
    setNewTitle("");
    setNewType("EVENT");
    setNewDesc("");
    setDialogOpen(true);
  };

  // ── Submit new event ──
  const handleAddEvent = async () => {
    if (!newTitle.trim() || !dialogDay || !schoolId) return;
    setIsSubmitting(true);
    const res = await addCalendarEvent({
      title: newTitle.trim(),
      date: dayKey(year, month, dialogDay),
      type: newType,
      description: newDesc.trim() || undefined,
      schoolId,
    });
    setIsSubmitting(false);
    if (res.success) {
      setDialogOpen(false);
      loadData();
    }
  };

  // ── Delete event ──
  const handleDelete = async (id: string) => {
    await deleteCalendarEvent(id);
    loadData();
  };

  // ── Selected day events/holiday info ──
  const selectedEvents = selectedDay ? (eventMap[selectedDay] ?? []) : [];
  const selectedHoliday = selectedDay ? (holidays[selectedDay] ?? null) : null;

  const grid = buildCalendarGrid(year, month);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium w-28 text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-muted-foreground h-6 flex items-center justify-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const isToday =
                  day !== null &&
                  year === todayYear &&
                  month === todayMonth &&
                  day === todayDay;
                const isSelected = day !== null && day === selectedDay;
                const dotColor = day ? getDotColor(day) : null;

                return (
                  <div
                    key={di}
                    onClick={() => {
                      if (day) setSelectedDay(day);
                    }}
                    className={getCellClass(day, isToday, isSelected)}
                  >
                    {day ?? ""}
                    {dotColor && (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${dotColor}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 pt-1 border-t">
          {[
            { color: "bg-red-500", label: "Holiday" },
            { color: "bg-yellow-500", label: "Event" },
            { color: "bg-green-500", label: "Meeting" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Selected day info panel */}
        {selectedDay && (
          <div className="mt-2 rounded-lg border bg-muted/40 p-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {MONTH_NAMES[month - 1]} {selectedDay}, {year}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => openDialog(selectedDay)}
                title="Add event or meeting"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {selectedHoliday && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {selectedHoliday}
                </span>
              </div>
            )}

            {selectedEvents.length === 0 && !selectedHoliday && (
              <p className="text-muted-foreground text-[11px]">
                No events. Click{" "}
                <span className="font-medium text-foreground">+</span> to add.
              </p>
            )}

            {selectedEvents.map((ev) => (
              <div key={ev.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5">
                  <span
                    className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      ev.type === "MEETING" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-foreground leading-tight">
                      {ev.title}
                    </p>
                    {ev.description && (
                      <p className="text-muted-foreground text-[10px] leading-tight">
                        {ev.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 shrink-0 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDelete(ev.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Event / Meeting Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Add to{" "}
              {dialogDay
                ? `${MONTH_NAMES[month - 1]} ${dialogDay}, ${year}`
                : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Type selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewType("EVENT")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  newType === "EVENT"
                    ? "bg-yellow-500 border-yellow-500 text-white"
                    : "border-border text-muted-foreground hover:border-yellow-400"
                }`}
              >
                🟡 Event
              </button>
              <button
                onClick={() => setNewType("MEETING")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  newType === "MEETING"
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-border text-muted-foreground hover:border-green-400"
                }`}
              >
                🟢 Meeting
              </button>
            </div>

            <Input
              placeholder="Title *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm h-9"
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
            />

            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="text-sm resize-none h-20"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddEvent}
              disabled={!newTitle.trim() || isSubmitting}
              className={
                newType === "MEETING"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }
            >
              {isSubmitting ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
