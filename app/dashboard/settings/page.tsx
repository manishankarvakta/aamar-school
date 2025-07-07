'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  SchoolIcon,
  ShieldIcon,
  BellIcon,
  DatabaseIcon,
  SaveIcon,
  RefreshCcwIcon,
  DownloadIcon,
  UploadIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import isEqual from 'lodash.isequal';
import { getSettings, updateSettings } from '@/app/actions/settings';


export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('school');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleEditing, setScheduleEditing] = useState<boolean>(false);
  const { toast } = useToast();

  const toggleScheduleEditing = () => {
    setScheduleEditing(!scheduleEditing);
  }

 
  // Settings state
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'Springfield International School',
    address: '123 Education Street, Springfield',
    phone: '+1234567890',
    email: 'admin@springfield.edu',
    website: 'www.springfield.edu',
    establishedYear: '1995',
    principalName: 'Dr. Sarah Johnson',
    motto: 'Excellence in Education',
    logo: '',
    academicYear: '2024-2025',
    gradeSystem: 'A-F',
    timezone: 'EST',
    currency: 'USD',
    startTime: '08:00',
    endTime: '14:00',
    periodDuration: 45,
    weeklyHolidays: [] as number[],
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    attendanceAlerts: true,
    feeReminders: true,
    examNotifications: true,
    generalAnnouncements: true,
    emergencyAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    dataEncryption: true,
    backupFrequency: 'daily',
    auditLogging: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true,
    maxFileSize: '10',
    sessionDuration: '8',
    defaultLanguage: 'en'
  });

  // Weekly schedule state for each day
  const defaultWeeklySchedule = [
    { open: false, start: '08:00', end: '14:00' }, // Sunday
    { open: false, start: '08:00', end: '14:00' }, // Monday
    { open: false, start: '08:00', end: '14:00' }, // Tuesday
    { open: false, start: '08:00', end: '14:00' }, // Wednesday
    { open: false, start: '08:00', end: '14:00' }, // Thursday
    { open: false, start: '08:00', end: '14:00' }, // Friday
    { open: false, start: '08:00', end: '14:00' }, // Saturday
  ];
  const [weeklySchedule, setWeeklySchedule] = useState(defaultWeeklySchedule);
  // 1. Add subjectDuration state
  const [subjectDuration, setSubjectDuration] = useState(45);
  // Remove isEditingSchedule, editWeeklySchedule, setIsEditingSchedule, setEditWeeklySchedule, and all edit mode logic
  // Always show editable controls for each day

  // Track last saved schedule
  const [lastSavedSchedule, setLastSavedSchedule] = useState(weeklySchedule);
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false);

  // Update hasScheduleChanges whenever weeklySchedule or lastSavedSchedule changes
  useEffect(() => {
    setHasScheduleChanges(!isEqual(weeklySchedule, lastSavedSchedule));
  }, [weeklySchedule, lastSavedSchedule]);

  // Load schedules on component mount
  useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings();
      if (res.success && res.data) {
        let loadedSchedule = defaultWeeklySchedule;
        let loadedDuration = 45;
        if (res.data.weeklySchedule) {
          let parsed = res.data.weeklySchedule;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              parsed = defaultWeeklySchedule;
            }
          }
          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item) =>
                item &&
                typeof item === 'object' &&
                typeof item.open === 'boolean' &&
                typeof item.start === 'string' &&
                typeof item.end === 'string'
            )
          ) {
            loadedSchedule = parsed;
          }
        }
        if (typeof res.data.subjectDuration === 'number') {
          loadedDuration = res.data.subjectDuration;
        }
        setWeeklySchedule(loadedSchedule);
        setLastSavedSchedule(loadedSchedule);
        setSubjectDuration(loadedDuration);
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to load settings', variant: 'destructive' });
      }
    }
    fetchSettings();
  }, []);



  const handleSave = async (section: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const handleReset = (section: string) => {
    // Reset to default values
    console.log(`Resetting ${section} to defaults`);
  };


  // Helper: generate time options for dropdowns
  const timeOptions = [
    { value: '24hours', label: '24 hours' },
    ...Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const min = i % 2 === 0 ? '00' : '30';
      const ampm = hour < 12 ? 'AM' : 'PM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return {
        value: `${hour.toString().padStart(2, '0')}:${min}`,
        label: `${hour12}:${min} ${ampm}`
      };
    })
  ];

  // Change the order of days to start with Friday
  const dayNames = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  // Add this function (replace with your actual API/server action as needed)
  async function saveScheduleSettings(schedule: typeof weeklySchedule) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weeklySchedule: schedule }),
    });
  }

  // 6. Update handleSaveSchedule to call updateSettings({ weeklySchedule, subjectDuration }) and handle API shape
  async function handleSaveSchedule() {
    setIsLoading(true);
    const res = await updateSettings({ weeklySchedule, subjectDuration });
    setIsLoading(false);
    if (res.success) {
      setLastSavedSchedule(weeklySchedule);
      toast({ title: 'Changes are saved', description: 'Your schedule has been updated.' });
      setScheduleEditing(false);
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to update schedule', variant: 'destructive' });
    }
  }

  // Save handlers for each tab
  async function handleSaveSchool() {
    setIsLoading(true);
    try {
      // await updateSettings({ schoolSettings });
      toast({ title: 'Changes are saved', description: 'School information updated.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update school information.', variant: 'destructive' });
    }
    setIsLoading(false);
  }

  async function handleSaveNotifications() {
    setIsLoading(true);
    try {
      // await updateSettings({ notificationSettings });
      toast({ title: 'Changes are saved', description: 'Notification preferences updated.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update notification preferences.', variant: 'destructive' });
    }
    setIsLoading(false);
  }

  async function handleSaveSecurity() {
    setIsLoading(true);
    try {
      // await updateSettings({ securitySettings });
      toast({ title: 'Changes are saved', description: 'Security settings updated.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update security settings.', variant: 'destructive' });
    }
    setIsLoading(false);
  }

  async function handleSaveSystem() {
    setIsLoading(true);
    try {
      // await updateSettings({ systemSettings });
      toast({ title: 'Changes are saved', description: 'System configuration updated.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update system configuration.', variant: 'destructive' });
    }
    setIsLoading(false);
  }

  async function handleSaveBackup() {
    setIsLoading(true);
    try {
      // await updateSettings({
      //   autoBackup: systemSettings.autoBackup,
      //   backupFrequency: securitySettings.backupFrequency,
      // });
      toast({ title: 'Changes are saved', description: 'Backup settings updated.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update backup settings.', variant: 'destructive' });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6 pb-[150px] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure school settings, preferences, and system options
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <UploadIcon className="h-4 w-4" />
            Import Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SchoolIcon className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input 
                    id="schoolName"
                    value={schoolSettings.name}
                    onChange={(e) => setSchoolSettings({...schoolSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal Name</Label>
                  <Input 
                    id="principalName"
                    value={schoolSettings.principalName}
                    onChange={(e) => setSchoolSettings({...schoolSettings, principalName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  value={schoolSettings.address}
                  onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    value={schoolSettings.phone}
                    onChange={(e) => setSchoolSettings({...schoolSettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={schoolSettings.email}
                    onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    value={schoolSettings.website}
                    onChange={(e) => setSchoolSettings({...schoolSettings, website: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input 
                    id="establishedYear"
                    value={schoolSettings.establishedYear}
                    onChange={(e) => setSchoolSettings({...schoolSettings, establishedYear: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motto">School Motto</Label>
                <Input 
                  id="motto"
                  value={schoolSettings.motto}
                  onChange={(e) => setSchoolSettings({...schoolSettings, motto: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={schoolSettings.academicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeSystem">Grade System</Label>
                  <Select value={schoolSettings.gradeSystem}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A-F">A-F Grade System</SelectItem>
                      <SelectItem value="1-10">1-10 Point System</SelectItem>
                      <SelectItem value="percentage">Percentage System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={schoolSettings.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReset('school')}>
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveSchool}>
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                School Hours
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set which days the school is open, and configure opening/closing times and subject duration for each day.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
                        <div className="space-y-2">               
                <div className="flex flex-col gap-2">
                  {dayNames.map((day, idx) => {
                    // Map day index to weeklySchedule index
                    const scheduleIdx = [5, 6, 0, 1, 2, 3, 4][idx];
                    return (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-lg bg-white">
                        <div className="flex items-center gap-4">
                            <Switch
                            id={`open-${scheduleIdx}`}
                            checked={weeklySchedule[scheduleIdx].open}
                            onCheckedChange={checked => {
                              if (!scheduleEditing) return;
                              const updated = [...weeklySchedule];
                              updated[scheduleIdx].open = checked;
                              // If switching to open, set default times if not set
                              if (checked && (updated[scheduleIdx].start === '' || updated[scheduleIdx].end === '')) {
                                updated[scheduleIdx].start = '08:00';
                                updated[scheduleIdx].end = '14:00';
                              }
                              setWeeklySchedule(updated);
                            }}
                            disabled={!scheduleEditing}
                          />
                          <Label htmlFor={`open-${scheduleIdx}`} className="w-24 text-sm font-medium">{day}</Label>
                          {weeklySchedule[scheduleIdx].open ? (
                            <>
                          <Select 
                                value={weeklySchedule[scheduleIdx].start === '24hours' ? '24hours' : weeklySchedule[scheduleIdx].start}
                                onValueChange={value => {
                                  if (!scheduleEditing) return;
                                  const updated = [...weeklySchedule];
                                  updated[scheduleIdx].start = value;
                                  if (value === '24hours') updated[scheduleIdx].end = '24hours';
                                  setWeeklySchedule(updated);
                                }}
                                disabled={!scheduleEditing}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Opens at" />
                            </SelectTrigger>
                            <SelectContent>
                                  {timeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                              <span>-</span>
                          <Select 
                                value={weeklySchedule[scheduleIdx].end === '24hours' ? '24hours' : weeklySchedule[scheduleIdx].end}
                                onValueChange={value => {
                                  if (!scheduleEditing) return;
                                  const updated = [...weeklySchedule];
                                  updated[scheduleIdx].end = value;
                                  if (value === '24hours') updated[scheduleIdx].start = '24hours';
                                  setWeeklySchedule(updated);
                                }}
                                disabled={!scheduleEditing}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Closes at" />
                            </SelectTrigger>
                            <SelectContent>
                                  {timeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                            </>
                          ) : (
                            <span className="text-gray-400 font-medium ml-2">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                            </div>
                            </div>
              <div className="mt-4">
                <Label className="font-medium">Subject Duration</Label>
                <Select value={subjectDuration.toString()} onValueChange={v => setSubjectDuration(Number(v))} disabled={!scheduleEditing}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="35">35 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="55">55 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4 border-t">
                {!scheduleEditing ? (
                  <Button onClick={toggleScheduleEditing}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button onClick={async () => {
                    setIsLoading(true);
                    await handleSaveSchedule();
                    setIsLoading(false);
                    setScheduleEditing(false);
                  }}>
                    {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">General Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                                         <Switch 
                       id="emailNotifications"
                       checked={notificationSettings.emailNotifications}
                       onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, emailNotifications: checked})
                       }
                     />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                                         <Switch 
                       id="smsNotifications"
                       checked={notificationSettings.smsNotifications}
                       onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, smsNotifications: checked})
                       }
                     />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch 
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                                           onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, pushNotifications: checked})
                       }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Specific Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alerts for student attendance issues</p>
                    </div>
                    <Switch 
                      id="attendanceAlerts"
                      checked={notificationSettings.attendanceAlerts}
                                             onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, attendanceAlerts: checked})
                       }
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="feeReminders">Fee Reminders</Label>
                       <p className="text-sm text-muted-foreground">Reminders for pending fee payments</p>
                     </div>
                     <Switch 
                       id="feeReminders"
                       checked={notificationSettings.feeReminders}
                       onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, feeReminders: checked})
                       }
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="examNotifications">Exam Notifications</Label>
                       <p className="text-sm text-muted-foreground">Notifications about upcoming exams</p>
                     </div>
                     <Switch 
                       id="examNotifications"
                       checked={notificationSettings.examNotifications}
                       onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, examNotifications: checked})
                       }
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="emergencyAlerts">Emergency Alerts</Label>
                       <p className="text-sm text-muted-foreground">Critical emergency notifications</p>
                     </div>
                     <Switch 
                       id="emergencyAlerts"
                       checked={notificationSettings.emergencyAlerts}
                       onCheckedChange={(checked: boolean) => 
                         setNotificationSettings({...notificationSettings, emergencyAlerts: checked})
                       }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReset('notifications')}>
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveNotifications}>
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Authentication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                                         <Switch 
                       id="twoFactorAuth"
                       checked={securitySettings.twoFactorAuth}
                       onCheckedChange={(checked: boolean) => 
                         setSecuritySettings({...securitySettings, twoFactorAuth: checked})
                       }
                     />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Session Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={securitySettings.sessionTimeout}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Select value={securitySettings.loginAttempts}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Data Protection</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataEncryption">Data Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                    </div>
                    <Switch 
                      id="dataEncryption"
                      checked={securitySettings.dataEncryption}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({...securitySettings, dataEncryption: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auditLogging">Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all system activities</p>
                    </div>
                    <Switch 
                      id="auditLogging"
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({...securitySettings, auditLogging: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReset('security')}>
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveSecurity}>
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Performance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cacheEnabled">Enable Caching</Label>
                      <p className="text-sm text-muted-foreground">Improve system performance</p>
                    </div>
                    <Switch 
                      id="cacheEnabled"
                      checked={systemSettings.cacheEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, cacheEnabled: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compressionEnabled">Enable Compression</Label>
                      <p className="text-sm text-muted-foreground">Reduce bandwidth usage</p>
                    </div>
                    <Switch 
                      id="compressionEnabled"
                      checked={systemSettings.compressionEnabled}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, compressionEnabled: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Maintenance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
                    </div>
                    <Switch 
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, maintenanceMode: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                    </div>
                    <Switch 
                      id="debugMode"
                      checked={systemSettings.debugMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, debugMode: checked})
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">File Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Select value={systemSettings.maxFileSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 MB</SelectItem>
                        <SelectItem value="10">10 MB</SelectItem>
                        <SelectItem value="25">25 MB</SelectItem>
                        <SelectItem value="50">50 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select value={systemSettings.defaultLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReset('system')}>
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveSystem}>
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Automatic Backups</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBackup">Enable Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup data</p>
                    </div>
                    <Switch 
                      id="autoBackup"
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, autoBackup: checked})
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={securitySettings.backupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Manual Backup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h5 className="font-medium">Create Backup</h5>
                        <p className="text-sm text-muted-foreground">Generate a complete system backup</p>
                        <Button className="w-full gap-2">
                          <DownloadIcon className="h-4 w-4" />
                          Create Backup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h5 className="font-medium">Restore Backup</h5>
                        <p className="text-sm text-muted-foreground">Restore from a previous backup</p>
                        <Button variant="outline" className="w-full gap-2">
                          <UploadIcon className="h-4 w-4" />
                          Restore Backup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Backups</h4>
                <div className="space-y-2">
                  {[
                    { date: '2024-02-20 09:00 AM', size: '2.4 GB', status: 'Success' },
                    { date: '2024-02-19 09:00 AM', size: '2.3 GB', status: 'Success' },
                    { date: '2024-02-18 09:00 AM', size: '2.2 GB', status: 'Success' }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{backup.date}</p>
                        <p className="text-sm text-muted-foreground">Size: {backup.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          {backup.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => handleReset('backup')}>
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveBackup}>
                  {isLoading ? <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" /> : <SaveIcon className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
