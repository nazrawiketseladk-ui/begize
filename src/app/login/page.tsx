'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid emaill or password');
      }
    } catch (err: any) {
      setError('An error occurred. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans ${
      darkMode ? 'bg-[#090D10] text-white' : 'bg-[#EDF2F2] text-zinc-900'
    }`}>
      
      {/* Background glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Theme Switcher Top Right */}
      <div className="fixed top-6 right-6">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold flex items-center gap-2 shadow-sm text-zinc-800 dark:text-white"
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Soft Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dark Glass</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl relative overflow-hidden transition-colors ${
          darkMode
            ? 'bg-zinc-900/60 backdrop-blur-2xl border-white/10'
            : 'bg-white border-black/5 shadow-xl'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 mx-auto shadow-lg shadow-emerald-600/30">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-2xl">
              B
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Sign In to Begize</h1>
          <p className="text-xs text-zinc-500 dark:text-slate-400">Manage your rental properties, tenants, and collection</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-bold mb-1.5 text-zinc-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email-input"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-zinc-50 border-black/10 text-zinc-900'
                }`}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password-input" className="block text-xs font-bold mb-1.5 text-zinc-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-zinc-50 border-black/10 text-zinc-900'
                }`}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all glow-emerald disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

        </form>

        {/* Signup Link */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#0D7B50] dark:text-emerald-400 font-extrabold hover:underline">
            Sign Up Now
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
