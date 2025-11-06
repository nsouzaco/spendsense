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
  const [primaryPersona, setPrimaryPersona] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'accounts' | 'transactions' | 'analytics' | 'cards' | 'education'>('dashboard');

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

      // Load persona
      const personaRes = await fetch(`/api/users/${userId}/personas`);
      const personaData = await personaRes.json();
      if (personaData.success) {
        setPrimaryPersona(personaData.data.primaryPersona);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/users/${userId}/summary`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data.summary) {
        setSummary(data.data.summary);
        console.log('Summary generated successfully!');
      } else {
        throw new Error(data.error?.message || 'Summary generation failed');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Unable to generate summary at this time. Please try again later.');
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

  // Get persona-based education content
  const getEducationContent = () => {
    if (primaryPersona === 'SAVINGS_BUILDER') {
      return [
        {
          icon: '📈',
          bgColor: 'bg-blue-100',
          title: 'Investing for Beginners',
          description: 'Learn how to grow your savings through smart investments. Explore stocks, bonds, ETFs, and building a diversified portfolio.'
        },
        {
          icon: '🏠',
          bgColor: 'bg-green-100',
          title: 'First-Time Home Buyer Guide',
          description: 'Ready to buy a home? Learn about mortgages, down payments, closing costs, and what to expect in the home buying process.'
        },
        {
          icon: '💰',
          bgColor: 'bg-purple-100',
          title: 'Retirement Planning',
          description: 'Maximize your savings for retirement. Understand 401(k)s, IRAs, compound interest, and building long-term wealth.'
        },
        {
          icon: '💳',
          bgColor: 'bg-yellow-100',
          title: 'Smart Credit Card Rewards',
          description: 'Leverage your good financial habits. Learn how to maximize credit card rewards and cashback while avoiding debt.'
        },
      ];
    } else if (primaryPersona === 'HIGH_UTILIZATION') {
      return [
        {
          icon: '🎯',
          bgColor: 'bg-red-100',
          title: 'Debt Payoff Strategies',
          description: 'Learn the avalanche and snowball methods to pay down debt faster. Understand how to prioritize high-interest debt.'
        },
        {
          icon: '💳',
          bgColor: 'bg-orange-100',
          title: 'Credit Score Improvement',
          description: 'Boost your credit score by reducing utilization. Learn what factors affect your score and how to improve it.'
        },
        {
          icon: '🔄',
          bgColor: 'bg-purple-100',
          title: 'Balance Transfer Guide',
          description: 'Save on interest with balance transfers. Learn about 0% APR offers, transfer fees, and consolidation strategies.'
        },
        {
          icon: '💰',
          bgColor: 'bg-blue-100',
          title: 'Budget Creation 101',
          description: 'Take control of your finances. Create a realistic budget that helps you pay down debt while covering essentials.'
        },
      ];
    } else if (primaryPersona === 'VARIABLE_INCOME_BUDGETER') {
      return [
        {
          icon: '📊',
          bgColor: 'bg-yellow-100',
          title: 'Managing Irregular Income',
          description: 'Master budgeting with variable income. Learn about income smoothing, the low-month method, and building financial stability.'
        },
        {
          icon: '💰',
          bgColor: 'bg-green-100',
          title: 'Emergency Fund Building',
          description: 'Build a cushion for lean months. Learn why freelancers and gig workers need larger emergency funds and how to save.'
        },
        {
          icon: '🏦',
          bgColor: 'bg-blue-100',
          title: 'Cash Flow Management',
          description: 'Keep your finances stable through ups and downs. Learn about cash reserves, estimated taxes, and financial planning.'
        },
        {
          icon: '📈',
          bgColor: 'bg-purple-100',
          title: 'Side Income Ideas',
          description: 'Diversify your income streams. Explore passive income, side hustles, and ways to create more financial security.'
        },
      ];
    } else if (primaryPersona === 'SUBSCRIPTION_HEAVY') {
      return [
        {
          icon: '📱',
          bgColor: 'bg-purple-100',
          title: 'Subscription Audit Guide',
          description: 'Take control of recurring charges. Learn how to track, evaluate, and cancel subscriptions you no longer need.'
        },
        {
          icon: '💳',
          bgColor: 'bg-blue-100',
          title: 'Cashback on Subscriptions',
          description: 'Earn rewards on recurring payments. Discover credit cards that offer bonus cashback for streaming and software subscriptions.'
        },
        {
          icon: '💰',
          bgColor: 'bg-green-100',
          title: 'Value vs. Cost Analysis',
          description: 'Evaluate subscription value. Learn how to determine which subscriptions provide real value and which are just costing you money.'
        },
        {
          icon: '🎯',
          bgColor: 'bg-yellow-100',
          title: 'Alternative Solutions',
          description: 'Find cheaper alternatives. Explore free options, family plans, and bundle deals that can reduce your subscription costs.'
        },
      ];
    } else if (primaryPersona === 'LOW_INCOME_STABILIZER') {
      return [
        {
          icon: '💰',
          bgColor: 'bg-green-100',
          title: 'Micro-Saving Strategies',
          description: 'Start building savings with small amounts. Learn about rounding up purchases, the $5 challenge, and automated savings.'
        },
        {
          icon: '🎯',
          bgColor: 'bg-blue-100',
          title: 'Essential Budgeting',
          description: 'Master zero-based budgeting on a tight budget. Learn to prioritize essentials and find areas to cut back without sacrifice.'
        },
        {
          icon: '🛡️',
          bgColor: 'bg-yellow-100',
          title: 'Financial Assistance Resources',
          description: 'Discover programs that can help. Learn about SNAP, utility assistance, earned income tax credit, and community resources.'
        },
        {
          icon: '📈',
          bgColor: 'bg-purple-100',
          title: 'Income Boosting Ideas',
          description: 'Explore ways to increase your income. Learn about side gigs, skills training, and opportunities for career advancement.'
        },
      ];
    }
    
    // Default content if no persona
    return [
      {
        icon: '💰',
        bgColor: 'bg-purple-100',
        title: 'Budgeting Basics',
        description: 'Learn how to create and maintain a budget that works for your lifestyle. Master the 50/30/20 rule and track spending effectively.'
      },
      {
        icon: '💳',
        bgColor: 'bg-green-100',
        title: 'Credit Score Fundamentals',
        description: 'Understand what affects your credit score and how to improve it. Learn about credit utilization, payment history, and credit mix.'
      },
      {
        icon: '📈',
        bgColor: 'bg-blue-100',
        title: 'Investing 101',
        description: 'Get started with investing basics. Learn about different investment types, risk management, and building a diversified portfolio.'
      },
      {
        icon: '🛡️',
        bgColor: 'bg-yellow-100',
        title: 'Emergency Funds',
        description: 'Discover why emergency funds are crucial and how much you should save. Learn strategies to build your safety net quickly.'
      },
    ];
  };

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

              <RecurringSubscriptions signals={signal180d} transactions={transactions} />

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
                <h2 className="text-xl font-semibold text-gray-900">Your Personalized Financial Summary</h2>
                {!summary ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-12 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-gray-900">Get Your AI Financial Summary</h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        {processing 
                          ? 'Generating your personalized financial summary...' 
                          : 'Click below to get a personalized summary of your financial health and recommendations.'
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
                      onClick={handleGenerateSummary} 
                      disabled={processing}
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {processing ? 'Generating... Please wait' : '✨ Generate My Summary'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-8 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Your Financial Snapshot</h3>
                            <p className="text-xs text-gray-500">Powered by AI</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleGenerateSummary} 
                          disabled={processing}
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          {processing ? 'Refreshing...' : '🔄 Refresh'}
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {summary}
                      </div>
                    </div>
                    {recommendations.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
                        <h3 className="text-base font-semibold text-gray-900">Quick Recommendations</h3>
                        <div className="space-y-2">
                          {recommendations.slice(0, 3).map((rec) => (
                            <div key={rec.id} className="flex items-start gap-2 text-sm">
                              <span className="text-purple-600 mt-0.5">→</span>
                              <span className="text-gray-700">{rec.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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

              <RecurringSubscriptions signals={signal180d} transactions={transactions} />
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
                <p className="text-sm text-gray-600 mt-1">
                  {primaryPersona 
                    ? 'Personalized content based on your financial profile' 
                    : 'Learn about personal finance and improve your financial literacy'
                  }
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {getEducationContent().map((item, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.bgColor}`}>
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                    <Button variant="outline" className="w-full">Read More →</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
