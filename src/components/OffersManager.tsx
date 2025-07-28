import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Calendar, Percent } from "lucide-react";

export const OffersManager = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    discount_percentage: "",
    discount_amount: "",
    code: "",
    valid_until: "",
    max_uses: "",
    is_active: true
  });
  const { toast } = useToast();

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching offers", description: error.message, variant: "destructive" });
    } else {
      setOffers(data || []);
    }
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  useEffect(() => {
    fetchOffers();
    getCurrentUser();
  }, []);

  const createOffer = async () => {
    if (!currentUser) return;

    const offerData = {
      ...newOffer,
      discount_percentage: newOffer.discount_percentage ? parseInt(newOffer.discount_percentage) : null,
      discount_amount: newOffer.discount_amount ? parseFloat(newOffer.discount_amount) : null,
      max_uses: newOffer.max_uses ? parseInt(newOffer.max_uses) : null,
      created_by: currentUser.id,
      valid_until: new Date(newOffer.valid_until).toISOString()
    };

    const { error } = await supabase
      .from("offers")
      .insert([offerData]);

    if (error) {
      toast({ title: "Error creating offer", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Offer created successfully" });
      setIsCreateOpen(false);
      setNewOffer({
        title: "",
        description: "",
        discount_percentage: "",
        discount_amount: "",
        code: "",
        valid_until: "",
        max_uses: "",
        is_active: true
      });
      fetchOffers();
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("offers")
      .update({ is_active: !currentStatus })
      .eq("id", offerId);

    if (error) {
      toast({ title: "Error updating offer", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Offer updated successfully" });
      fetchOffers();
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewOffer({...newOffer, code});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Offers & Promotions</h2>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({...newOffer, discount_percentage: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_amount">Discount Amount ($)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    value={newOffer.discount_amount}
                    onChange={(e) => setNewOffer({...newOffer, discount_amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={newOffer.code}
                      onChange={(e) => setNewOffer({...newOffer, code: e.target.value})}
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_uses">Max Uses</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={newOffer.max_uses}
                    onChange={(e) => setNewOffer({...newOffer, max_uses: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={newOffer.valid_until}
                  onChange={(e) => setNewOffer({...newOffer, valid_until: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newOffer.is_active}
                  onCheckedChange={(checked) => setNewOffer({...newOffer, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button 
                onClick={createOffer} 
                disabled={!newOffer.title || !newOffer.description || !newOffer.valid_until}
              >
                Create Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                </div>
                <div className="flex gap-2">
                  {offer.discount_percentage && (
                    <Badge variant="secondary">
                      <Percent className="h-3 w-3 mr-1" />
                      {offer.discount_percentage}%
                    </Badge>
                  )}
                  {offer.discount_amount && (
                    <Badge variant="secondary">
                      ${offer.discount_amount}
                    </Badge>
                  )}
                  <Badge className={offer.is_active ? "bg-green-500" : "bg-gray-500"}>
                    {offer.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {isExpired(offer.valid_until) && (
                    <Badge className="bg-red-500">Expired</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {offer.code && (
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {offer.code}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Until: {new Date(offer.valid_until).toLocaleDateString()}
                  </span>
                  {offer.max_uses && (
                    <span>
                      Uses: {offer.current_uses || 0}/{offer.max_uses}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={offer.is_active}
                    onCheckedChange={() => toggleOfferStatus(offer.id, offer.is_active)}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};