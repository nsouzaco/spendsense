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
  const [showOfferSentModal, setShowOfferSentModal] = useState(false);
  const [sentOffers, setSentOffers] = useState<Record<string, Set<string>>>({});

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

  const handleSendOffer = async (offerId: string, title: string, description: string, category: string) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          title,
          description,
          category,
          sentBy: 'admin', // operator ID
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Track sent offer
        setSentOffers(prev => {
          const userOffers = prev[selectedUser.id] || new Set();
          userOffers.add(offerId);
          return { ...prev, [selectedUser.id]: userOffers };
        });
        
        // Show success modal
        setShowOfferSentModal(true);
        
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setShowOfferSentModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Failed to send offer. Please try again.');
    }
  };

  const isOfferSent = (offerId: string) => {
    if (!selectedUser) return false;
    return sentOffers[selectedUser.id]?.has(offerId) || false;
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
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gray-50">
      {/* Header */}
      <header className="relative border-b border-white/10 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Metrics Overview */}
        {metrics && (
          <>
            {metrics && metrics.totalUsers > metrics.usersWithPersona && (
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeAll}
                  disabled={analyzing}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-light tracking-tight text-purple-700 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : `🔍 Analyze ${metrics.totalUsers - metrics.usersWithPersona} Users`}
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Total Users */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">Total Users</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Registered on platform</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.totalUsers}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  100% of users
                </p>
              </div>
              
              {/* High Utilization */}
              <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                    <span className="text-lg">💳</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">High Credit Usage</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Credit card utilization</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.personaBreakdown?.HIGH_UTILIZATION || 0}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.HIGH_UTILIZATION || 0) / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>

              {/* Savings Builder */}
              <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">Active Savers</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Building savings</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.personaBreakdown?.SAVINGS_BUILDER || 0}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.SAVINGS_BUILDER || 0) / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>

              {/* Variable Income */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">Variable Income</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Irregular earnings</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.personaBreakdown?.VARIABLE_INCOME_BUDGETER || 0}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.VARIABLE_INCOME_BUDGETER || 0) / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>

              {/* Subscription Heavy */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">High Subscriptions</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Many recurring bills</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.personaBreakdown?.SUBSCRIPTION_HEAVY || 0}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.SUBSCRIPTION_HEAVY || 0) / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>

              {/* Low Income */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-light tracking-tight text-gray-900">Limited Income</h4>
                    <p className="text-xs font-light tracking-tight text-gray-600">Need micro-budgeting</p>
                  </div>
                </div>
                <p className="text-2xl font-extralight tracking-tight text-gray-900">
                  {metrics.personaBreakdown?.LOW_INCOME_STABILIZER || 0}
                </p>
                <p className="text-xs font-light tracking-tight text-gray-600 mt-1">
                  {metrics.totalUsers > 0 ? Math.round(((metrics.personaBreakdown?.LOW_INCOME_STABILIZER || 0) / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>
              </div>
          </>
        )}

        {/* User List */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extralight tracking-tight text-gray-900">Users</h2>
              <p className="text-sm font-light tracking-tight text-gray-600 mt-1">{filteredUsers.length} total users</p>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-light tracking-tight text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">Consent</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">User Category</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-gray-700">Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono tracking-tight text-gray-600">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-light tracking-tight text-gray-900">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3 text-sm font-light tracking-tight text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-light tracking-tight ${
                        user.consentStatus.active 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {user.consentStatus.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.primaryPersona ? (
                        <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-light tracking-tight text-purple-700">
                          {user.primaryPersona}
                        </span>
                      ) : (
                        <span className="text-sm font-light tracking-tight text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-light tracking-tight text-gray-700 transition-colors hover:bg-gray-50"
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
                            onClick={() => handleSendOffer('credit-card-premium', 'Premium Rewards Credit Card', 'Great for users with good credit and savings', 'credit')}
                            disabled={isOfferSent('credit-card-premium')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('credit-card-premium')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-green-500/30 bg-green-500/20 text-green-200 hover:bg-green-500/30'
                            }`}
                          >
                            {isOfferSent('credit-card-premium') ? '✓ Offer Sent' : 'Send Offer'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">📈 High-Yield Savings Account</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Maximize savings with better interest rates</p>
                          </div>
                          <button
                            onClick={() => handleSendOffer('savings-high-yield', 'High-Yield Savings Account', 'Maximize savings with better interest rates', 'savings')}
                            disabled={isOfferSent('savings-high-yield')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('savings-high-yield')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                            }`}
                          >
                            {isOfferSent('savings-high-yield') ? '✓ Offer Sent' : 'Send Offer'}
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
                            onClick={() => handleSendOffer('debt-consolidation', 'Debt Consolidation Loan', 'Lower interest rate, single payment', 'loan')}
                            disabled={isOfferSent('debt-consolidation')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('debt-consolidation')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-red-500/30 bg-red-500/20 text-red-200 hover:bg-red-500/30'
                            }`}
                          >
                            {isOfferSent('debt-consolidation') ? '✓ Offer Sent' : 'Send Offer'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💰 Balance Transfer Card (0% APR)</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Move high-interest debt, save on interest</p>
                          </div>
                          <button
                            onClick={() => handleSendOffer('balance-transfer', 'Balance Transfer Card (0% APR)', 'Move high-interest debt, save on interest', 'credit')}
                            disabled={isOfferSent('balance-transfer')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('balance-transfer')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-orange-500/30 bg-orange-500/20 text-orange-200 hover:bg-orange-500/30'
                            }`}
                          >
                            {isOfferSent('balance-transfer') ? '✓ Offer Sent' : 'Send Offer'}
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
                            onClick={() => handleSendOffer('income-smoothing', 'Income Smoothing Program', 'Tools to manage irregular income', 'tool')}
                            disabled={isOfferSent('income-smoothing')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('income-smoothing')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'
                            }`}
                          >
                            {isOfferSent('income-smoothing') ? '✓ Offer Sent' : 'Send Offer'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">🏦 Line of Credit</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Flexible access to funds during low-income periods</p>
                          </div>
                          <button
                            onClick={() => handleSendOffer('line-of-credit', 'Line of Credit', 'Flexible access to funds during low-income periods', 'loan')}
                            disabled={isOfferSent('line-of-credit')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('line-of-credit')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'
                            }`}
                          >
                            {isOfferSent('line-of-credit') ? '✓ Offer Sent' : 'Send Offer'}
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
                            onClick={() => handleSendOffer('subscription-tool', 'Subscription Management Tool', 'Track and cancel unwanted subscriptions', 'tool')}
                            disabled={isOfferSent('subscription-tool')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('subscription-tool')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-purple-500/30 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                            }`}
                          >
                            {isOfferSent('subscription-tool') ? '✓ Offer Sent' : 'Send Offer'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">💳 Cashback Card (Recurring Purchases)</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Earn rewards on your subscriptions</p>
                          </div>
                          <button
                            onClick={() => handleSendOffer('cashback-card', 'Cashback Card (Recurring Purchases)', 'Earn rewards on your subscriptions', 'credit')}
                            disabled={isOfferSent('cashback-card')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('cashback-card')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-purple-500/30 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                            }`}
                          >
                            {isOfferSent('cashback-card') ? '✓ Offer Sent' : 'Send Offer'}
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
                            onClick={() => handleSendOffer('micro-savings', 'Micro-Savings Program', 'Start building savings with small amounts', 'savings')}
                            disabled={isOfferSent('micro-savings')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('micro-savings')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                            }`}
                          >
                            {isOfferSent('micro-savings') ? '✓ Offer Sent' : 'Send Offer'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                          <div>
                            <p className="text-sm font-light tracking-tight text-white">📚 Financial Assistance Resources</p>
                            <p className="text-xs font-light tracking-tight text-white/50">Access programs and support services</p>
                          </div>
                          <button
                            onClick={() => handleSendOffer('financial-assistance', 'Financial Assistance Resources', 'Access programs and support services', 'assistance')}
                            disabled={isOfferSent('financial-assistance')}
                            className={`rounded-lg border px-4 py-2 text-xs font-light tracking-tight backdrop-blur-sm transition-colors ${
                              isOfferSent('financial-assistance')
                                ? 'border-gray-500/30 bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'border-blue-500/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                            }`}
                          >
                            {isOfferSent('financial-assistance') ? '✓ Offer Sent' : 'Send Offer'}
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

        {/* Offer Sent Success Modal */}
        {showOfferSentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-900/90 via-gray-900/90 to-black/90 p-8 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Message */}
              <div className="text-center">
                <h3 className="text-2xl font-light tracking-tight text-white mb-2">
                  Offer Sent Successfully!
                </h3>
                <p className="text-sm font-light tracking-tight text-white/60">
                  The offer has been sent to {selectedUser?.firstName} and will appear in their offers section.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

