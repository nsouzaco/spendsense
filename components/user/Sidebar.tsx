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
}

export function Sidebar({ userId, userName }: SidebarProps) {
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
      active: true,
    },
    {
      name: 'Accounts',
      icon: Wallet,
      active: false,
    },
    {
      name: 'Transactions',
      icon: ArrowLeftRight,
      active: false,
    },
    {
      name: 'Analytics',
      icon: TrendingUp,
      active: false,
    },
    {
      name: 'Cards',
      icon: CreditCard,
      active: false,
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 shadow-lg shadow-purple-500/50">
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">SpendSense</span>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white font-medium shadow-lg shadow-purple-500/30">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
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

