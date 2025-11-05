'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState('user_000000');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'operator'>('user');

  const handleLogin = async (type: 'user' | 'operator') => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: type === 'user' ? selectedUserId : 'operator',
          role: type,
        }),
      });

      if (response.ok) {
        if (type === 'operator') {
          router.push('/operator');
        } else {
          router.push(`/user/${selectedUserId}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      
      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-10 rounded-2xl border border-white/10 px-4 py-2 text-sm font-light text-white/80 backdrop-blur-sm transition-colors hover:bg-white/5"
      >
        ← Back
      </Link>

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extralight tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-3 text-base font-light tracking-tight text-white/60">
              Sign in to access your financial insights
            </p>
          </div>

          {/* Glass Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            {/* Tab Selector */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                onClick={() => setActiveTab('user')}
                className={`rounded-xl px-4 py-2.5 text-sm font-light tracking-tight transition-all ${
                  activeTab === 'user'
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                End User
              </button>
              <button
                onClick={() => setActiveTab('operator')}
                className={`rounded-xl px-4 py-2.5 text-sm font-light tracking-tight transition-all ${
                  activeTab === 'operator'
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Operator
              </button>
            </div>

            {/* User Login */}
            {activeTab === 'user' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="userId" className="block text-sm font-light tracking-tight text-white/80">
                    User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    placeholder="user_000000"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                  <p className="text-xs font-light tracking-tight text-white/50">
                    Try: user_000000 through user_000074
                  </p>
                </div>
                <button
                  onClick={() => handleLogin('user')}
                  disabled={loading || !selectedUserId}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in as User'}
                </button>
              </div>
            )}

            {/* Operator Login */}
            {activeTab === 'operator' && (
              <div className="space-y-4">
                <p className="text-sm font-light leading-relaxed tracking-tight text-white/60">
                  Access the operator dashboard to view system metrics, manage users, and monitor
                  recommendations.
                </p>
                <button
                  onClick={() => handleLogin('operator')}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in as Operator'}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs font-extralight tracking-tight text-white/40">
            <span className="h-1 w-1 rounded-full bg-white/40" /> Secure & Private
            <span className="h-1 w-1 rounded-full bg-white/40" /> Real-time Analysis
          </div>
        </div>
      </div>
    </div>
  );
}

