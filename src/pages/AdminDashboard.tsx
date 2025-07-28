import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserProfile } from '@/components/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Users, Ticket, BarChart3, Settings, Search, Filter, Plus, Calendar, Activity, TrendingUp, MessageSquare, UserPlus, Shield, AlertTriangle, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SupportTicketManager } from '@/components/SupportTicketManager';
import { OffersManager } from '@/components/OffersManager';
import { KnowledgeBaseManager } from '@/components/KnowledgeBaseManager';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  customer: {
    full_name: string;
    user_id: string;
  } | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { profile, isAdmin } = useUserProfile();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'customer', password: 'tempPassword123!' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          customer:profiles!support_tickets_customer_id_fkey(full_name, user_id),
          assigned:profiles!support_tickets_assigned_to_fkey(full_name, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tickets",
          variant: "destructive",
        });
      } else {
        setTickets((data as any) || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to update ticket status",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Ticket status updated",
        });
        fetchTickets();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.fullName || !newUser.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.fullName,
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        toast({
          title: "Error",
          description: "Failed to create user account",
          variant: "destructive",
        });
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: newUser.fullName,
          role: newUser.role as any
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast({
          title: "Error", 
          description: "Failed to create user profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `User ${newUser.fullName} created successfully`,
      });
      
      setNewUser({ fullName: '', email: '', role: 'customer', password: 'tempPassword123!' });
      setShowCreateUser(false);
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const createSampleData = async () => {
    try {
      // Sample users data
      const sampleUsers = [
        { fullName: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'customer' },
        { fullName: 'Bob Smith', email: 'bob.smith@example.com', role: 'customer' },
        { fullName: 'Carol Davis', email: 'carol.davis@example.com', role: 'customer' },
        { fullName: 'David Wilson', email: 'david.wilson@example.com', role: 'customer' },
        { fullName: 'Emma Brown', email: 'emma.brown@example.com', role: 'support' }
      ];

        // Create sample users by inserting directly into profiles (auth users will be created via trigger)
        const usersToCreate = sampleUsers.map(user => ({
          user_id: crypto.randomUUID(),
          full_name: user.fullName,
          role: user.role as any
        }));

        const { error: profilesError } = await supabase
          .from('profiles')
          .insert(usersToCreate);

        if (profilesError) {
          console.error('Error creating sample users:', profilesError);
          // Try alternative approach: create through normal signup flow
          for (const user of sampleUsers) {
            try {
              const { data: authData } = await supabase.auth.signUp({
                email: user.email,
                password: 'tempPassword123!',
                options: {
                  data: {
                    full_name: user.fullName,
                  }
                }
              });
              
              if (authData.user) {
                await supabase
                  .from('profiles')
                  .upsert({
                    user_id: authData.user.id,
                    full_name: user.fullName,
                    role: user.role as any
                  });
              }
            } catch (userError) {
              console.log(`Skipping user ${user.email}, may already exist`);
            }
          }
        }

      // Fetch updated users to get profile IDs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['customer']);

      if (profiles && profiles.length > 0) {
        // Sample tickets for each customer
        const sampleTickets = [
          { title: 'Battery not charging properly', description: 'My scooter battery takes very long to charge and doesn\'t hold charge for long.', category: 'technical', priority: 'high' },
          { title: 'GPS not working', description: 'The GPS in the app shows wrong location and navigation is not accurate.', category: 'technical', priority: 'medium' },
          { title: 'Payment failed', description: 'Unable to complete payment, getting error message during checkout.', category: 'billing', priority: 'high' },
          { title: 'Account access issue', description: 'Cannot log into my account, password reset not working.', category: 'account', priority: 'urgent' },
          { title: 'Scooter unlock problem', description: 'QR code scan is not working to unlock the scooter.', category: 'technical', priority: 'medium' }
        ];

        // Create 2-3 tickets for each customer
        for (let i = 0; i < profiles.length && i < 5; i++) {
          const customer = profiles[i];
          const numTickets = Math.floor(Math.random() * 2) + 2; // 2-3 tickets per customer
          
          for (let j = 0; j < numTickets; j++) {
            const ticket = sampleTickets[Math.floor(Math.random() * sampleTickets.length)];
            await supabase
              .from('support_tickets')
              .insert({
                customer_id: customer.id,
                title: ticket.title,
                description: ticket.description,
                category: ticket.category,
                priority: ticket.priority,
                status: Math.random() > 0.7 ? 'resolved' : Math.random() > 0.5 ? 'in_progress' : 'open'
              });
          }
        }
      }

      toast({
        title: "Success",
        description: "Sample data created successfully",
      });
      
      fetchUsers();
      fetchTickets();
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      closed: 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive'
    } as const;
    return <Badge variant={variants[priority as keyof typeof variants] || 'default'}>{priority}</Badge>;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    supportUsers: users.filter(u => u.role === 'support').length,
    customerUsers: users.filter(u => u.role === 'customer').length,
    urgentTickets: tickets.filter(t => t.priority === 'urgent').length,
    todayTickets: tickets.filter(t => {
      const today = new Date();
      const ticketDate = new Date(t.created_at);
      return ticketDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayTickets} created today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.urgentTickets} urgent
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">
                Being processed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">
                Success rate: {stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin & Support</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers + stats.supportUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.adminUsers} admins, {stats.supportUsers} support
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customerUsers}</div>
              <p className="text-xs text-muted-foreground">
                Regular customers
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="flex items-center gap-3 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">{ticket.customer?.full_name}</span>
                          <span className="text-muted-foreground"> created ticket: </span>
                          <span className="truncate">{ticket.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setShowCreateUser(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Ticket
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setShowCreateUser(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={createSampleData}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Add Sample Data
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <SupportTicketManager />
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <OffersManager />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="tickets-old" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-semibold">{ticket.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Customer: {ticket.customer?.full_name}</span>
                            <span>•</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No tickets found matching your criteria.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createSampleData} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sample Data
                    </Button>
                    <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>
                            Add a new user to the system. They will receive login credentials via email.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="fullName"
                                placeholder="Enter full name"
                                value={newUser.fullName}
                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Default Password</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Set default password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="support">Support Agent</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                            Cancel
                          </Button>
                          <Button onClick={createUser} disabled={isCreatingUser}>
                            {isCreatingUser ? 'Creating...' : 'Create User'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Open</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-destructive" 
                            style={{ width: `${stats.totalTickets > 0 ? (stats.openTickets / stats.totalTickets) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.openTickets}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${stats.totalTickets > 0 ? (stats.inProgressTickets / stats.totalTickets) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.inProgressTickets}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolved</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600" 
                            style={{ width: `${stats.totalTickets > 0 ? (stats.resolvedTickets / stats.totalTickets) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.resolvedTickets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customers</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${stats.totalUsers > 0 ? (stats.customerUsers / stats.totalUsers) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.customerUsers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500" 
                            style={{ width: `${stats.totalUsers > 0 ? (stats.supportUsers / stats.totalUsers) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.supportUsers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Admins</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500" 
                            style={{ width: `${stats.totalUsers > 0 ? (stats.adminUsers / stats.totalUsers) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.adminUsers}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="flex items-center gap-3 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">{ticket.customer?.full_name}</span>
                          <span className="text-muted-foreground"> created ticket: </span>
                          <span className="truncate">{ticket.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Ticket
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Support User
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Auto-assign tickets</Label>
                    <Select defaultValue="disabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="workload">By Workload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Configure notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notify admins on new tickets</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily summary reports</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Update Notifications</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Backup and maintenance tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    System Health Check
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Analytics Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    View Access Logs
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reset System
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;