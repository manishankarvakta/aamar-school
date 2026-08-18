"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BuildingIcon,
  PlusIcon,
  SearchIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UsersIcon,
  BookOpenIcon,
  MoreVerticalIcon,
  Layers,
  LayoutGrid,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { addBranch, toggleBranchStatus, BranchWithStats } from "@/app/actions/branches";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const BRANCH_COLORS = [
  { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
];

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-xs"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

// ─── Main client component ───────────────────────────────────────────────────
export function BranchesClient({ initialBranches }: { initialBranches: BranchWithStats[] }) {
  const [branches, setBranches] = useState<BranchWithStats[]>(initialBranches);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("branches");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Add form state
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Derived stats ──
  const totalStudents = branches.reduce((s, b) => s + b.totalStudents, 0);
  const totalTeachers = branches.reduce((s, b) => s + b.totalTeachers, 0);
  const activeBranches = branches.filter((b) => b.isActive).length;

  const stats = [
    { title: "Total Branches", value: branches.length, icon: BuildingIcon, color: "blue" },
    { title: "Active Branches", value: activeBranches, icon: ToggleRight, color: "green" },
    { title: "Total Students", value: totalStudents.toLocaleString(), icon: UsersIcon, color: "purple" },
    { title: "Total Teachers", value: totalTeachers.toLocaleString(), icon: GraduationCap, color: "orange" },
  ];

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Add branch ──
  const handleAdd = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setFormError("Branch name and code are required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    const res = await addBranch(form);
    setIsSubmitting(false);
    if (!res.success) {
      setFormError(res.error ?? "Failed to add branch.");
      return;
    }
    setShowAddDialog(false);
    setForm({ name: "", code: "", address: "", phone: "", email: "" });
    // Reload data
    startTransition(async () => {
      const { getBranchesWithStats } = await import("@/app/actions/branches");
      const fresh = await getBranchesWithStats();
      if (fresh.success) setBranches(fresh.data);
    });
  };

  // ── Toggle status ──
  const handleToggle = async (id: string, isActive: boolean) => {
    await toggleBranchStatus(id, isActive);
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <div className="space-y-5 pb-[150px] p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage school branches and campus information
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold mt-0.5">{stat.value}</p>
                </div>
                <div
                  className={`p-2 rounded-xl bg-gradient-to-br ${BRANCH_COLORS[i % BRANCH_COLORS.length].bg} shadow-sm`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Search ── */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="h-9">
          <TabsTrigger value="branches" className="text-xs gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" /> Branches
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Performance
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Reports
          </TabsTrigger>
        </TabsList>

        {/* ── Branches Tab ── */}
        <TabsContent value="branches" className="mt-3">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Branch</TableHead>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs text-center">Students</TableHead>
                    <TableHead className="text-xs text-center">Teachers</TableHead>
                    <TableHead className="text-xs text-center">Classes</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                        No branches found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((branch, idx) => {
                      const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                      return (
                        <TableRow key={branch.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${color.bg} shadow-sm`}>
                                <BuildingIcon className="h-3.5 w-3.5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{branch.name}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                  <MapPinIcon className="h-2.5 w-2.5" />
                                  {branch.address || "—"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              {branch.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {branch.phone && (
                                <p className="flex items-center gap-1 text-muted-foreground">
                                  <PhoneIcon className="h-2.5 w-2.5" />
                                  {branch.phone}
                                </p>
                              )}
                              {branch.email && (
                                <p className="flex items-center gap-1 text-muted-foreground">
                                  <MailIcon className="h-2.5 w-2.5" />
                                  {branch.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm">{branch.totalStudents}</TableCell>
                          <TableCell className="text-center font-bold text-sm">{branch.totalTeachers}</TableCell>
                          <TableCell className="text-center font-bold text-sm">{branch.totalClasses}</TableCell>
                          <TableCell>
                            <StatusBadge isActive={branch.isActive} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleToggle(branch.id, branch.isActive)}
                                  className={branch.isActive ? "text-red-600" : "text-emerald-600"}
                                >
                                  {branch.isActive ? (
                                    <><ToggleLeft className="h-4 w-4 mr-2" /> Deactivate</>
                                  ) : (
                                    <><ToggleRight className="h-4 w-4 mr-2" /> Activate</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Performance Tab ── */}
        <TabsContent value="performance" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((branch, idx) => {
              const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];
              return (
                <Card key={branch.id} className="overflow-hidden">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${color.bg}`} />
                  <CardHeader className="pb-3 pt-3 px-4">
                    <CardTitle className="flex items-center gap-2.5 text-sm">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color.bg}`}>
                        <BuildingIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      {branch.name}
                      <StatusBadge isActive={branch.isActive} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Students", value: branch.totalStudents, icon: UsersIcon, cls: color.light },
                        { label: "Teachers", value: branch.totalTeachers, icon: GraduationCap, cls: color.light },
                        { label: "Classes", value: branch.totalClasses, icon: BookOpenIcon, cls: color.light },
                        { label: "Sections", value: branch.totalSections, icon: Layers, cls: color.light },
                      ].map(({ label, value, icon: Icon, cls }) => (
                        <div key={label} className={`rounded-xl p-3 ${cls}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="h-3 w-3 opacity-70" />
                            <p className="text-[11px] opacity-70">{label}</p>
                          </div>
                          <p className="text-lg font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Student ratio bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Student share</span>
                        <span>
                          {totalStudents > 0
                            ? Math.round((branch.totalStudents / totalStudents) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${color.bg} transition-all`}
                          style={{
                            width: totalStudents > 0
                              ? `${(branch.totalStudents / totalStudents) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Reports Tab ── */}
        <TabsContent value="reports" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status distribution */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: "Active", count: branches.filter((b) => b.isActive).length, color: "bg-emerald-500" },
                  { label: "Inactive", count: branches.filter((b) => !b.isActive).length, color: "bg-red-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: branches.length > 0 ? `${(count / branches.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Student distribution */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Student Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {branches.map((b, idx) => (
                  <div key={b.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[120px]">{b.name}</span>
                      <span className="font-semibold">{b.totalStudents}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${BRANCH_COLORS[idx % BRANCH_COLORS.length].bg} transition-all`}
                        style={{ width: totalStudents > 0 ? `${(b.totalStudents / totalStudents) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Teacher distribution */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Teacher Distribution</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {branches.map((b, idx) => (
                  <div key={b.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate max-w-[120px]">{b.name}</span>
                      <span className="font-semibold">{b.totalTeachers}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${BRANCH_COLORS[idx % BRANCH_COLORS.length].bg} transition-all`}
                        style={{ width: totalTeachers > 0 ? `${(b.totalTeachers / totalTeachers) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Add Branch Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-blue-500" />
              Add New Branch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {formError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Branch Name *</Label>
                <Input
                  placeholder="e.g., North Campus"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Branch Code *</Label>
                <Input
                  placeholder="e.g., NORTH"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  placeholder="+880-..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="branch@school.edu.bd"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Address</Label>
                <Input
                  placeholder="Full address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Branch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
