'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState('user_000000');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (type: 'user' | 'operator') => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: type === 'user' ? selectedUserId : 'operator',
          role: type,
        }),
      });

      if (response.ok) {
        if (type === 'operator') {
          router.push('/operator');
        } else {
          router.push(`/user/${selectedUserId}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">SpendSense</CardTitle>
          <CardDescription>Choose your login type to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">End User</TabsTrigger>
              <TabsTrigger value="operator">Operator</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="user_000000"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Try: user_000000 through user_000074
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleLogin('user')}
                disabled={loading || !selectedUserId}
              >
                {loading ? 'Logging in...' : 'Login as User'}
              </Button>
            </TabsContent>

            <TabsContent value="operator" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access the operator dashboard to view system metrics, manage users, and monitor
                recommendations.
              </p>
              <Button
                className="w-full"
                onClick={() => handleLogin('operator')}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Operator'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

