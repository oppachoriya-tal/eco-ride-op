import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Package, LogOut, FileText, HelpCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      text: 'Hello! How can I help you with your electric scooter today?',
      timestamp: new Date(),
    }
  ]);

  const commonQuestions = [
    { id: 1, question: 'How do I charge my scooter?', category: 'charging' },
    { id: 2, question: 'What is the maximum speed?', category: 'specifications' },
    { id: 3, question: 'How do I fold my scooter?', category: 'usage' },
    { id: 4, question: 'Battery not charging properly', category: 'troubleshooting' },
    { id: 5, question: 'Check my order status', category: 'orders' },
  ];

  const handleSendMessage = () => {
    if (!question.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: question,
      timestamp: new Date(),
    };

    const response = {
      id: messages.length + 2,
      type: 'system',
      text: 'Thank you for your question. Let me help you with that...',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage, response]);
    setQuestion('');
  };

  const handleQuestionClick = (questionText: string) => {
    setQuestion(questionText);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">EScooter Support</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.email || 'Customer'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Support Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 h-96 overflow-y-auto mb-4 p-4 bg-muted/20 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSendMessage} className="flex-1">
                    Send Message
                  </Button>
                  <Button variant="outline" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Quick Questions
              </CardTitle>
              <CardDescription>
                Click on a question to get instant help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {commonQuestions.map((q) => (
                <Button
                  key={q.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => handleQuestionClick(q.question)}
                >
                  <div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <Badge variant="secondary" className="mt-1">
                      {q.category}
                    </Badge>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* My Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                My Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">EcoRide Pro</p>
                    <p className="text-xs text-muted-foreground">#ESC-2024-001</p>
                  </div>
                  <Badge variant="default">Shipped</Badge>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Expected: Jan 25, 2024
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">EcoRide Lite</p>
                    <p className="text-xs text-muted-foreground">#ESC-2024-002</p>
                  </div>
                  <Badge variant="secondary">Processing</Badge>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Expected: Jan 30, 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;