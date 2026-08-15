'use client';

import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollectionTimelineCardProps {
  collectionPercentage: number;
}

export const CollectionTimelineCard: React.FC<CollectionTimelineCardProps> = ({
  collectionPercentage,
}) => {
  const chartData = [
    { month: 'Apr', amount: '45k', height: '40%' },
    { month: 'May', amount: '52k', height: '55%' },
    { month: 'Jun', amount: '60k', height: '70%' },
    { month: 'Jul', amount: '72k', height: '85%' },
    { month: 'Aug', amount: '52k', height: `${Math.max(collectionPercentage, 20)}%`, active: true },
  ];

  return (
    <div className="fintech-card p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
      
      {/* Specular Line */}
      <div className="specular-line absolute top-0 left-0 right-0" />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
            Collection Timeline
          </span>
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">Rent Collection Rate</h3>
        </div>
        <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Collection Percentage Badge */}
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            {collectionPercentage}% <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">Collected</span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-slate-400 font-medium">Target: 100% by month-end</span>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border border-[#0D7B50]/20 dark:border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>+17.8%</span>
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 border-b border-black/5 dark:border-white/10">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
              
              {/* Active Month Floating Tooltip */}
              {item.active && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-[#0D7B50] dark:bg-emerald-500 text-white dark:text-slate-950 font-black text-[10px] shadow-md z-10 whitespace-nowrap">
                  Current
                </div>
              )}

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: item.height }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`w-full rounded-t-xl transition-all ${
                  item.active
                    ? 'bg-[#0D7B50] dark:bg-emerald-500 shadow-md glow-emerald'
                    : 'bg-zinc-200 dark:bg-white/10 group-hover:bg-[#0D7B50]/50 dark:group-hover:bg-emerald-500/50'
                }`}
              />

              {/* Month Label */}
              <span className={`text-[11px] font-bold ${
                item.active ? 'text-[#0D7B50] dark:text-emerald-400 font-black' : 'text-zinc-500 dark:text-slate-400'
              }`}>
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
