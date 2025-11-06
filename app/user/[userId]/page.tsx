'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { User, SignalResult, Recommendation, Account, Transaction } from '@/types';

// Import new components
import { Sidebar } from '@/components/user/Sidebar';
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
      if (signalsData.success) {
        setSignals(signalsData.data || []);
      } else {
        // Signals not found yet - that's okay, we'll show a message
        setSignals([]);
      }

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
      const res = await fetch('/api/process', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        await loadUserData();
        // Show success without alert
        console.log(`Processing complete! ${data.data.processed} users processed.`);
      } else {
        throw new Error(data.error?.message || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing data:', error);
      // Don't show alert, just log the error
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
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-light tracking-tight text-gray-600">Loading your financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-light tracking-tight text-gray-900">User Not Found</h2>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const signal180d = signals.find(s => s.window === '180d');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        userId={userId} 
        userName={`${user.firstName} ${user.lastName}`} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.firstName}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Here's what's happening with your finances today.
              </p>
            </div>
          </div>
        </header>

        <div className="px-8 py-6 space-y-6">
          {/* Consent Status */}
          {!user.consentStatus.active && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">Consent Required</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Grant consent to receive personalized financial recommendations
              </p>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Grant Consent
              </Button>
            </div>
          )}

          {/* Stat Cards - Always show */}
          <StatCards signals={signal180d} accounts={accounts} transactions={transactions} />

          {/* Charts Section */}
          <div id="analytics-section" className="grid gap-6 lg:grid-cols-2 scroll-mt-6">
            <IncomeExpenseChart transactions={transactions} days={30} />
            <CategoryBarChart transactions={transactions} />
          </div>

          {/* Recurring Subscriptions */}
          {signal180d && <RecurringSubscriptions signals={signal180d} />}

          {/* Accounts Section */}
          <div id="accounts-section" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Accounts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map(account => (
                <AccountCard key={account.id} account={account} variant="default" />
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div id="transactions-section" className="scroll-mt-6">
            <TransactionTable transactions={transactions} limit={10} />
          </div>

          {/* AI Insights Section */}
          <div id="insights-section" className="space-y-4 scroll-mt-6">
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
            {recommendations.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-900">Get Personalized Insights</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {processing 
                      ? 'Analyzing your financial data with AI... This may take a few minutes.' 
                      : 'Click below to analyze your spending patterns and get AI-powered recommendations tailored to your financial behavior.'
                    }
                  </p>
                </div>
                {processing && (
                  <div className="mx-auto w-64">
                    <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 animate-pulse" />
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleProcessData} 
                  disabled={processing}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {processing ? 'Processing... Please wait' : '💡 Generate Insights'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Why this matters to you:</h4>
                      <p className="text-sm text-gray-600">{rec.rationale}</p>
                    </div>

                    {rec.educationalContent && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Learn More:</h4>
                        <p className="text-sm text-blue-800">{rec.educationalContent}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Action steps:</h4>
                      <ul className="space-y-2">
                        {rec.actionItems.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-gray-600">
                            <span className="text-purple-600 mt-1">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
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
    </div>
  );
}
