'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus, Search, MegaphoneIcon, Eye, Trash2,
  Clock, Users, AlertTriangle, Calendar, Send,
  FileText, CheckCircle, Bookmark, Filter, CalendarClock,
} from 'lucide-react';
import { createAnnouncement, deleteAnnouncement, getAllAnnouncements } from '@/app/actions/announcements';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  audience: string[];
  author: string;
  authorInitials: string;
  createdAt: string;
  scheduledAt: string | null;
  status: string;
}

interface Stats {
  total: number;
  urgent: number;
  event: number;
  general: number;
  scheduled: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const getTypeColor = (type: string) => {
  switch (type) {
    case 'urgent':   return 'bg-red-100 text-red-800';
    case 'event':    return 'bg-blue-100 text-blue-800';
    case 'academic': return 'bg-purple-100 text-purple-800';
    case 'holiday':  return 'bg-green-100 text-green-800';
    default:         return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':   return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low':    return 'bg-green-100 text-green-800';
    default:       return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'scheduled': return <CalendarClock className="h-4 w-4 text-blue-500" />;
    case 'draft':     return <FileText className="h-4 w-4 text-gray-600" />;
    case 'archived':  return <Bookmark className="h-4 w-4 text-gray-400" />;
    default:          return null;
  }
};

// Min datetime string for the picker (now + 1 min)
function minDateTime() {
  const d = new Date(Date.now() + 60_000);
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

// ─── Main ────────────────────────────────────────────────────────────────────────
export function AnnouncementsClient({
  initialData,
  initialStats,
}: {
  initialData: Announcement[];
  initialStats: Stats;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialData);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewAnnouncement, setViewAnnouncement] = useState<Announcement | null>(null);

  // ── Schedule dialog ──
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // ── Form state (shared between Publish + Schedule) ──
  const [form, setForm] = useState({
    title: '', message: '', announcementType: 'general', audience: 'all',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, startTransition] = useTransition();

  // ── Filtered list ──
  const filtered = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType   = filterType === 'all' || a.type === filterType;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Reload from server ──
  const reload = () => {
    startTransition(async () => {
      const res = await getAllAnnouncements();
      if (res.success) {
        setAnnouncements(res.data as Announcement[]);
        setStats(res.stats as Stats);
      }
    });
  };

  // ── Validate form before submit ──
  const validateForm = () => {
    if (!form.title.trim() || !form.message.trim()) {
      setFormError('Title and content are required.');
      return false;
    }
    setFormError('');
    return true;
  };

  // ── Publish Now ──
  const handlePublish = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const res = await createAnnouncement({
      title: form.title,
      message: form.message,
      announcementType: form.announcementType,
      audience: [form.audience],
      // no scheduledAt → visibleFrom = now
    });
    setIsSubmitting(false);
    if (!res.success) { setFormError(res.error ?? 'Failed.'); return; }
    setForm({ title: '', message: '', announcementType: 'general', audience: 'all' });
    reload();
  };

  // ── Open schedule dialog ──
  const handleOpenSchedule = () => {
    if (!validateForm()) return;
    setScheduleDateTime('');
    setScheduleError('');
    setShowScheduleDialog(true);
  };

  // ── Confirm schedule ──
  const handleConfirmSchedule = async () => {
    if (!scheduleDateTime) {
      setScheduleError('Please select a date and time.');
      return;
    }
    const chosen = new Date(scheduleDateTime);
    if (chosen <= new Date()) {
      setScheduleError('Scheduled time must be in the future.');
      return;
    }
    setScheduleError('');
    setIsSubmitting(true);
    const res = await createAnnouncement({
      title: form.title,
      message: form.message,
      announcementType: form.announcementType,
      audience: [form.audience],
      scheduledAt: chosen.toISOString(),
    });
    setIsSubmitting(false);
    if (!res.success) { setScheduleError(res.error ?? 'Failed.'); return; }
    setShowScheduleDialog(false);
    setForm({ title: '', message: '', announcementType: 'general', audience: 'all' });
    reload();
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setStats((s) => ({ ...s, total: Math.max(0, s.total - 1) }));
  };

  return (
    <div className="flex-1 space-y-4 p-6 pb-[150px]">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create, manage, and track school-wide communications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MegaphoneIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">General</p>
                <p className="text-2xl font-bold">{stats.general}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarClock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Create Form ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Announcement title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={form.announcementType}
                  onValueChange={(v) => setForm({ ...form, announcementType: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Audience</label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => setForm({ ...form, audience: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Write your announcement here..."
                  className="min-h-[120px]"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              {formError && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-md">
                  {formError}
                </p>
              )}
              <div className="flex space-x-2">
                {/* ── Publish Now ── */}
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Publishing...' : 'Publish Now'}
                </Button>

                {/* ── Schedule ── */}
                <Button
                  variant="outline"
                  className="flex-1 border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  onClick={handleOpenSchedule}
                  disabled={isSubmitting}
                >
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Announcements List ── */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recent Announcements
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filtered.length} of {announcements.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MegaphoneIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No announcements found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((ann) => (
                <div
                  key={ann.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors ${
                    ann.status === 'scheduled'
                      ? 'border-blue-200 bg-blue-50/40 dark:bg-blue-950/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{ann.title}</h3>
                        <Badge className={getTypeColor(ann.type)}>{ann.type}</Badge>
                        <Badge className={getPriorityColor(ann.priority)}>{ann.priority} priority</Badge>
                        {getStatusIcon(ann.status)}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {ann.content}
                      </p>

                      {/* Scheduled badge */}
                      {ann.status === 'scheduled' && ann.scheduledAt && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Scheduled for: {ann.scheduledAt}
                        </div>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="text-[10px]">{ann.authorInitials}</AvatarFallback>
                          </Avatar>
                          {ann.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {ann.createdAt}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ann.audience.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => setViewAnnouncement(ann)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(ann.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Schedule Dialog ── */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Schedule Announcement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-0.5">
              <p className="text-xs font-semibold text-foreground truncate">
                📢 {form.title || 'Untitled'}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">{form.message}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Send at</Label>
              <Input
                type="datetime-local"
                min={minDateTime()}
                value={scheduleDateTime}
                onChange={(e) => {
                  setScheduleDateTime(e.target.value);
                  setScheduleError('');
                }}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The announcement will be delivered automatically at the chosen time.
              </p>
            </div>

            {scheduleError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-md">
                {scheduleError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmSchedule}
              disabled={isSubmitting || !scheduleDateTime}
            >
              <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewAnnouncement} onOpenChange={() => setViewAnnouncement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MegaphoneIcon className="h-4 w-4 text-blue-500" />
              {viewAnnouncement?.title}
            </DialogTitle>
          </DialogHeader>
          {viewAnnouncement && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={getTypeColor(viewAnnouncement.type)}>{viewAnnouncement.type}</Badge>
                <Badge className={getPriorityColor(viewAnnouncement.priority)}>
                  {viewAnnouncement.priority} priority
                </Badge>
                <Badge className={viewAnnouncement.status === 'scheduled'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'}>
                  {viewAnnouncement.status}
                </Badge>
              </div>

              {viewAnnouncement.status === 'scheduled' && viewAnnouncement.scheduledAt && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Scheduled for: {viewAnnouncement.scheduledAt}
                </div>
              )}

              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {viewAnnouncement.content}
              </p>
              <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                <p><span className="font-medium">Author:</span> {viewAnnouncement.author}</p>
                <p><span className="font-medium">Created:</span> {viewAnnouncement.createdAt}</p>
                <p><span className="font-medium">Audience:</span> {viewAnnouncement.audience.join(', ')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
