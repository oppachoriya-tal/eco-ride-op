import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/components/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  knowledgeBaseUsed?: boolean;
  relevantArticles?: Array<{ title: string; category: string }>;
}

interface QuickAction {
  label: string;
  message: string;
  icon: React.ReactNode;
  category: string;
}

export const ChatSupport = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const quickActions: QuickAction[] = [
    {
      label: "Battery not charging",
      message: "My scooter battery is not charging properly. What should I do?",
      icon: <AlertCircle className="h-4 w-4" />,
      category: "battery"
    },
    {
      label: "Scooter won't start",
      message: "My scooter won't turn on or start. How can I fix this?",
      icon: <RefreshCw className="h-4 w-4" />,
      category: "troubleshooting"
    },
    {
      label: "Safety guidelines",
      message: "What are the important safety guidelines for riding my scooter?",
      icon: <CheckCircle className="h-4 w-4" />,
      category: "safety"
    },
    {
      label: "Maintenance tips",
      message: "What daily maintenance should I perform on my scooter?",
      icon: <BookOpen className="h-4 w-4" />,
      category: "maintenance"
    },
    {
      label: "App connectivity",
      message: "How do I connect my scooter to the mobile app?",
      icon: <MessageCircle className="h-4 w-4" />,
      category: "app"
    },
    {
      label: "Range and speed",
      message: "What's the typical range and speed of my scooter?",
      icon: <Lightbulb className="h-4 w-4" />,
      category: "performance"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi there! 👋 I'm your EcoRide AI assistant. I'm here to help you with any questions about your scooter - from troubleshooting and maintenance to safety guidelines and app features.

Feel free to ask me anything or choose from the quick actions below to get started!`,
        timestamp: new Date(),
        knowledgeBaseUsed: false
      }
    ]);
  }, []);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !profile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch(
        `https://rjjkbqsptwtneovtbtqm.supabase.co/functions/v1/ai-chat-support`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            message: messageContent,
            userId: profile.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        knowledgeBaseUsed: data.knowledgeBaseUsed,
        relevantArticles: data.relevantArticles
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.knowledgeBaseUsed) {
        toast({
          title: "Knowledge Base Used",
          description: "Response generated using our scooter knowledge base",
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or you can create a support ticket for direct assistance from our team.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to reach support system. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          EcoRide AI Support
          <Badge variant="secondary" className="ml-auto">
            <Bot className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString()}
                    {message.knowledgeBaseUsed && (
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        KB
                      </Badge>
                    )}
                  </div>
                  
                  {message.relevantArticles && message.relevantArticles.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">
                        Related articles:
                      </div>
                      <div className="space-y-1">
                        {message.relevantArticles.map((article, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {article.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {showQuickActions && (
          <div className="p-4 border-t bg-muted/30">
            <div className="text-sm font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="justify-start text-left h-auto p-2"
                >
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your EcoRide scooter..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Powered by EcoRide Knowledge Base • For complex issues, create a support ticket
          </div>
        </div>
      </CardContent>
    </Card>
  );
};