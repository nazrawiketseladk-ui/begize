'use client';

import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PaymentSetting } from '../types';

interface RentOverviewCardProps {
  totalExpectedRent: number;
  totalCollectedRent: number;
  paymentSettings: PaymentSetting;
  onOpenSettings: () => void;
}

export const RentOverviewCard: React.FC<RentOverviewCardProps> = ({
  totalExpectedRent,
  totalCollectedRent,
  paymentSettings,
  onOpenSettings,
}) => {
  return (
    <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group">
      
      {/* Specular Highlight Line */}
      <div className="specular-line absolute top-0 left-0 right-0" />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
            Payment Goal
          </span>
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">Total Amount Goal</h3>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 flex items-center justify-center text-zinc-700 dark:text-white transition-colors"
          title="Edit Payment Info"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stylized Emerald Glass Credit Card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="w-full rounded-2xl glass-card-emerald p-4 sm:p-5 text-white space-y-4 shadow-xl relative overflow-hidden"
      >
        {/* Card Top Row: Brand / Chip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-widest text-lg italic text-white font-serif">CBE / Telebirr</span>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
            VIP LANDLORD
          </span>
        </div>

        {/* Amount */}
        <div>
          <span className="text-[11px] text-emerald-100/90 uppercase tracking-wider block font-semibold">Total Expected Rent</span>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
            {totalExpectedRent.toLocaleString()} <span className="text-xs font-bold text-emerald-200">ETB</span>
          </div>
        </div>

        {/* Card Bottom Row: Account Number & Exp Date */}
        <div className="flex items-center justify-between text-xs font-mono text-emerald-100/90 pt-1 border-t border-white/20">
          <div>
            <span className="text-[10px] text-emerald-200/80 block uppercase font-sans font-semibold">Account Number</span>
            <span className="font-bold tracking-wider">{paymentSettings.cbeAccount || '1000 4829 1048'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200/80 block uppercase font-sans font-semibold">EXP</span>
            <span className="font-bold">09/28</span>
          </div>
        </div>
      </motion.div>

      {/* Monthly Revenue Row */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400 block">Monthly Revenue</span>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-white mt-0.5">
            +{totalCollectedRent.toLocaleString()} <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border border-[#0D7B50]/20 dark:border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>+18.67%</span>
        </span>
      </div>

    </div>
  );
};
