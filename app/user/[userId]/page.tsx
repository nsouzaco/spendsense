'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { User, SignalResult, Recommendation, Account, Transaction } from '@/types';

// Import new components
import { AccountCard } from '@/components/user/AccountCard';
import { StatCards } from '@/components/user/StatCards';
import { IncomeExpenseChart } from '@/components/user/IncomeExpenseChart';
import { CategoryBarChart } from '@/components/user/CategoryBarChart';
import { TransactionTable } from '@/components/user/TransactionTable';
import { RecurringSubscriptions } from '@/components/user/RecurringSubscriptions';

export default function UserDashboard() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

      // Load accounts
      const accountsRes = await fetch(`/api/users/${userId}/accounts`);
      const accountsData = await accountsRes.json();
      if (accountsData.success) setAccounts(accountsData.data);

      // Load transactions
      const transactionsRes = await fetch(`/api/users/${userId}/transactions`);
      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) setTransactions(transactionsData.data);

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
            <Button onClick={() => router.push('/')} variant="outline" className="border-white/20 bg-white/10 text-white">
              Back to Home
            </Button>
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
            <h1 className="text-xl font-sans font-semibold tracking-tight text-white">SpendSense</h1>
            <p className="text-sm font-light tracking-tight text-white/60">
              Welcome, {user.firstName} {user.lastName}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            Logout
          </Button>
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
            <Button className="border-yellow-400/20 bg-yellow-400/10 text-yellow-100 hover:bg-yellow-400/20">
              Grant Consent
            </Button>
          </div>
        )}

        {/* Main Dashboard */}
        {signal180d && (
          <>
            <div>
              <h2 className="text-3xl font-extralight tracking-tight text-white mb-2">Dashboard</h2>
              <p className="text-sm font-light tracking-tight text-white/60">Your complete financial overview</p>
            </div>

            {/* Stat Cards */}
            <StatCards signals={signal180d} accounts={accounts} />

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/10 border border-white/10 backdrop-blur-xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="accounts" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                  Accounts
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                  Insights
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <IncomeExpenseChart transactions={transactions} days={30} />
                  <CategoryBarChart transactions={transactions} />
                </div>
                <RecurringSubscriptions signals={signal180d} />
                <TransactionTable transactions={transactions} limit={10} />
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                <TransactionTable transactions={transactions} />
              </TabsContent>

              {/* Accounts Tab */}
              <TabsContent value="accounts" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map(account => (
                    <AccountCard key={account.id} account={account} variant="default" />
                  ))}
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                {recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl text-center space-y-6">
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
                      </div>
                    )}
                    <Button 
                      onClick={handleProcessData} 
                      disabled={processing}
                      variant="outline"
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      {processing ? 'Processing... Please wait' : 'Analyze My Finances'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
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
                          <h4 className="text-sm font-light tracking-tight text-white/70 mb-2">Action steps:</h4>
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
