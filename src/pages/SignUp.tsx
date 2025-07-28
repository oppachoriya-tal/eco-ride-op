import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, User, Zap, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SignUp = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(phone, password, fullName, role);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to EcoRide Support. You can now sign in.",
      });
      navigate('/auth');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="mobile-container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 gradient-primary rounded-2xl shadow-[var(--shadow-mobile)]">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Join EcoRide
          </h1>
          <p className="text-muted-foreground mt-2">
            Create your support account
          </p>
        </div>

        <Card className="mobile-card">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-xl font-semibold">
              Create Account
            </CardTitle>
            <CardDescription>
              Get started with EcoRide customer support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mobile-input pl-12"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="email"
                    placeholder="Enter your email address"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mobile-input pl-12"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mobile-input pl-12"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="mobile-input pl-12">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="support">Support Agent</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mobile-button w-full gradient-primary border-0 shadow-[var(--shadow-mobile)]" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary-glow"
                  onClick={() => navigate('/auth')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;