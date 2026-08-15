'use client';

import React, { useState } from 'react';
import { SMSLog } from '../types';
import { MessageSquare, Search, Trash2, Calendar, ShieldCheck, ChevronDown, ChevronUp, Bell, Clock, Send, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SMSHistoryViewProps {
  logs: SMSLog[];
  onClearLogs: () => void;
  onRunAutomation: () => void;
  isTestingAutomation: boolean;
  autoSmsEnabled?: boolean;
}

export const SMSHistoryView: React.FC<SMSHistoryViewProps> = ({
  logs,
  onClearLogs,
  onRunAutomation,
  isTestingAutomation,
  autoSmsEnabled = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'all'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter logs by date range & search
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phone.includes(searchQuery) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (timeFilter === 'all') return true;

    const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === '7days') return diffDays <= 7;
    if (timeFilter === '30days') return diffDays <= 30;

    return true;
  });

  const getTypeBadgeStyle = (type?: string) => {
    switch (type) {
      case 'DUE_DATE_REMINDER':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          label: 'Rent Due'
        };
      case 'ADVANCE_NOTICE':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          label: '3-Day Advance'
        };
      case 'OVERDUE_ALERT':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/30',
          label: 'Overdue Alert'
        };
      default:
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          label: 'Direct SMS'
        };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes('delivered') || lower.includes('success')) {
      return 'bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border-[#0D7B50]/20 dark:border-emerald-500/30';
    }
    if (lower.includes('failed') || lower.includes('error')) {
      return 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30';
    }
    return 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
  };

  return (
    <div className="fintech-card p-5 sm:p-6 space-y-5 relative overflow-hidden">
      
      {/* Top Banner Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0D7B50] dark:text-emerald-400" />
              <span>30-Day SMS Audit Log</span>
            </h3>
            
            {/* Automation Status Indicator Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              autoSmsEnabled
                ? 'bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border-[#0D7B50]/20 dark:border-emerald-500/30'
                : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-slate-400 border-black/5 dark:border-white/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${autoSmsEnabled ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'}`} />
              <span>{autoSmsEnabled ? 'Automation Active 🟢' : 'Automation Paused ⏸'}</span>
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">
            Complete historical log of automated rent reminders, 3-day notices, and landlord alert dispatches.
          </p>
        </div>

        {/* Action Controls: Run Automation Now + Clear Logs */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRunAutomation}
            disabled={isTestingAutomation}
            className="px-4 py-2 rounded-full bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTestingAutomation ? 'Running Check...' : 'Run Automation Check Now'}</span>
          </motion.button>

          {logs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all historical SMS logs?')) {
                  onClearLogs();
                }
              }}
              className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Clear All Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-slate-950/40 border border-black/5 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Filter by recipient, room #, or phone..."
          />
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-slate-950/40 border border-black/5 dark:border-white/10 text-xs font-bold">
          {(['7days', '30days', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-3.5 py-1 rounded-full transition-all capitalize ${
                timeFilter === period
                  ? 'bg-[#0D7B50] dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {period === '7days' ? 'Last 7 Days' : period === '30days' ? 'Last 30 Days' : 'All History'}
            </button>
          ))}
        </div>

      </div>

      {/* Audit Log Table */}
      {filteredLogs.length > 0 ? (
        <div className="overflow-x-auto border border-black/5 dark:border-white/10 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-zinc-500 dark:text-slate-400 border-b border-black/5 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider bg-zinc-50 dark:bg-white/[0.02]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filteredLogs.map((log) => {
                const typeStyle = getTypeBadgeStyle(log.type);
                const statusStyle = getStatusBadgeStyle(log.status);
                const isExpanded = expandedLogId === log.id;

                const displayDate = log.createdAt
                  ? new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' at ' + (log.sentAt || '09:00 AM')
                  : log.sentAt || 'Today';

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{displayDate}</span>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        <div>
                          <div>{log.recipientName}</div>
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-slate-400">{log.phone}</span>
                        </div>
                      </td>

                      {/* Room # */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/10 font-black text-zinc-900 dark:text-white text-xs">
                          {log.roomNumber || 'N/A'}
                        </span>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${typeStyle.bg}`}>
                          {typeStyle.label}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{log.message}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusStyle}`}>
                          {log.status || 'Delivered'}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Full Message Row */}
                    {isExpanded && (
                      <tr className="bg-zinc-100/60 dark:bg-slate-950/60">
                        <td colSpan={6} className="p-4 border-t border-b border-black/5 dark:border-white/10">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-slate-400 block">
                              Full SMS Message Content ({log.recipientName} - {log.phone}):
                            </span>
                            <pre className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 text-zinc-900 dark:text-slate-200 text-xs font-sans whitespace-pre-wrap border border-black/5 dark:border-white/10 leading-relaxed shadow-inner">
                              {log.message}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 dark:text-slate-400 text-xs space-y-2 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
          <MessageSquare className="w-8 h-8 mx-auto text-zinc-400" />
          <p className="font-bold text-zinc-800 dark:text-zinc-200">No SMS audit logs found</p>
          <p>Click "Run Automation Check Now" above or send an SMS from any room card to generate logs.</p>
        </div>
      )}

    </div>
  );
};
