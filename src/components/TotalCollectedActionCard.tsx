'use client';

import React from 'react';
import { ArrowUpRight, ArrowDown, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Room } from '../types';

interface TotalCollectedActionCardProps {
  totalCollectedRent: number;
  rooms: Room[];
  onOpenSMSModal: (room: Room) => void;
  onQuickMarkPaid: () => void;
}

export const TotalCollectedActionCard: React.FC<TotalCollectedActionCardProps> = ({
  totalCollectedRent,
  rooms,
  onOpenSMSModal,
  onQuickMarkPaid,
}) => {
  const unpaidRoom = rooms.find(r => r.status !== 'paid') || rooms[0];

  return (
    <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
      
      {/* Specular Line */}
      <div className="specular-line absolute top-0 left-0 right-0" />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Balance
          </span>
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">Total Collected Revenue</h3>
        </div>
        <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Large Balance Display */}
      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          {totalCollectedRent.toLocaleString()} <span className="text-sm font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
        </div>
      </div>

      {/* SVG Sparkline Curve */}
      <div className="w-full h-14 relative">
        <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D7B50" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0D7B50" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 45 Q 40 10, 80 35 T 160 20 T 240 40 T 300 15 L 300 60 L 0 60 Z"
            fill="url(#sparklineGrad)"
          />
          <path
            d="M 0 45 Q 40 10, 80 35 T 160 20 T 240 40 T 300 15"
            fill="none"
            stroke="#0D7B50"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Action Pill Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        
        {/* Send SMS Reminder (Pill Action Badge with ↗ arrow) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => unpaidRoom && onOpenSMSModal(unpaidRoom)}
          className="py-2.5 px-4 rounded-full bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <span>Send SMS</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.button>

        {/* Receive / Mark Paid (Pill Action Badge with ↓ arrow) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onQuickMarkPaid}
          className="py-2.5 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/15 transition-all shadow-sm"
        >
          <span>Receive</span>
          <ArrowDown className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
        </motion.button>

      </div>

    </div>
  );
};
