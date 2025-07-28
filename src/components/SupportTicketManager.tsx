import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, MessageSquare } from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customer_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string } | null;
}

export const SupportTicketManager = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    customer_id: "",
    priority: "medium",
    category: "general",
    status: "open"
  });
  const { toast } = useToast();

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        profiles:customer_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching tickets", description: error.message, variant: "destructive" });
    } else {
      setTickets(data || []);
    }
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("role", "admin");

    if (error) {
      toast({ title: "Error fetching profiles", description: error.message, variant: "destructive" });
    } else {
      setProfiles(data || []);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProfiles();
  }, []);

  const createTicket = async () => {
    const { error } = await supabase
      .from("support_tickets")
      .insert([newTicket]);

    if (error) {
      toast({ title: "Error creating ticket", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket created successfully" });
      setIsCreateOpen(false);
      setNewTicket({
        title: "",
        description: "",
        customer_id: "",
        priority: "medium",
        category: "general",
        status: "open"
      });
      fetchTickets();
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId);

    if (error) {
      toast({ title: "Error updating ticket", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket updated successfully" });
      fetchTickets();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500";
      case "in_progress": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Support Tickets</h2>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={newTicket.customer_id} onValueChange={(value) => setNewTicket({...newTicket, customer_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="scooter_issue">Scooter Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  rows={3}
                />
              </div>
              <Button onClick={createTicket} disabled={!newTicket.title || !newTicket.customer_id}>
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customer: {ticket.profiles?.full_name || "Unknown"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{ticket.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline">{ticket.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
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
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Messages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};