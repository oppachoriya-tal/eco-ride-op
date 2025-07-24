import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Package, 
  LogOut, 
  FileText, 
  HelpCircle, 
  Send, 
  Paperclip,
  Zap,
  ThumbsDown,
  Plus
} from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'system';
  text: string;
  timestamp: Date;
  fileUrl?: string;
  showFeedback?: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'system',
      text: 'Hello! I\'m your EcoRide assistant. How can I help you with your electric scooter today?',
      timestamp: new Date(),
      showFeedback: false,
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonQuestions = [
    { id: 1, question: 'How do I charge my scooter?', category: 'charging', answer: 'Connect the charger to your scooter and plug it into a wall outlet. The LED indicator will turn green when fully charged (typically 4-6 hours).' },
    { id: 2, question: 'What is the maximum speed?', category: 'specs', answer: 'Our EcoRide scooters can reach up to 25 km/h depending on the model, rider weight, and road conditions.' },
    { id: 3, question: 'How do I fold my scooter?', category: 'usage', answer: 'Lift the folding lever near the handlebars and gently fold the stem down towards the deck until it clicks into place.' },
    { id: 4, question: 'Battery troubleshooting', category: 'support', answer: 'If your battery isn\'t charging: 1) Check connections 2) Ensure charger LED is working 3) Try a different outlet 4) Contact support if issues persist.' },
    { id: 5, question: 'Check my order status', category: 'orders', answer: 'You can view your order status in the "My Orders" section. For detailed tracking, please provide your order number.' },
    { id: 6, question: 'Scooter won\'t start', category: 'support', answer: 'Make sure: 1) Battery is charged 2) Power button is held for 3 seconds 3) Check if kickstand is up 4) Ensure you\'re on the deck properly.' }
  ];

  const mockOrders = [
    {
      id: 1,
      model: 'EcoRide Pro',
      orderNumber: '#ESC-2024-001',
      status: 'Shipped',
      expectedDate: 'Jan 25, 2024',
      statusColor: 'default' as const
    },
    {
      id: 2,
      model: 'EcoRide Lite',
      orderNumber: '#ESC-2024-002', 
      status: 'Processing',
      expectedDate: 'Jan 30, 2024',
      statusColor: 'secondary' as const
    }
  ];

  const handleSendMessage = () => {
    if (!question.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: question,
      timestamp: new Date(),
    };

    // Simple AI response logic
    let responseText = "Thank you for your question. Let me help you with that...";
    
    // Check if question matches any common questions
    const matchedQuestion = commonQuestions.find(q => 
      question.toLowerCase().includes(q.question.toLowerCase().split(' ')[0]) ||
      question.toLowerCase().includes(q.category)
    );
    
    if (matchedQuestion) {
      responseText = matchedQuestion.answer;
    }

    const systemResponse: Message = {
      id: Date.now() + 1,
      type: 'system',
      text: responseText,
      timestamp: new Date(),
      showFeedback: true,
    };

    setMessages(prev => [...prev, newUserMessage, systemResponse]);
    setQuestion('');
  };

  const handleQuestionClick = (questionObj: typeof commonQuestions[0]) => {
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: questionObj.question,
      timestamp: new Date(),
    };

    const systemResponse: Message = {
      id: Date.now() + 1,
      type: 'system',
      text: questionObj.answer,
      timestamp: new Date(),
      showFeedback: true,
    };

    setMessages(prev => [...prev, userMessage, systemResponse]);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached to your message.`,
      });
    }
  };

  const handleNotSatisfied = (messageId: number) => {
    toast({
      title: "Feedback received",
      description: "Your query has been submitted to our support team for review.",
    });
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, showFeedback: false } : msg
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
        <div className="mobile-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-[var(--shadow-mobile)]">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">EcoRide Support</h1>
                <p className="text-xs text-muted-foreground">
                  {user?.email?.split('@')[0] || 'Customer'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} size="sm" className="rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mobile-container py-6 space-y-6">
        {/* Quick Questions - Mobile First */}
        <Card className="mobile-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              Quick Help
            </CardTitle>
            <CardDescription className="text-sm">
              Tap a question for instant help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {commonQuestions.slice(0, 4).map((q) => (
                <Button
                  key={q.id}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left rounded-xl border-border/50 hover:border-primary/50"
                  onClick={() => handleQuestionClick(q)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.question}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {q.category}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Section */}
        <Card className="mobile-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <MessageCircle className="h-5 w-5 mr-2 text-primary" />
              Chat Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-80 rounded-xl bg-muted/20 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'gradient-primary text-primary-foreground shadow-[var(--shadow-mobile)]'
                            : 'bg-card border border-border/50 shadow-[var(--shadow-card)]'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 opacity-70`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Feedback for system messages */}
                    {message.type === 'system' && message.showFeedback && (
                      <div className="flex justify-start mt-2">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">Was this helpful?</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => handleNotSatisfied(message.id)}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Not satisfied
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ask your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-16 rounded-xl border-border/50 resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  className="flex-1 mobile-button gradient-primary border-0 shadow-[var(--shadow-mobile)]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="mobile-button border-border/50"
                  onClick={handleFileUpload}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Orders */}
        <Card className="mobile-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Package className="h-5 w-5 mr-2 text-primary" />
              My Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrders.map((order) => (
              <div key={order.id} className="p-4 border border-border/50 rounded-xl bg-card/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{order.model}</p>
                    <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
                  </div>
                  <Badge variant={order.statusColor} className="rounded-lg">
                    {order.status}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Expected: {order.expectedDate}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Dashboard;