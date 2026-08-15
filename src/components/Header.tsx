'use client';

import React from 'react';
import { Sun, Moon, RefreshCw, Settings, ShieldCheck, Home } from 'lucide-react';
import { PaymentSetting } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  paymentSettings: PaymentSetting;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onResetData,
  paymentSettings,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                Begize <span className="text-emerald-600 dark:text-emerald-400 font-serif">በጊዜ</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              የቤት ኪራይና የፍጆታ ሂሳቦች መቆጣጠሪያ (Rental & Bills)
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Payment Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800"
            title="የክፍያ መረጃ (CBE & Telebirr Settings)"
          >
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">ሂሳብ ቁጥር (CBE/Telebirr)</span>
          </button>

          {/* Reset Data Button */}
          <button
            onClick={() => {
              if (confirm('ሁሉንም መረጃዎች ወደ መጀመሪያው ናሙና ይመልሱ? (Reset sample data?)')) {
                onResetData();
              }
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-800"
            title="መረጃዎችን ወደነበሩበት መልስ (Reset Sample Data)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="የገጽታ ቀለም ቀይር (Toggle Dark/Light Mode)"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
};
