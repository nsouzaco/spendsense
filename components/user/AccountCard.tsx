import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  variant?: 'default' | 'compact';
}

export function AccountCard({ account, variant = 'default' }: AccountCardProps) {
  const getCardGradient = () => {
    if (account.type === 'credit') {
      return 'from-purple-600 via-purple-500 to-indigo-600';
    } else if (account.subtype === 'savings') {
      return 'from-green-600 via-emerald-500 to-teal-600';
    } else if (account.subtype === 'checking') {
      return 'from-blue-600 via-blue-500 to-cyan-600';
    }
    return 'from-slate-600 via-slate-500 to-gray-600';
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (variant === 'compact') {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-light tracking-tight text-white/60">{account.name}</p>
              <p className="text-sm font-light tracking-tight text-white/40">••• {account.mask}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extralight tracking-tight text-white">
                {formatBalance(account.currentBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="group relative h-56 w-full max-w-md">
      {/* Card */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getCardGradient()} shadow-2xl transition-transform group-hover:scale-[1.02]`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        {/* Card content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-light tracking-tight text-white/80">{account.name}</p>
              <Badge variant="outline" className="mt-1 border-white/20 bg-white/10 text-white/70">
                {account.subtype}
              </Badge>
            </div>
            <div className="text-right">
              {account.type === 'credit' && account.creditLimit && (
                <div>
                  <p className="text-xs font-light tracking-tight text-white/60">Limit</p>
                  <p className="text-sm font-light tracking-tight text-white">
                    {formatBalance(account.creditLimit)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-sm font-light tracking-tight text-white/70 mb-1">
              {account.type === 'credit' ? 'Balance' : 'Available'}
            </p>
            <p className="text-4xl font-extralight tracking-tight text-white">
              {formatBalance(account.currentBalance)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="text-2xl font-sans font-semibold tracking-tight text-white/90">
              ••• {account.mask}
            </div>
            {account.type === 'credit' && (
              <div className="text-white/80">
                <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                  <circle cx="15" cy="16" r="15" fill="currentColor" opacity="0.5" />
                  <circle cx="33" cy="16" r="15" fill="currentColor" opacity="0.5" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

