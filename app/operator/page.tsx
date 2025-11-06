'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User, SystemMetrics } from '@/types';

export default function OperatorDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load users
      const usersRes = await fetch('/api/operator/users');
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.data);

      // Load metrics
      const metricsRes = await fetch('/api/operator/metrics');
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setMetrics(metricsData.data);
        
        // If no personas exist, automatically analyze all users
        if (metricsData.data.usersWithPersona === 0 && metricsData.data.totalUsers > 0) {
          console.log('🔍 No personas found, automatically analyzing all users...');
          setAnalyzing(true);
          
          try {
            const analyzeRes = await fetch('/api/operator/analyze-all', { method: 'POST' });
            const analyzeData = await analyzeRes.json();
            
            if (analyzeData.success) {
              console.log('✅ Auto-analysis complete, reloading metrics...');
              // Reload metrics after analysis
              const updatedMetricsRes = await fetch('/api/operator/metrics');
              const updatedMetricsData = await updatedMetricsRes.json();
              if (updatedMetricsData.success) {
                setMetrics(updatedMetricsData.data);
              }
            }
          } catch (error) {
            console.error('Error during auto-analysis:', error);
          } finally {
            setAnalyzing(false);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/operator/analyze-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Reload data to show updated metrics
        await loadData();
      }
    } catch (error) {
      console.error('Error analyzing users:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    searchQuery === '' ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="relative min-h-screen w-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white/80 rounded-full animate-spin mx-auto" />
            <p className="text-sm font-light tracking-tight text-white/60">Loading system data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-sans font-semibold tracking-tight text-white">SpendSense</h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
              <span className="text-[9px] font-light uppercase tracking-[0.08em] text-white/70">OPERATOR</span>
            </div>
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
        {/* Metrics Overview */}
        {metrics && (
          <>
            <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-extralight tracking-tight text-white mb-2">Platform Overview</h2>
                <p className="text-sm font-light tracking-tight text-white/60">Monitor user engagement and system performance metrics</p>
              </div>
              {metrics && metrics.totalUsers > metrics.usersWithPersona && (
                <button
                  onClick={handleAnalyzeAll}
                  disabled={analyzing}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-sm font-light tracking-tight text-purple-200 backdrop-blur-sm transition-colors hover:bg-purple-500/30 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : `🔍 Analyze ${metrics.totalUsers - metrics.usersWithPersona} Users`}
                </button>
              )}
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl max-w-sm">
              <h3 className="text-sm font-light tracking-tight text-white/70 mb-2">Total Users</h3>
              <p className="text-4xl font-extralight tracking-tight text-white">{metrics.totalUsers}</p>
              <p className="text-xs font-light tracking-tight text-white/50 mt-2">
                Registered on platform
              </p>
            </div>

            {/* User Financial Categories */}
            <div className="mt-8">
              <h3 className="text-2xl font-extralight tracking-tight text-white mb-4">User Financial Categories</h3>
              <p className="text-sm font-light tracking-tight text-white/60 mb-4">Distribution of users by financial health profile</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* High Utilization */}
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                      <span className="text-xl">💳</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-light tracking-tight text-white">High Credit Usage</h4>
                      <p className="text-xs font-light tracking-tight text-white/50">Credit card utilization</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {metrics.personaBreakdown?.HIGH_UTILIZATION || 0}
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/60 mt-2">
                    {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.HIGH_UTILIZATION || 0) / metrics.totalUsers) * 100) : 0}% of users
                  </p>
                </div>

                {/* Savings Builder */}
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                      <span className="text-xl">💰</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-light tracking-tight text-white">Active Savers</h4>
                      <p className="text-xs font-light tracking-tight text-white/50">Building savings</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {metrics.personaBreakdown?.SAVINGS_BUILDER || 0}
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/60 mt-2">
                    {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.SAVINGS_BUILDER || 0) / metrics.totalUsers) * 100) : 0}% of users
                  </p>
                </div>

                {/* Variable Income */}
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-light tracking-tight text-white">Variable Income</h4>
                      <p className="text-xs font-light tracking-tight text-white/50">Irregular earnings</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {metrics.personaBreakdown?.VARIABLE_INCOME_BUDGETER || 0}
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/60 mt-2">
                    {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.VARIABLE_INCOME_BUDGETER || 0) / metrics.totalUsers) * 100) : 0}% of users
                  </p>
                </div>

                {/* Subscription Heavy */}
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-light tracking-tight text-white">High Subscriptions</h4>
                      <p className="text-xs font-light tracking-tight text-white/50">Many recurring bills</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {metrics.personaBreakdown?.SUBSCRIPTION_HEAVY || 0}
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/60 mt-2">
                    {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.SUBSCRIPTION_HEAVY || 0) / metrics.totalUsers) * 100) : 0}% of users
                  </p>
                </div>

                {/* Low Income */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-light tracking-tight text-white">Limited Income</h4>
                      <p className="text-xs font-light tracking-tight text-white/50">Need micro-budgeting</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extralight tracking-tight text-white">
                    {metrics.personaBreakdown?.LOW_INCOME_STABILIZER || 0}
                  </p>
                  <p className="text-xs font-light tracking-tight text-white/60 mt-2">
                    {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.LOW_INCOME_STABILIZER || 0) / metrics.totalUsers) * 100) : 0}% of users
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* User List */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extralight tracking-tight text-white">Users</h2>
              <p className="text-sm font-light tracking-tight text-white/60 mt-1">{filteredUsers.length} total users</p>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Consent</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">User Category</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono tracking-tight text-white/80">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-light tracking-tight text-white">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3 text-sm font-light tracking-tight text-white/70">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-light tracking-tight ${
                        user.consentStatus.active 
                          ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {user.consentStatus.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.primaryPersona ? (
                        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-xs font-light tracking-tight text-purple-200">
                          {user.primaryPersona}
                        </span>
                      ) : (
                        <span className="text-sm font-light tracking-tight text-white/40">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-light tracking-tight text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Profile Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl mx-4 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-black p-8 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setShowUserModal(false)}
                className="absolute top-4 right-4 rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-extralight tracking-tight text-white mb-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-sm font-light tracking-tight text-white/60">{selectedUser.email}</p>
              </div>

              {/* Info Grid */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-light tracking-tight text-white mb-3">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-light tracking-tight text-white/50 mb-1">User ID</p>
                      <p className="text-sm font-mono tracking-tight text-white">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light tracking-tight text-white/50 mb-1">Date of Birth</p>
                      <p className="text-sm font-light tracking-tight text-white">{selectedUser.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light tracking-tight text-white/50 mb-1">Phone</p>
                      <p className="text-sm font-light tracking-tight text-white">{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light tracking-tight text-white/50 mb-1">Account Created</p>
                      <p className="text-sm font-light tracking-tight text-white">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consent Status */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-light tracking-tight text-white mb-3">Consent Status</h3>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-light tracking-tight ${
                      selectedUser.consentStatus.active 
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {selectedUser.consentStatus.active ? 'Active' : 'Inactive'}
                    </span>
                    {selectedUser.consentStatus.grantedAt && (
                      <p className="text-sm font-light tracking-tight text-white/60">
                        Granted: {new Date(selectedUser.consentStatus.grantedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Category */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-light tracking-tight text-white mb-3">Financial Category</h3>
                  {selectedUser.primaryPersona ? (
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-sm font-light tracking-tight text-purple-200">
                        {selectedUser.primaryPersona}
                      </span>
                      <p className="text-sm font-light tracking-tight text-white/60 mt-2">
                        Total personas: {selectedUser.personaCount || 1}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-light tracking-tight text-white/60">No persona assigned</p>
                  )}
                </div>

                {/* Send Recommendations */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-light tracking-tight text-white mb-3">Send Recommendations</h3>
                  <p className="text-sm font-light tracking-tight text-white/60 mb-4">
                    Based on financial category: <span className="text-purple-200">{selectedUser.primaryPersona || 'None'}</span>
                  </p>
                  
                  <div className="space-y-3">
                    {/* Recommendations based on persona type */}
                    {selectedUser.primaryPersona === 'SAVINGS_BUILDER' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💳 Premium Rewards Credit Card</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Great for users with good credit and savings</p>
                          </div>
                          <button
                            onClick={() => alert('Credit card offer sent to user!')}
                            className="rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-xs font-light tracking-tight text-green-200 backdrop-blur-sm transition-colors hover:bg-green-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">📈 High-Yield Savings Account</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Maximize savings with better interest rates</p>
                          </div>
                          <button
                            onClick={() => alert('Savings account offer sent to user!')}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-xs font-light tracking-tight text-blue-200 backdrop-blur-sm transition-colors hover:bg-blue-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                      </>
                    )}

                    {selectedUser.primaryPersona === 'HIGH_UTILIZATION' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">🔄 Debt Consolidation Loan</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Lower interest rate, single payment</p>
                          </div>
                          <button
                            onClick={() => alert('Debt consolidation offer sent to user!')}
                            className="rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-xs font-light tracking-tight text-red-200 backdrop-blur-sm transition-colors hover:bg-red-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💰 Balance Transfer Card (0% APR)</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Move high-interest debt, save on interest</p>
                          </div>
                          <button
                            onClick={() => alert('Balance transfer card offer sent to user!')}
                            className="rounded-lg border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-xs font-light tracking-tight text-orange-200 backdrop-blur-sm transition-colors hover:bg-orange-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                      </>
                    )}

                    {selectedUser.primaryPersona === 'VARIABLE_INCOME_BUDGETER' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💼 Income Smoothing Program</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Tools to manage irregular income</p>
                          </div>
                          <button
                            onClick={() => alert('Income smoothing program sent to user!')}
                            className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-4 py-2 text-xs font-light tracking-tight text-yellow-200 backdrop-blur-sm transition-colors hover:bg-yellow-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">🏦 Line of Credit</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Flexible access to funds during low-income periods</p>
                          </div>
                          <button
                            onClick={() => alert('Line of credit offer sent to user!')}
                            className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-4 py-2 text-xs font-light tracking-tight text-yellow-200 backdrop-blur-sm transition-colors hover:bg-yellow-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                      </>
                    )}

                    {selectedUser.primaryPersona === 'SUBSCRIPTION_HEAVY' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">📱 Subscription Management Tool</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Track and cancel unwanted subscriptions</p>
                          </div>
                          <button
                            onClick={() => alert('Subscription management tool sent to user!')}
                            className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-xs font-light tracking-tight text-purple-200 backdrop-blur-sm transition-colors hover:bg-purple-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💳 Cashback Card (Recurring Purchases)</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Earn rewards on your subscriptions</p>
                          </div>
                          <button
                            onClick={() => alert('Cashback card offer sent to user!')}
                            className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-xs font-light tracking-tight text-purple-200 backdrop-blur-sm transition-colors hover:bg-purple-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                      </>
                    )}

                    {selectedUser.primaryPersona === 'LOW_INCOME_STABILIZER' && (
                      <>
                        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">🎯 Micro-Savings Program</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Start building savings with small amounts</p>
                          </div>
                          <button
                            onClick={() => alert('Micro-savings program sent to user!')}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-xs font-light tracking-tight text-blue-200 backdrop-blur-sm transition-colors hover:bg-blue-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">📚 Financial Assistance Resources</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Access programs and support services</p>
                          </div>
                          <button
                            onClick={() => alert('Financial assistance resources sent to user!')}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-xs font-light tracking-tight text-blue-200 backdrop-blur-sm transition-colors hover:bg-blue-500/30"
                          >
                            Send Offer
                          </button>
                        </div>
                      </>
                    )}

                    {!selectedUser.primaryPersona && (
                      <p className="text-sm font-light tracking-tight text-white/40 text-center py-4">
                        No persona assigned yet. Analyze this user first to see recommendations.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-light tracking-tight text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    router.push(`/user/${selectedUser.id}`);
                  }}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/20 px-6 py-2 text-sm font-light tracking-tight text-purple-200 backdrop-blur-sm transition-colors hover:bg-purple-500/30"
                >
                  View Full Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

