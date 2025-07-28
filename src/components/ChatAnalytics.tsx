import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Bot, 
  Clock,
  RefreshCw,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface ChatConversation {
  id: string;
  user_id: string;
  message: string;
  response: string;
  knowledge_base_used: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ChatStats {
  totalConversations: number;
  knowledgeBaseUsage: number;
  uniqueUsers: number;
  averageResponseTime: string;
}

export const ChatAnalytics = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    knowledgeBaseUsage: 0,
    uniqueUsers: 0,
    averageResponseTime: '< 1s'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChatData = async () => {
    try {
      setLoading(true);

      // Fetch conversations with user profiles
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          profiles:user_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationsError) {
        throw conversationsError;
      }

      setConversations(conversationsData || []);

      // Calculate statistics
      if (conversationsData) {
        const totalConversations = conversationsData.length;
        const knowledgeBaseUsage = conversationsData.filter(c => c.knowledge_base_used).length;
        const uniqueUsers = new Set(conversationsData.map(c => c.user_id)).size;

        setStats({
          totalConversations,
          knowledgeBaseUsage,
          uniqueUsers,
          averageResponseTime: '< 1s' // Since we're using rule-based responses
        });
      }

    } catch (error) {
      console.error('Error fetching chat data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chat analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Chat Analytics
          </h2>
          <p className="text-muted-foreground">Monitor AI chat support performance</p>
        </div>
        <Button variant="outline" onClick={fetchChatData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Chat interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base Usage</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.knowledgeBaseUsage}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalConversations > 0 ? 
                `${Math.round((stats.knowledgeBaseUsage / stats.totalConversations) * 100)}% usage rate` : 
                'No data'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active chat users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Near instant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {conversation.profiles?.full_name || 'Unknown User'}
                      </Badge>
                      {conversation.knowledge_base_used && (
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          KB Used
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conversation.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs font-medium">User</span>
                      </div>
                      <p className="text-sm">{conversation.message}</p>
                    </div>
                    
                    <div className="bg-primary/5 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                      <p className="text-sm">{conversation.response}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chat conversations yet</p>
                  <p className="text-sm">Conversations will appear here once users start chatting</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};