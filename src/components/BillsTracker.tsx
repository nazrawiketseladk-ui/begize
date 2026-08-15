'use client';

import React, { useState } from 'react';
import { Zap, Droplet, Wifi, Wrench, CheckCircle, Clock, Plus, Trash2, Copy, Check, FileText } from 'lucide-react';
import { Bill, BillCategory } from '../types';

interface BillsTrackerProps {
  bills: Bill[];
  onToggleBillStatus: (billId: string) => void;
  onAddBill: (bill: Bill) => void;
  onDeleteBill: (billId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BillsTracker: React.FC<BillsTrackerProps> = ({
  bills,
  onToggleBillStatus,
  onAddBill,
  onDeleteBill,
  onShowToast,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New bill state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('electricity');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDay, setDueDay] = useState<number | ''>(20);
  const [provider, setProvider] = useState('');

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const getCategoryIcon = (cat: BillCategory) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'water':
        return <Droplet className="w-5 h-5 text-blue-400" />;
      case 'internet':
        return <Wifi className="w-5 h-5 text-indigo-400" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleCopyAccount = (acc: string, id: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast(`Account number ${acc} copied`, 'info');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      onShowToast('Please enter title and amount', 'error');
      return;
    }

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      title,
      category,
      accountNumber: accountNumber || 'N/A',
      amount: Number(amount),
      dueDay: Number(dueDay) || 1,
      isPaid: false,
      provider: provider || 'Utility Provider'
    };

    onAddBill(newBill);
    onShowToast('New utility bill added successfully!', 'success');
    
    setTitle('');
    setAccountNumber('');
    setAmount('');
    setProvider('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-white/15">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Outgoing Utility Bills
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              {totalAmount.toLocaleString()} <span className="text-sm font-semibold text-emerald-400">ETB / Month</span>
            </h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
              <span>Paid: <strong className="text-emerald-400">{paidAmount.toLocaleString()} ETB</strong></span>
              <span>•</span>
              <span>Remaining: <strong className="text-amber-400">{pendingAmount.toLocaleString()} ETB</strong></span>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Bills Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all shadow-sm ${
              bill.isPaid
                ? 'bg-white/[0.04] border-white/5 opacity-80'
                : 'bg-white/[0.08] border-amber-500/30 ring-1 ring-amber-500/20'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                    {getCategoryIcon(bill.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base line-clamp-1">
                      {bill.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {bill.provider}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    bill.isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {bill.isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{bill.isPaid ? 'Paid' : 'Pending'}</span>
                </span>
              </div>

              {/* Bill Details */}
              <div className="space-y-2 py-2 border-t border-b border-white/10 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Account / Meter #:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
                    <span>{bill.accountNumber}</span>
                    <button
                      onClick={() => handleCopyAccount(bill.accountNumber, bill.id)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Copy Account Number"
                    >
                      {copiedId === bill.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-semibold text-slate-200">
                    Day {bill.dueDay} of every month
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-400">Monthly Amount:</span>
                <div className="text-lg font-black text-white">
                  {bill.amount.toLocaleString()} <span className="text-xs font-semibold text-emerald-400">ETB</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-white/10">
              <button
                onClick={() => onToggleBillStatus(bill.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  bill.isPaid
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
                }`}
              >
                {bill.isPaid ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Unpaid</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Paid</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this utility bill?')) {
                    onDeleteBill(bill.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add New Bill Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl border border-white/15 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-base">Add Utility Bill</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  placeholder="e.g. Internet Bill"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BillCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  >
                    <option value="electricity">Electricity</option>
                    <option value="water">Water</option>
                    <option value="internet">Internet (WiFi)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (ETB) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs font-bold text-white"
                    placeholder="2500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono text-white"
                  placeholder="e.g. EEU-102938"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                  placeholder="e.g. Ethio Telecom"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
