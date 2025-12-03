// /app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Shield,
  Key,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PLANS, getPlanById } from '@/lib/plans';

interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
  apiKeyUsage: number;
  apiKeyLimit: number;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

type FormState = {
  displayName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  plan: 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME';
  apiKeyLimit: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [planFilter, setPlanFilter] = useState<
    'all' | 'FREE' | 'CHEAP' | 'PREMIUM' | 'VIP' | 'VVIP' | 'SUPREME'
  >('all');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createMode, setCreateMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    displayName: '',
    email: '',
    password: '',
    role: 'user',
    plan: 'FREE',
    apiKeyLimit: 20,
  });

  const { toast } = useToast();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'bg-slate-100 text-slate-800';
      case 'CHEAP':
        return 'bg-blue-100 text-blue-800';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800';
      case 'VIP':
        return 'bg-amber-100 text-amber-800';
      case 'VVIP':
        return 'bg-red-100 text-red-800';
      case 'SUPREME':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';

    let date: Date;

    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(
        timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1_000_000,
      );
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Unknown';
    }

    if (Number.isNaN(date.getTime())) return 'Unknown';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getUsagePercentage = (user: User) => {
    if (!user.apiKeyLimit) return 0;
    return Math.min(100, Math.round((user.apiKeyUsage / user.apiKeyLimit) * 100));
  };

  // Get API limit based on plan
  const getApiLimitForPlan = (planId: string): number => {
    const plan = getPlanById(planId);
    return plan ? plan.apiLimit : 20; // Default to FREE plan limit
  };

  // Update API limit when plan changes
  const handlePlanChange = (planId: string) => {
    setFormData((f) => ({ 
      ...f, 
      plan: planId as any,
      apiKeyLimit: getApiLimitForPlan(planId)
    }));
  };

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const json = await res.json();

      if (json.success) {
        setUsers(json.data);
        setFilteredUsers(json.data);
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let data = [...users];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (u) =>
          u.displayName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }

    if (roleFilter !== 'all') {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (planFilter !== 'all') {
      data = data.filter((u) => u.plan === planFilter);
    }

    setFilteredUsers(data);
  }, [users, searchTerm, roleFilter, planFilter]);

  // ---------------------------------------------------------------------------
  // CRUD handlers
  // ---------------------------------------------------------------------------
  const resetForm = () => {
    setFormData({
      displayName: '',
      email: '',
      password: '',
      role: 'user',
      plan: 'FREE',
      apiKeyLimit: 20,
    });
    setShowPassword(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setSelectedUser(null);
    setCreateMode(true);
    setEditMode(false);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      password: '',
      role: user.role,
      plan: user.plan,
      apiKeyLimit: user.apiKeyLimit,
    });
    setCreateMode(false);
    setEditMode(true);
  };

  const handleCreateUser = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Success', description: 'User created successfully.' });
        setCreateMode(false);
        resetForm();
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to create user.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create user.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, ...formData }),
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Success', description: 'User updated successfully.' });
        setEditMode(false);
        setSelectedUser(null);
        resetForm();
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to update user.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const ok = window.confirm(
      'Are you sure you want to delete this user? This action cannot be undone.',
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Success', description: 'User deleted successfully.' });
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createMode) {
      await handleCreateUser();
    } else if (editMode) {
      await handleUpdateUser();
    }
  };

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const totalUsage = users.reduce((sum, u) => sum + u.apiKeyUsage, 0);

  const activePct =
    totalUsers === 0 ? 0 : ((activeUsers / totalUsers) * 100).toFixed(1);
  const adminPct =
    totalUsers === 0 ? 0 : ((adminUsers / totalUsers) * 100).toFixed(1);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="pt-4 space-y-8 animate-pulse">
        <div className="h-6 bg-muted rounded w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-24 bg-muted" />
          ))}
        </div>
        <Card className="h-40 bg-muted" />
        <Card className="h-64 bg-muted" />
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-8">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage user accounts, roles, and API usage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4" />
            Create user
          </Button>
        </div>
      </header>

      {/* FILTERS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Quickly narrow down users by name, role, or subscription plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-1 md:col-span-1">
              <Label htmlFor="search" className="text-xs font-medium">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Role</Label>
              <Select
                value={roleFilter}
                onValueChange={(value: 'all' | 'user' | 'admin') =>
                  setRoleFilter(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Plan</Label>
              <Select
                value={planFilter}
                onValueChange={(
                  value:
                    | 'all'
                    | 'FREE'
                    | 'CHEAP'
                    | 'PREMIUM'
                    | 'VIP'
                    | 'VVIP'
                    | 'SUPREME',
                ) => setPlanFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="CHEAP">CHEAP</SelectItem>
                  <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="VVIP">VVIP</SelectItem>
                  <SelectItem value="SUPREME">SUPREME</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Total users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {adminUsers} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Active users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activePct}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Admin users</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              {adminPct}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">API usage</CardTitle>
            <Key className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalUsage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total API calls</p>
          </CardContent>
        </Card>
      </section>

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Users{' '}
            <span className="font-normal text-muted-foreground">
              ({filteredUsers.length})
            </span>
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    User
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    API usage
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t text-xs sm:text-sm hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user.displayName?.charAt(0) ||
                              user.email?.charAt(0) ||
                              'U'}
                          </span>
                        </div>
                        <div className="space-y-[1px]">
                          <div className="font-medium">
                            {user.displayName || 'Unknown user'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate max-w-[140px] sm:max-w-none">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge className={cn('text-[11px]', getRoleBadgeColor(user.role))}>
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge className={cn('text-[11px]', getPlanBadgeColor(user.plan))}>
                        {user.plan}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">
                          {user.apiKeyUsage}/{user.apiKeyLimit}
                        </span>
                        <div className="h-1.5 w-16 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${getUsagePercentage(user)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          'text-[11px]',
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800',
                        )}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-xs sm:text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No users found. Adjust your filters or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE / EDIT USER DIALOG */}
      <Dialog
        open={createMode || editMode}
        onOpenChange={(open) => {
          if (!open) {
            setCreateMode(false);
            setEditMode(false);
            setSelectedUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base">
              {createMode ? 'Create user' : 'Edit user'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {createMode
                ? 'Create a new user account with an API limit and plan.'
                : 'Update user details, role, and API limit.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-xs">
                Display name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, displayName: e.target.value }))
                }
                placeholder="Enter display name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Enter email"
                disabled={editMode}
              />
            </div>

            {createMode && (
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="Set initial password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'user' | 'admin') =>
                    setFormData((f) => ({ ...f, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={handlePlanChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="CHEAP">CHEAP</SelectItem>
                    <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="VVIP">VVIP</SelectItem>
                    <SelectItem value="SUPREME">SUPREME</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">API key limit</Label>
              <Input
                type="number"
                min={1}
                value={formData.apiKeyLimit}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    apiKeyLimit: Number(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateMode(false);
                  setEditMode(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Saving…'
                  : createMode
                  ? 'Create user'
                  : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
