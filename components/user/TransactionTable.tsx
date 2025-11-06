'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Transaction } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionTable({ transactions, limit }: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category.primary));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.merchantName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category.primary === categoryFilter);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [transactions, search, categoryFilter, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, type: 'credit' | 'debit') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));

    return type === 'credit' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white font-extralight">Recent Transactions</CardTitle>
        <CardDescription className="text-white/60">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] border-white/20 bg-white/10 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-white/20 bg-black/90 backdrop-blur-xl">
              {categories.map(cat => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="text-white hover:bg-white/10"
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/70">Date</TableHead>
                <TableHead className="text-white/70">Description</TableHead>
                <TableHead className="text-white/70">Category</TableHead>
                <TableHead className="text-right text-white/70">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-light text-white/60">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-light text-white">{tx.name}</p>
                      {tx.merchantName && (
                        <p className="text-xs font-light text-white/50">{tx.merchantName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 bg-white/10 text-white/70">
                      {tx.category.primary}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-light ${
                        tx.transactionType === 'credit'
                          ? 'text-green-400'
                          : 'text-white'
                      }`}
                    >
                      {formatAmount(tx.amount, tx.transactionType)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

