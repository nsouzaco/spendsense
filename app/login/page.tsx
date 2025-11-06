'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Consent Modal Component
function ConsentModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-black/90 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-extralight tracking-tight text-white mb-4">
          Data Consent Required
        </h2>
        <p className="text-sm font-light tracking-tight text-white/70 mb-6 leading-relaxed">
          To provide you with personalized financial recommendations, SpendSense needs your consent to analyze your transaction data. 
          We take your privacy seriously and only use your data to generate insights tailored to your financial patterns.
        </p>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
          <h3 className="text-sm font-light tracking-tight text-white mb-2">We will:</h3>
          <ul className="space-y-2 text-xs font-light tracking-tight text-white/60">
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Analyze your spending patterns to detect financial signals</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Generate personalized recommendations using AI</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Keep your data secure and never share it with third parties</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span>
              <span>Allow you to revoke consent at any time</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Accept & Continue
          </button>
          <button
            onClick={onDecline}
            className="rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-light tracking-tight text-white/80 backdrop-blur-sm transition-colors hover:bg-white/5"
          >
            Decline
          </button>
        </div>

        <p className="mt-4 text-xs font-light tracking-tight text-white/40 text-center">
          By accepting, you agree to our data processing practices
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'operator'>('user');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (type: 'user' | 'operator') => {
    setLoading(true);
    setError('');
    
    try {
      // Simple validation
      if (type === 'operator') {
        if (username !== 'admin' || password !== 'admin') {
          setError('Invalid operator credentials');
          setLoading(false);
          return;
        }
      } else {
        // For demo: accept user1/user1, user2/user2, etc.
        const userMatch = username.match(/^user(\d+)$/);
        if (!userMatch || password !== username) {
          setError('Invalid credentials. Try user1 / user1');
          setLoading(false);
          return;
        }
        
        // Map user1 -> user_000000, user2 -> user_000001, etc.
        const userNum = parseInt(userMatch[1]);
        if (userNum < 1 || userNum > 75) {
          setError('User number must be between 1-75');
          setLoading(false);
          return;
        }
      }

      if (type === 'user') {
        // Show consent modal for regular users
        const userMatch = username.match(/^user(\d+)$/);
        const userNum = parseInt(userMatch![1]);
        const userId = `user_${String(userNum - 1).padStart(6, '0')}`;
        setPendingUserId(userId);
        setShowConsentModal(true);
        setLoading(false);
      } else {
        // Direct login for operators
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'operator',
            role: 'operator',
          }),
        });

        if (response.ok) {
          router.push('/operator');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleConsentAccept = () => {
    if (!pendingUserId) return;
    
    // Close modal immediately
    setShowConsentModal(false);
    setLoading(true);
    
    // Defer async operations to next tick to allow UI to update
    setTimeout(async () => {
      try {
        // Grant consent (demo - runs in background)
        fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: pendingUserId }),
        });

        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: pendingUserId,
            role: 'user',
          }),
        });

        if (response.ok) {
          router.push(`/user/${pendingUserId}`);
        }
      } catch (error) {
        console.error('Consent error:', error);
        setError('Failed to process consent');
        setLoading(false);
      }
    }, 0);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setPendingUserId(null);
    setError('Consent is required to use SpendSense');
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
                  <label htmlFor="username" className="block text-sm font-light tracking-tight text-white/80">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="user1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-light tracking-tight text-white/80">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin('user')}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                
                {error && (
                  <p className="text-xs font-light tracking-tight text-red-300">{error}</p>
                )}
                
                <button
                  onClick={() => handleLogin('user')}
                  disabled={loading || !username || !password}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                
                <p className="text-xs font-light tracking-tight text-white/40 text-center">
                  Demo: Try <span className="text-white/60">user1</span> / <span className="text-white/60">user1</span> (or user2-user75)
                </p>
              </div>
            )}

            {/* Operator Login */}
            {activeTab === 'operator' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="admin-username" className="block text-sm font-light tracking-tight text-white/80">
                    Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="block text-sm font-light tracking-tight text-white/80">
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin('operator')}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-light tracking-tight text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
                
                {error && (
                  <p className="text-xs font-light tracking-tight text-red-300">{error}</p>
                )}
                
                <button
                  onClick={() => handleLogin('operator')}
                  disabled={loading || !username || !password}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-light tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                
                <p className="text-xs font-light tracking-tight text-white/40 text-center">
                  Demo: Use <span className="text-white/60">admin</span> / <span className="text-white/60">admin</span>
                </p>
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

      {/* Consent Modal */}
      {showConsentModal && (
        <ConsentModal 
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}
    </div>
  );
}

