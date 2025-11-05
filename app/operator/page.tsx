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
      if (metricsData.success) setMetrics(metricsData.data);

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
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
              <span className="text-[9px] font-light uppercase tracking-[0.08em] text-white/70">OPERATOR</span>
            </div>
            <h1 className="text-xl font-extralight tracking-tight text-white">SpendSense</h1>
            <p className="text-sm font-light tracking-tight text-white/60">System Administration</p>
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
            <div>
              <h2 className="text-3xl font-extralight tracking-tight text-white mb-4">System Metrics</h2>
              <p className="text-sm font-light tracking-tight text-white/60">Real-time system health and performance</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-2">Total Users</h3>
                <p className="text-4xl font-extralight tracking-tight text-white">{metrics.totalUsers}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-2">With Consent</h3>
                <p className="text-4xl font-extralight tracking-tight text-white">{metrics.usersWithConsent}</p>
                <p className="text-xs font-light tracking-tight text-white/50 mt-2">
                  {Math.round((metrics.usersWithConsent / metrics.totalUsers) * 100)}% of total
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-2">With Personas</h3>
                <p className="text-4xl font-extralight tracking-tight text-white">{metrics.usersWithPersona}</p>
                <p className="text-xs font-light tracking-tight text-white/50 mt-2">
                  {metrics.coveragePercentage.toFixed(1)}% coverage
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-light tracking-tight text-white/70 mb-2">Recommendations</h3>
                <p className="text-4xl font-extralight tracking-tight text-white">{metrics.totalRecommendations}</p>
                <p className="text-xs font-light tracking-tight text-white/50 mt-2">
                  {metrics.averageRecommendationsPerUser.toFixed(1)} per user avg
                </p>
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
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Persona</th>
                  <th className="px-4 py-3 text-left text-xs font-light tracking-tight text-white/70">Recs</th>
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
                    <td className="px-4 py-3 text-sm font-light tracking-tight text-white/70">{user.recommendationCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

