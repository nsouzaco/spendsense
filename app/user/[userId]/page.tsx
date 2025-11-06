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
        activeView={activeView}
        onViewChange={setActiveView}
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
          {!user.consentStatus.active && activeView === 'dashboard' && (
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

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              <StatCards signals={signal180d} accounts={accounts} transactions={transactions} />
              
              <div className="grid gap-6 lg:grid-cols-2">
                <IncomeExpenseChart transactions={transactions} days={30} />
                <CategoryBarChart transactions={transactions} />
              </div>

              {signal180d && <RecurringSubscriptions signals={signal180d} />}

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Quick Overview</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Transactions</h3>
                    <p className="text-sm text-gray-600 mb-4">{transactions.length} total transactions</p>
                    <Button onClick={() => setActiveView('transactions')} variant="outline">
                      View All →
                    </Button>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Accounts</h3>
                    <p className="text-sm text-gray-600 mb-4">{accounts.length} connected accounts</p>
                    <Button onClick={() => setActiveView('accounts')} variant="outline">
                      Manage Accounts →
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
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
                          : 'Click below to analyze your spending patterns and get AI-powered recommendations.'
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
                    {recommendations.slice(0, 2).map((rec) => (
                      <div key={rec.id} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                    {recommendations.length > 2 && (
                      <p className="text-sm text-gray-600 text-center">
                        And {recommendations.length - 2} more insights...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Accounts View */}
          {activeView === 'accounts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Your Accounts</h2>
                <p className="text-sm text-gray-600 mt-1">Manage all your connected financial accounts</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map(account => (
                  <AccountCard key={account.id} account={account} variant="default" />
                ))}
              </div>
            </div>
          )}

          {/* Transactions View */}
          {activeView === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">All Transactions</h2>
                <p className="text-sm text-gray-600 mt-1">View and search through all your transactions</p>
              </div>
              <TransactionTable transactions={transactions} />
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Financial Analytics</h2>
                <p className="text-sm text-gray-600 mt-1">Detailed insights into your spending patterns</p>
              </div>
              
              <StatCards signals={signal180d} accounts={accounts} transactions={transactions} />
              
              <div className="grid gap-6 lg:grid-cols-2">
                <IncomeExpenseChart transactions={transactions} days={30} />
                <CategoryBarChart transactions={transactions} />
              </div>

              {signal180d && <RecurringSubscriptions signals={signal180d} />}
            </div>
          )}

          {/* Cards View */}
          {activeView === 'cards' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Credit Cards</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your credit cards and track utilization</p>
              </div>
              
              {/* Credit utilization overview */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {accounts.filter(a => a.type === 'credit').map(account => (
                  <AccountCard key={account.id} account={account} variant="default" />
                ))}
              </div>

              {accounts.filter(a => a.type === 'credit').length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-600">No credit cards connected</p>
                </div>
              )}
            </div>
          )}

          {/* Education View */}
          {activeView === 'education' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Financial Education</h2>
                <p className="text-sm text-gray-600 mt-1">Learn about personal finance and improve your financial literacy</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Budgeting Basics</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Learn how to create and maintain a budget that works for your lifestyle. Master the 50/30/20 rule and track your spending effectively.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <span className="text-2xl">💳</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Credit Score Management</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Understand what affects your credit score and how to improve it. Learn about credit utilization, payment history, and credit mix.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Investing 101</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get started with investing basics. Learn about different investment types, risk management, and building a diversified portfolio.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Funds</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Discover why emergency funds are crucial and how much you should save. Learn strategies to build your safety net quickly.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Home Buying Guide</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Navigate the home buying process with confidence. Learn about mortgages, down payments, and what to expect during closing.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Debt Management</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Learn effective strategies to pay down debt. Understand debt consolidation, the snowball vs avalanche methods, and staying debt-free.
                  </p>
                  <Button variant="outline" className="w-full">Read More →</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
