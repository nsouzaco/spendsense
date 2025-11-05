'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
      <div className="relative min-h-screen w-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white/80 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-light tracking-tight text-white/60">Loading your financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen w-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl max-w-md w-full text-center space-y-6">
            <h2 className="text-2xl font-extralight tracking-tight text-white">User Not Found</h2>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const signal180d = signals.find(s => s.window === '180d');

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extralight tracking-tight text-white">SpendSense</h1>
            <p className="text-sm font-light tracking-tight text-white/60">
              Welcome, {user.firstName} {user.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-light tracking-tight text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 space-y-6">
        {/* Consent Status */}
        {!user.consentStatus.active && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-light tracking-tight text-yellow-200 mb-2">Consent Required</h3>
            <p className="text-sm font-light tracking-tight text-yellow-100/70 mb-4">
              Grant consent to receive personalized financial recommendations
            </p>
            <button className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-2 text-sm font-light tracking-tight text-yellow-100 backdrop-blur-sm transition-colors hover:bg-yellow-400/20">
              Grant Consent
            </button>
          </div>
        )}

        {/* Financial Overview - Show metrics WITHOUT persona labels */}
        {signal180d && (
          <>
            <div>
              <h2 className="text-3xl font-extralight tracking-tight text-white mb-4">Your Financial Overview</h2>
              <p className="text-sm font-light tracking-tight text-white/60">Real-time insights from your spending patterns</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-4">Credit Utilization</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-extralight tracking-tight text-white">
                      {Math.round(signal180d.creditSignals.highestUtilization * 100)}%
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-light tracking-tight ${
                      signal180d.creditSignals.highestUtilization > 0.5 
                        ? 'bg-red-500/20 text-red-200 border border-red-500/30' 
                        : signal180d.creditSignals.highestUtilization > 0.3 
                        ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' 
                        : 'bg-green-500/20 text-green-200 border border-green-500/30'
                    }`}>
                      {signal180d.creditSignals.highestUtilization > 0.5 ? 'High' : 
                       signal180d.creditSignals.highestUtilization > 0.3 ? 'Medium' : 'Good'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
                      style={{ width: `${signal180d.creditSignals.highestUtilization * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-light tracking-tight text-white/50">
                    Keeping utilization below 30% is ideal
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-4">Emergency Fund</h3>
                <div className="space-y-2">
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {signal180d.savingsSignals.emergencyFundCoverage.toFixed(1)} months
                  </p>
                  <p className="text-sm font-light tracking-tight text-white/60">
                    ${signal180d.savingsSignals.currentSavingsBalance.toFixed(0)} saved
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/50">
                    Goal: 3-6 months of expenses
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-4">Monthly Subscriptions</h3>
                <div className="space-y-2">
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {signal180d.subscriptionSignals.totalRecurringCount}
                  </p>
                  <p className="text-sm font-light tracking-tight text-white/60">
                    ${signal180d.subscriptionSignals.monthlyRecurringSpend.toFixed(0)}/month
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/50">
                    {signal180d.subscriptionSignals.subscriptionShare.toFixed(0)}% of spending
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recommendations - NO PERSONA LABELS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-extralight tracking-tight text-white">Your Personalized Recommendations</h2>
            <p className="mt-2 text-sm font-light tracking-tight text-white/60">
              Based on your spending patterns and financial goals
            </p>
          </div>
          
          {recommendations.length === 0 ? (
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-light tracking-tight text-white/70">
                {processing 
                  ? 'Analyzing your financial data with AI... This may take a few minutes.' 
                  : 'No recommendations available yet. Click below to analyze your financial data.'
                }
              </p>
              {processing && (
                <div className="mx-auto w-64">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-purple-500 to-purple-300 animate-pulse" />
                  </div>
                  <p className="text-xs font-light tracking-tight text-white/50 mt-3">
                    Generating personalized recommendations...
                  </p>
                </div>
              )}
              <button 
                onClick={handleProcessData} 
                disabled={processing}
                className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing... Please wait' : 'Analyze My Finances'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-light tracking-tight text-white mb-2">{rec.title}</h3>
                    <p className="text-sm font-light tracking-tight text-white/60">{rec.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-light tracking-tight text-white/70 mb-2">Why this matters to you:</h4>
                    <p className="text-sm font-light tracking-tight text-white/60">{rec.rationale}</p>
                  </div>

                  {rec.educationalContent && (
                    <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
                      <h4 className="text-sm font-light tracking-tight text-blue-200 mb-2">Learn More:</h4>
                      <p className="text-sm font-light tracking-tight text-blue-100/70">{rec.educationalContent}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-light tracking-tight text-white/70 mb-2">Action steps you can take:</h4>
                    <ul className="space-y-2">
                      {rec.actionItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm font-light tracking-tight text-white/60">
                          <span className="text-purple-400 mt-1">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs font-light tracking-tight text-white/40 italic">
                      {rec.disclaimer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
