'use client';

import React from 'react';
import { DollarSign, CheckCircle2, AlertTriangle, Clock, TrendingUp, Receipt } from 'lucide-react';
import { Room, Bill } from '../types';

interface DashboardStatsProps {
  rooms: Room[];
  bills: Bill[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ rooms, bills }) => {
  const totalExpectedRent = rooms.reduce((sum, r) => sum + r.rentAmount, 0);
  const totalCollectedRent = rooms
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.rentAmount, 0);
  
  const overdueCount = rooms.filter(r => r.status === 'overdue').length;
  const dueSoonCount = rooms.filter(r => r.status === 'due-soon').length;
  const paidCount = rooms.filter(r => r.status === 'paid').length;

  const collectionPercentage = totalExpectedRent > 0
    ? Math.round((totalCollectedRent / totalExpectedRent) * 100)
    : 0;

  const totalOutgoingBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidOutgoingBills = bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const pendingOutgoingBills = totalOutgoingBills - paidOutgoingBills;

  const netMonthlyIncome = totalCollectedRent - paidOutgoingBills;

  return (
    <div className="space-y-4">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Expected Rent */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              የወሩ ኪራይ (Total Expected)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalExpectedRent.toLocaleString()} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ETB</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>ከ {rooms.length} ክፍሎች</span>
          </p>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              የተሰበሰበ (Collected)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {totalCollectedRent.toLocaleString()} <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">ETB</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {paidCount} ክፍሎች ተከፍለዋል ({collectionPercentage}%)
          </p>
        </div>

        {/* Card 3: Overdue Rooms */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ያልተከፈሉ (Overdue)
            </span>
            <div className={`p-2 rounded-xl ${overdueCount > 0 ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {overdueCount} <span className="text-xs font-medium text-slate-500">ክፍሎች</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {dueSoonCount > 0 ? `${dueSoonCount} ክፍሎች በቅርቡ የሚከፈሉ` : 'ምንም አስቸኳይ የለም'}
          </p>
        </div>

        {/* Card 4: Net Balance (Collected Rents - Paid Outgoing Bills) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              የወሩ የተጣራ ገቢ (Net Income)
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            {netMonthlyIncome.toLocaleString()} <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">ETB</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            የወጡ ሂሳቦች፡ {paidOutgoingBills.toLocaleString()} ETB
          </p>
        </div>

      </div>

      {/* Collection Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-500" />
            <span>የወሩ የኪራይ ስብሰባ ሂደት (Collection Progress)</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{collectionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${Math.min(100, Math.max(0, collectionPercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
