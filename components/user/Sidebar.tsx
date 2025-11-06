'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  TrendingUp, 
  Settings, 
  LogOut,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  userId: string;
  userName: string;
  activeView: string;
  onViewChange: (view: 'dashboard' | 'accounts' | 'transactions' | 'analytics' | 'cards' | 'education') => void;
}

export function Sidebar({ userId, userName, activeView, onViewChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navigation = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      view: 'dashboard' as const,
    },
    {
      name: 'Accounts',
      icon: Wallet,
      view: 'accounts' as const,
    },
    {
      name: 'Transactions',
      icon: ArrowLeftRight,
      view: 'transactions' as const,
    },
    {
      name: 'Analytics',
      icon: TrendingUp,
      view: 'analytics' as const,
    },
    {
      name: 'Cards',
      icon: CreditCard,
      view: 'cards' as const,
    },
  ];

  return (
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-gradient-to-b from-gray-900 via-gray-900 to-black z-30">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center">
          <span className="text-xl font-semibold tracking-tight text-white">SpendSense</span>
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.name}
              onClick={() => onViewChange(item.view)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button 
          onClick={() => onViewChange('education')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeView === 'education'
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Education</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

