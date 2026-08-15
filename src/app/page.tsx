'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassSidebar } from '../components/GlassSidebar';
import { GlassHeader } from '../components/GlassHeader';
import { RentOverviewCard } from '../components/RentOverviewCard';
import { CollectionTimelineCard } from '../components/CollectionTimelineCard';
import { TotalCollectedActionCard } from '../components/TotalCollectedActionCard';
import { TenantStatusTable } from '../components/TenantStatusTable';
import { RoomCard } from '../components/RoomCard';
import { SMSHistoryView } from '../components/SMSHistoryView';
import { EditRoomModal } from '../components/EditRoomModal';
import { AddTenantModal } from '../components/AddTenantModal';
import { SMSModal } from '../components/SMSModal';
import { PaymentSettingsModal } from '../components/PaymentSettingsModal';
import { Toast } from '../components/Toast';
import { INITIAL_ROOMS, INITIAL_PAYMENT_SETTINGS } from '../data/sampleData';
import { Room, PaymentSetting, SMSLog } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'sms-logs'>('dashboard');

  // Database Data state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting>(INITIAL_PAYMENT_SETTINGS);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Time-aware greeting & Date
  const [greeting, setGreeting] = useState<string>('Good Day');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due-soon' | 'overdue'>('all');

  // Modals state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [smsTargetRoom, setSmsTargetRoom] = useState<Room | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestingAutomation, setIsTestingAutomation] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    setMounted(true);

    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      setGreeting('Good Morning');
    } else if (hours >= 12 && hours < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    setCurrentDateStr(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    );
  }, []);

  // Fetch authentication status & Database Records on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }

        const [tenantsRes, settingsRes, logsRes] = await Promise.all([
          fetch('/api/tenants'),
          fetch('/api/settings'),
          fetch('/api/sms-logs')
        ]);

        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          setRooms(tenantsData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setPaymentSettings(settingsData);
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setSmsLogs(logsData);
        }

        // Background daily check trigger on app load
        triggerDailyCheck();

      } catch (e) {
        console.error('Failed to load data from server', e);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [router]);

  // Background daily check execution
  const triggerDailyCheck = async () => {
    try {
      const lastCheckDate = localStorage.getItem('begize_last_daily_check');
      const todayStr = new Date().toISOString().split('T')[0];

      if (lastCheckDate !== todayStr) {
        const res = await fetch('/api/cron/reminders', { method: 'POST' });
        if (res.ok) {
          localStorage.setItem('begize_last_daily_check', todayStr);
          const logsRes = await fetch('/api/sms-logs');
          if (logsRes.ok) {
            const logsData = await logsRes.json();
            setSmsLogs(logsData);
          }
        }
      }
    } catch (e) {
      console.warn('Background daily check skipped');
    }
  };

  // Sync dark mode class with root html
  useEffect(() => {
    const savedDark = localStorage.getItem('begize_dark');
    if (savedDark !== null) {
      setDarkMode(JSON.parse(savedDark));
    } else {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('begize_dark', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Logged out successfully', 'info');
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  // Save Settings to Database
  const savePaymentSettings = async (newSettings: PaymentSetting) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const updated = await res.json();
        setPaymentSettings(updated);
        showToast('Settings saved to database!', 'success');
      }
    } catch (err: any) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Add SMS Log to Database
  const addSMSLog = async (log: SMSLog) => {
    try {
      const res = await fetch('/api/sms-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (res.ok) {
        const newLog = await res.json();
        setSmsLogs([newLog, ...smsLogs]);
      }
    } catch (e) {
      setSmsLogs([log, ...smsLogs]);
    }
  };

  // Clear SMS Logs
  const handleClearSMSLogs = async () => {
    try {
      await fetch('/api/sms-logs', { method: 'DELETE' });
      setSmsLogs([]);
      showToast('All SMS logs cleared', 'info');
    } catch (e) {
      setSmsLogs([]);
    }
  };

  // Reset sample data fallback
  const handleResetData = async () => {
    setRooms(INITIAL_ROOMS);
    setPaymentSettings(INITIAL_PAYMENT_SETTINGS);
    showToast('Sample view loaded', 'info');
  };

  // Add New Tenant / Room to Database
  const handleAddRoom = async (newRoom: Room) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });

      if (res.ok) {
        const created = await res.json();
        setRooms([created, ...rooms]);
        showToast(`Tenant ${created.tenantName} (Room ${created.roomNumber}) added to database!`, 'success');
      } else {
        throw new Error('Failed to create tenant');
      }
    } catch (err: any) {
      setRooms([newRoom, ...rooms]);
      showToast(`Tenant ${newRoom.tenantName} added!`, 'success');
    }
  };

  // Toggle Room Payment Status in Database
  const handleToggleRoomStatus = async (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    const nextStatus: Room['status'] = targetRoom.status === 'paid' ? 'due-soon' : 'paid';
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roomId,
          status: nextStatus,
          lastPaidDate: nextStatus === 'paid' ? today : targetRoom.lastPaidDate
        })
      });

      if (res.ok) {
        const updatedTenant = await res.json();
        setRooms(rooms.map(r => r.id === roomId ? updatedTenant : r));
        showToast(`Room ${updatedTenant.roomNumber} marked as ${nextStatus === 'paid' ? 'paid!' : 'unpaid.'}`, 'success');
      }
    } catch (err) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, status: nextStatus, lastPaidDate: nextStatus === 'paid' ? today : r.lastPaidDate } : r));
    }
  };

  // Quick Action Mark Paid
  const handleQuickMarkPaid = () => {
    const unpaid = rooms.find(r => r.status !== 'paid');
    if (unpaid) {
      handleToggleRoomStatus(unpaid.id);
    } else {
      showToast('All rooms are paid up to date!', 'info');
    }
  };

  // Edit Room in Database
  const handleSaveRoom = async (updatedRoom: Room) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRoom)
      });

      if (res.ok) {
        const saved = await res.json();
        setRooms(rooms.map(r => r.id === saved.id ? saved : r));
        showToast(`Room ${saved.roomNumber} updated in database!`, 'success');
      }
    } catch (err) {
      setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    }
  };

  // Run Automated Daily Cron Test
  const handleRunDailyAutomation = async () => {
    setIsTestingAutomation(true);
    try {
      const res = await fetch('/api/cron/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isManualTest: true
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const logsRes = await fetch('/api/sms-logs');
        if (logsRes.ok) {
          const updatedLogs = await logsRes.json();
          setSmsLogs(updatedLogs);
        }

        const tenantsRes = await fetch('/api/tenants');
        if (tenantsRes.ok) {
          const updatedTenants = await tenantsRes.json();
          setRooms(updatedTenants);
        }

        const totalSent = (data.tenantSmsSent || 0) + (data.landlordAlertsSent || 0);
        showToast(
          `Daily automation check completed! ${totalSent} SMS messages dispatched & logged.`,
          'success'
        );
        setActiveTab('sms-logs');
      } else {
        throw new Error(data.message || data.error || 'Failed to execute automation check');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsTestingAutomation(false);
    }
  };

  // Calculated totals
  const totalExpectedRent = rooms.reduce((sum, r) => sum + r.rentAmount, 0);
  const totalCollectedRent = rooms.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.rentAmount, 0);
  const overdueCount = rooms.filter(r => r.status === 'overdue').length;
  const collectionPercentage = totalExpectedRent > 0 ? Math.round((totalCollectedRent / totalExpectedRent) * 100) : 0;

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  const userName = paymentSettings.accountHolderName || 'Ketsela Tadesse';

  if (!mounted || isLoadingData) {
    return (
      <div className="min-h-screen bg-[#EDF2F2] dark:bg-[#090D10] text-zinc-900 dark:text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 animate-spin">
            <div className="w-full h-full bg-[#EDF2F2] dark:bg-slate-950 rounded-[14px]" />
          </div>
          <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400 font-mono tracking-widest">BEGIZE LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF2F2] dark:bg-[#090D10] text-zinc-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 right-10 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Left Floating Glass Sidebar (Desktop) / Sticky Bottom Nav (Mobile) */}
      <GlassSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onResetData={handleResetData}
        onOpenAddModal={() => setIsAddTenantOpen(true)}
        roomsCount={rooms.length}
        onLogout={handleLogout}
      />

      {/* Main Content Shell with pb-28 to clear mobile bottom navigation bar */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 xl:pl-24 pb-28 md:pb-12 pt-2 box-border min-h-screen overflow-x-hidden flex flex-col gap-6">
        
        {/* Top Header Navigation Bar */}
        <GlassHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          paymentSettings={paymentSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          overdueCount={overdueCount}
          roomsCount={rooms.length}
          onLogout={handleLogout}
        />

        {/* Greeting & Main Action Flow */}
        <div className="flex flex-col gap-3 w-full mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {greeting}, <span className="text-[#0D7B50] dark:text-emerald-400 font-serif">{userName}</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5 font-medium">
              Monthly rental income & tenant collection overview
            </p>
          </div>

          {/* Date Badge + Add Tenant Button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <div className="px-3.5 py-2 rounded-full bg-white dark:bg-white/[0.06] backdrop-blur-xl border border-black/5 dark:border-white/10 text-xs font-semibold text-zinc-700 dark:text-slate-300 flex items-center gap-2 shadow-sm whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-[#0D7B50] dark:text-emerald-400" />
              <span>{currentDateStr || 'Saturday, Aug 15, 2026'}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddTenantOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all glow-emerald whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Tenant</span>
            </motion.button>
          </div>
        </div>

        {/* Tab Content Renderer */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD STREAMLINED LAYOUT */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-6"
            >
              
              {/* TOP STATS ROW GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                
                {/* Card 1: Total Collected Balance & Quick Actions */}
                <div className="min-w-0 w-full box-border transition-all duration-200 hover:-translate-y-0.5">
                  <TotalCollectedActionCard
                    totalCollectedRent={totalCollectedRent}
                    rooms={rooms}
                    onOpenSMSModal={(r) => setSmsTargetRoom(r)}
                    onQuickMarkPaid={handleQuickMarkPaid}
                  />
                </div>

                {/* Card 2: Collection Timeline & Rate Chart */}
                <div className="min-w-0 w-full box-border transition-all duration-200 hover:-translate-y-0.5">
                  <CollectionTimelineCard
                    collectionPercentage={collectionPercentage}
                  />
                </div>

                {/* Card 3: Total Expected Rent Goal Emerald Card */}
                <div className="min-w-0 w-full box-border transition-all duration-200 hover:-translate-y-0.5 sm:col-span-2 lg:col-span-1">
                  <RentOverviewCard
                    totalExpectedRent={totalExpectedRent}
                    totalCollectedRent={totalCollectedRent}
                    paymentSettings={paymentSettings}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                </div>

              </div>

              {/* BOTTOM ROW: Full Width Tenant Rent Status Table */}
              <div className="w-full min-w-0 box-border">
                <TenantStatusTable
                  rooms={filteredRooms}
                  onToggleStatus={handleToggleRoomStatus}
                  onEditRoom={(r) => setEditingRoom(r)}
                  onOpenSMSModal={(r) => setSmsTargetRoom(r)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onFilterChange={setStatusFilter}
                  onOpenAddModal={() => setIsAddTenantOpen(true)}
                />
              </div>

            </motion.div>
          )}

          {/* TAB 2: ROOMS FULL VIEW */}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="min-w-0 w-full box-border transition-all duration-200 hover:-translate-y-0.5">
                    <RoomCard
                      room={room}
                      onToggleStatus={handleToggleRoomStatus}
                      onEditRoom={(r) => setEditingRoom(r)}
                      onOpenSMSModal={(r) => setSmsTargetRoom(r)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SMS LOGS AUDIT VIEW */}
          {activeTab === 'sms-logs' && (
            <motion.div
              key="sms-logs-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full min-w-0 box-border"
            >
              <SMSHistoryView
                logs={smsLogs}
                onClearLogs={handleClearSMSLogs}
                onRunAutomation={handleRunDailyAutomation}
                isTestingAutomation={isTestingAutomation}
                autoSmsEnabled={paymentSettings.autoSmsEnabled}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Modals & Overlay Components */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAddRoom={handleAddRoom}
      />

      <EditRoomModal
        room={editingRoom}
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={handleSaveRoom}
      />

      <SMSModal
        room={smsTargetRoom}
        isOpen={!!smsTargetRoom}
        onClose={() => setSmsTargetRoom(null)}
        paymentSettings={paymentSettings}
        onAddSMSLog={addSMSLog}
        onShowToast={showToast}
      />

      <PaymentSettingsModal
        settings={paymentSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={savePaymentSettings}
        onRunTestAutomation={handleRunDailyAutomation}
        isTestingAutomation={isTestingAutomation}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/10 py-6 text-center text-xs text-zinc-500 dark:text-slate-400 mt-auto">
        <p>Begize • Rental & Collection Management System</p>
      </footer>

    </div>
  );
}
