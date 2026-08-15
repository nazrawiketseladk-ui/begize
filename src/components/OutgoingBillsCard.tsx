'use client';

import React, { useState } from 'react';
import { Bill } from '../types';
import { Zap, Droplet, Wifi, Wrench, FileText, Check, Copy, ArrowUpRight } from 'lucide-react';

interface OutgoingBillsCardProps {
  bills: Bill[];
  onToggleBillStatus: (billId: string) => void;
  onAddBill: (bill: Bill) => void;
  onDeleteBill: (billId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const OutgoingBillsCard: React.FC<OutgoingBillsCardProps> = ({
  bills,
  onToggleBillStatus,
  onShowToast,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);

  const getCategoryIcon = (cat: Bill['category']) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'internet':
        return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCopyAccount = (acc: string, id: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast(`Account number ${acc} copied to clipboard`, 'info');
  };

  return (
    <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
      
      {/* Specular Line */}
      <div className="specular-line absolute top-0 left-0 right-0" />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
            Mandatory Payments
          </span>
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">Outgoing Utility Bills</h3>
        </div>
        <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Total Outgoing Amount Display */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {totalBillsAmount.toLocaleString()} <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-slate-400 font-medium">Monthly recurring expenses</span>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border border-[#0D7B50]/20 dark:border-emerald-500/30">
          +12.8%
        </span>
      </div>

      {/* Bills List */}
      <div className="space-y-2.5">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              bill.isPaid
                ? 'bg-zinc-50 dark:bg-white/[0.04] border-black/5 dark:border-white/5 opacity-75'
                : 'bg-white dark:bg-white/[0.08] border-amber-400/40 shadow-sm'
            }`}
          >
            {/* Category Icon & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/10 border border-black/5 dark:border-white/15 flex items-center justify-center shrink-0">
                {getCategoryIcon(bill.category)}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-white text-xs truncate">{bill.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-slate-400">
                  <span className="font-mono">{bill.accountNumber}</span>
                  <button
                    onClick={() => handleCopyAccount(bill.accountNumber, bill.id)}
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    {copiedId === bill.id ? <Check className="w-3 h-3 text-[#0D7B50] dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Amount & Status Action */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                  {bill.amount.toLocaleString()} <span className="text-[10px] text-[#0D7B50] dark:text-emerald-400">ETB</span>
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium">Day {bill.dueDay}</span>
              </div>

              <button
                onClick={() => onToggleBillStatus(bill.id)}
                className={`p-1.5 rounded-xl border transition-all ${
                  bill.isPaid
                    ? 'bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border-[#0D7B50]/20 dark:border-emerald-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 hover:bg-[#E6F5EE]'
                }`}
                title={bill.isPaid ? 'Paid' : 'Mark Paid'}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
