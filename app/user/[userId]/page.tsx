'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User, SignalResult, PersonaAssignment, Recommendation } from '@/types';

export default function UserDashboard() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [signals, setSignals] = useState<SignalResult[]>([]);
  const [personas, setPersonas] = useState<PersonaAssignment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // Load user
      const userRes = await fetch(`/api/users/${userId}`);
      const userData = await userRes.json();
      if (userData.success) setUser(userData.data);

      // Load signals
      const signalsRes = await fetch(`/api/users/${userId}/signals`);
      const signalsData = await signalsRes.json();
      if (signalsData.success) setSignals(signalsData.data);

      // Load recommendations
      const recsRes = await fetch(`/api/users/${userId}/recommendations`);
      const recsData = await recsRes.json();
      if (recsData.success) setRecommendations(recsData.data);

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signal180d = signals.find(s => s.window === '180d');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SpendSense</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user.firstName} {user.lastName}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Consent Status */}
        {!user.consentStatus.active && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>Consent Required</CardTitle>
              <CardDescription>
                Grant consent to receive personalized financial recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Grant Consent</Button>
            </CardContent>
          </Card>
        )}

        {/* Financial Overview */}
        {signal180d && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round(signal180d.creditSignals.highestUtilization * 100)}%
                    </span>
                    <Badge variant={
                      signal180d.creditSignals.highestUtilization > 0.5 ? 'destructive' : 
                      signal180d.creditSignals.highestUtilization > 0.3 ? 'default' : 
                      'secondary'
                    }>
                      {signal180d.creditSignals.highestUtilization > 0.5 ? 'High' : 
                       signal180d.creditSignals.highestUtilization > 0.3 ? 'Medium' : 'Good'}
                    </Badge>
                  </div>
                  <Progress value={signal180d.creditSignals.highestUtilization * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">
                    {signal180d.savingsSignals.emergencyFundCoverage.toFixed(1)} months
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${signal180d.savingsSignals.currentSavingsBalance.toFixed(0)} saved
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">
                    {signal180d.subscriptionSignals.totalRecurringCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${signal180d.subscriptionSignals.monthlyRecurringSpend.toFixed(0)}/mo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your spending patterns and financial goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recommendations available. Please ensure you've granted consent and your data has been processed.
              </p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <Badge variant="outline" className="mt-2">
                            {rec.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Why this matters:</h4>
                        <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Action steps:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {rec.actionItems.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground italic">
                          {rec.disclaimer}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

