'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'operator' | ''>('');
  const [userId, setUserId] = useState('user_000000');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!role) {
      alert('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        if (role === 'user') {
          router.push(`/user/${userId}`);
        } else {
          router.push('/operator');
        }
      } else {
        alert(data.error?.message || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">SpendSense</CardTitle>
          <CardDescription>Financial Education Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">End User</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'user' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID (Demo)</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={`user_${String(i).padStart(6, '0')}`}>
                      user_{String(i).padStart(6, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={loading || !role}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            This is a demo application with synthetic data for educational purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
