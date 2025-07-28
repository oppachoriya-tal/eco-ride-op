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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Book, Search, Tag } from "lucide-react";

export const KnowledgeBaseManager = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
    is_published: false
  });
  const { toast } = useToast();

  const categories = [
    "general",
    "scooter_models",
    "maintenance",
    "safety",
    "troubleshooting",
    "battery",
    "charging",
    "regulations",
    "accessories"
  ];

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching articles", description: error.message, variant: "destructive" });
    } else {
      setArticles(data || []);
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
    fetchArticles();
    getCurrentUser();
    
    // Add sample knowledge base articles
    const addSampleArticles = async () => {
      if (!currentUser) return;
      
      const sampleArticles = [
        {
          title: "How to Check Battery Status",
          content: "To check your scooter's battery status:\n1. Turn on your scooter\n2. Check the LED indicator on the dashboard\n3. Green lights indicate full charge\n4. Red lights indicate low battery\n5. If no lights appear, the battery may be completely drained",
          category: "battery",
          tags: ["battery", "status", "indicator", "LED"],
          is_published: true,
          created_by: currentUser.id
        },
        {
          title: "Proper Charging Procedures",
          content: "Follow these steps for optimal battery charging:\n1. Use only the provided charger\n2. Plug into a dry, well-ventilated area\n3. Charging time is typically 3-4 hours\n4. Unplug when fully charged\n5. Avoid overcharging to extend battery life",
          category: "charging",
          tags: ["charging", "battery", "maintenance", "safety"],
          is_published: true,
          created_by: currentUser.id
        },
        {
          title: "Scooter Won't Start - Troubleshooting",
          content: "If your scooter won't start, try these steps:\n1. Check if the power button is pressed and held\n2. Ensure the kickstand is up\n3. Verify the battery is charged\n4. Check for any error codes on display\n5. Inspect the brake levers - they should be released\n6. Contact support if issues persist",
          category: "troubleshooting",
          tags: ["troubleshooting", "start", "power", "kickstand"],
          is_published: true,
          created_by: currentUser.id
        },
        {
          title: "Daily Maintenance Checklist",
          content: "Perform these checks before each ride:\n1. Tire pressure and condition\n2. Brake function test\n3. Battery charge level\n4. Lights and signals working\n5. Steering and folding mechanism\n6. Clean any debris from wheels",
          category: "maintenance",
          tags: ["maintenance", "daily", "checklist", "safety"],
          is_published: true,
          created_by: currentUser.id
        },
        {
          title: "Safety Equipment and Guidelines",
          content: "Essential safety guidelines:\n1. Always wear a helmet\n2. Use reflective clothing in low light\n3. Follow local traffic laws\n4. Stay in bike lanes when available\n5. Avoid riding in rain or wet conditions\n6. Regular safety equipment inspection",
          category: "safety",
          tags: ["safety", "helmet", "traffic", "visibility"],
          is_published: true,
          created_by: currentUser.id
        }
      ];

      // Check if articles already exist to avoid duplicates
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("title")
        .in("title", sampleArticles.map(a => a.title));

      if (!existing || existing.length === 0) {
        await supabase.from("knowledge_base").insert(sampleArticles);
        fetchArticles();
      }
    };

    if (currentUser) {
      addSampleArticles();
    }
  }, [currentUser]);

  const createArticle = async () => {
    if (!currentUser) return;

    const articleData = {
      ...newArticle,
      tags: newArticle.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      created_by: currentUser.id
    };

    const { error } = await supabase
      .from("knowledge_base")
      .insert([articleData]);

    if (error) {
      toast({ title: "Error creating article", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article created successfully" });
      setIsCreateOpen(false);
      setNewArticle({
        title: "",
        content: "",
        category: "general",
        tags: "",
        is_published: false
      });
      fetchArticles();
    }
  };

  const togglePublishStatus = async (articleId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("knowledge_base")
      .update({ is_published: !currentStatus })
      .eq("id", articleId);

    if (error) {
      toast({ title: "Error updating article", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article updated successfully" });
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Knowledge Base Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newArticle.category} onValueChange={(value) => setNewArticle({...newArticle, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                  placeholder="battery, maintenance, safety"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                  rows={10}
                  placeholder="Enter the article content here..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={newArticle.is_published}
                  onCheckedChange={(checked) => setNewArticle({...newArticle, is_published: checked})}
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
              <Button 
                onClick={createArticle} 
                disabled={!newArticle.title || !newArticle.content}
              >
                Create Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace("_", " ").toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {article.category.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className={article.is_published ? "bg-green-500" : "bg-gray-500"}>
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={article.is_published}
                    onCheckedChange={() => togglePublishStatus(article.id, article.is_published)}
                  />
                  <Label>Published</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {article.content}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {article.tags && article.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};