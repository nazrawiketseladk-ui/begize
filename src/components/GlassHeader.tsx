'use client';

import React from 'react';
import { Settings, Home, LayoutDashboard, MessageSquare, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { PaymentSetting } from '../types';

interface GlassHeaderProps {
  activeTab: 'dashboard' | 'rooms' | 'sms-logs';
  onSelectTab: (tab: 'dashboard' | 'rooms' | 'sms-logs') => void;
  paymentSettings: PaymentSetting;
  onOpenSettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  roomsCount: number;
  onLogout?: () => void;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  activeTab,
  onSelectTab,
  paymentSettings,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
  roomsCount,
  onLogout,
}) => {
  const userName = paymentSettings.accountHolderName || 'Landlord';

  return (
    <header className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-4 box-border transition-all">
      
      {/* Left: Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer shrink-0 pl-1" onClick={() => onSelectTab('dashboard')}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0E8A5E] p-0.5 shadow-md shadow-emerald-700/20 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-base sm:text-lg">
            B
          </div>
        </div>
        <div className="shrink-0">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Begize
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">Rental Reminder System</p>
        </div>
      </div>

      {/* Center: Navigation links/tabs (Hidden on mobile <768px, bottom navbar handles mobile) */}
      <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/10 shrink-0">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-[#0E8A5E] dark:bg-white text-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('rooms')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'bg-[#0E8A5E] dark:bg-white text-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Tenants ({roomsCount})</span>
        </button>

        <button
          onClick={() => onSelectTab('sms-logs')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sms-logs'
              ? 'bg-[#0E8A5E] dark:bg-white text-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS History</span>
        </button>
      </div>

      {/* Right: Action Icons Group */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-1">
        
        {/* Notifications Bell */}
        <div className="relative shrink-0">
          <button
            onClick={() => onSelectTab('sms-logs')}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors"
            title="SMS Logs History"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Switcher Pill Button */}
        <button
          onClick={onToggleDarkMode}
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          title={darkMode ? "Switch to Soft Light Theme" : "Switch to Dark Theme"}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Soft Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Dark Glass</span>
            </>
          )}
        </button>

        {/* Settings Trigger */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-500 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Profile Avatar */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-0.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0E8A5E] to-emerald-400 p-0.5 shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </div>

      </div>

    </header>
  );
};
