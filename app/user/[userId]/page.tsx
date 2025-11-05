'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { User, SignalResult, Recommendation } from '@/types';

export default function UserDashboard() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [signals, setSignals] = useState<SignalResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleProcessData = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/process', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Reload user data
        await loadUserData();
        alert(`Processing complete! ${data.data.processed} users processed.`);
      }
    } catch (error) {
      alert('Error processing data');
    } finally {
      setProcessing(false);
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

        {/* Financial Overview - Show metrics WITHOUT persona labels */}
        {signal180d && (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Financial Overview</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
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
                    <p className="text-xs text-muted-foreground">
                      Keeping utilization below 30% is ideal
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Goal: 3-6 months of expenses
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Monthly Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {signal180d.subscriptionSignals.totalRecurringCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${signal180d.subscriptionSignals.monthlyRecurringSpend.toFixed(0)}/month
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {signal180d.subscriptionSignals.subscriptionShare.toFixed(0)}% of spending
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Recommendations - NO PERSONA LABELS */}
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your spending patterns and financial goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  No recommendations available yet. Click below to analyze your financial data.
                </p>
                <Button onClick={handleProcessData} disabled={processing}>
                  {processing ? 'Processing...' : 'Analyze My Finances'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Why this matters to you:</h4>
                        <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                      </div>

                      {rec.educationalContent && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Learn More:</h4>
                          <p className="text-sm text-muted-foreground">{rec.educationalContent}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Action steps you can take:</h4>
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
