'use client';

import React from 'react';
import { LayoutDashboard, Home, MessageSquare, Settings, Moon, Sun, RefreshCw, Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlassSidebarProps {
  activeTab: 'dashboard' | 'rooms' | 'sms-logs';
  onSelectTab: (tab: 'dashboard' | 'rooms' | 'sms-logs') => void;
  onOpenSettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  onOpenAddModal: () => void;
  roomsCount: number;
  onLogout?: () => void;
}

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
  onResetData,
  onOpenAddModal,
  roomsCount,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: `${roomsCount} Rooms`, icon: Home },
    { id: 'sms-logs', label: 'SMS History', icon: MessageSquare },
  ] as const;

  return (
    <>
      {/* Desktop Floating Glass Sidebar (XL+) */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center py-6 px-3 rounded-[32px] bg-white dark:bg-zinc-900/[0.45] backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] space-y-6 transition-colors">
        
        {/* App Symbol Logo */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md cursor-pointer"
          onClick={() => onSelectTab('dashboard')}
          title="Begize"
        >
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-xl">
            B
          </div>
        </motion.div>

        {/* Main Nav Items Group */}
        <div className="flex flex-col items-center space-y-3 py-4 border-y border-black/5 dark:border-white/10 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#0D7B50] dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-md glow-emerald'
                      : 'text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>

                {/* Hover Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap border border-white/10 shadow-xl z-50 pointer-events-none">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAddModal}
          className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 flex items-center justify-center transition-all border border-black/5 dark:border-white/15"
          title="Add Tenant"
        >
          <Plus className="w-5 h-5 text-[#0D7B50] dark:text-emerald-400" />
        </motion.button>

        {/* System Actions */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          
          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className="w-10 h-10 rounded-xl text-zinc-500 dark:text-slate-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            title={darkMode ? "Switch to Quixotic Soft Light Theme" : "Switch to Dark Glass Emerald Theme"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </motion.button>

          {/* Reset Data */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm('Reset all data to default sample items?')) onResetData();
            }}
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
            title="Reset Sample Data"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>

          {/* Sign Out Button */}
          {onLogout && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="w-10 h-10 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}

        </div>

      </aside>

      {/* Mobile/Tablet Sticky Bottom Navigation Bar (< XL) */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 xl:hidden flex items-center justify-around py-2.5 px-4 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl w-[92%] max-w-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#0D7B50] dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px] font-extrabold">{item.id === 'dashboard' ? 'Home' : item.id === 'rooms' ? 'Rooms' : 'Logs'}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenAddModal}
          className="w-9 h-9 rounded-full bg-[#0D7B50] dark:bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center shadow-md shrink-0"
          title="Add Tenant"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-slate-300 flex items-center justify-center shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </nav>
    </>
  );
};
