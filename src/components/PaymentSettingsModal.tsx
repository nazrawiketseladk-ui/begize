'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Building, Smartphone, User, Play, Clock, Phone, Bell, CreditCard, MessageSquare } from 'lucide-react';
import { PaymentSetting } from '../types';

interface PaymentSettingsModalProps {
  settings: PaymentSetting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PaymentSetting) => void;
  onRunTestAutomation?: () => void;
  isTestingAutomation?: boolean;
}

const BANK_OPTIONS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Bank of Abyssinia',
  'Awash Bank',
  'Dashen Bank',
  'Berhan Bank',
  'Nib Bank',
  'Cooperative Bank of Oromia',
  'Other'
];

const DEFAULT_TEMPLATE = "ሰላም {tenant_name}፣ የክፍል {room_number} የዚህ ወር ኪራይ {amount} ETB ዛሬ መከፈል አለበት። ክፍያ: {payment_details}። እናመሰግናለን!";

export const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
  onRunTestAutomation,
  isTestingAutomation = false,
}) => {
  const [telebirrNumber, setTelebirrNumber] = useState('');
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [smsTemplate, setSmsTemplate] = useState(DEFAULT_TEMPLATE);
  const [preferredAlertTime, setPreferredAlertTime] = useState('09:00');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);

  useEffect(() => {
    if (settings) {
      setTelebirrNumber(settings.telebirrNumber || '');
      setBankName(settings.bankName || 'Commercial Bank of Ethiopia (CBE)');
      setBankAccountNumber(settings.bankAccountNumber || settings.cbeAccount || '');
      setAccountHolderName(settings.accountHolderName || '');
      setLandlordPhone(settings.landlordPhone || '');
      setSmsTemplate(settings.smsTemplate || DEFAULT_TEMPLATE);
      setPreferredAlertTime(settings.preferredAlertTime || '09:00');
      setAutoSmsEnabled(settings.autoSmsEnabled !== undefined ? settings.autoSmsEnabled : true);
    }
  }, [settings]);

  if (!isOpen) return null;

  const insertPlaceholder = (tag: string) => {
    setSmsTemplate((prev) => prev + tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cbeAccount: bankAccountNumber.trim(),
      telebirrNumber: telebirrNumber.trim(),
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      landlordPhone: landlordPhone.trim(),
      smsTemplate: smsTemplate.trim() || DEFAULT_TEMPLATE,
      preferredAlertTime,
      autoSmsEnabled
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-[28px] border border-white/15 w-full max-w-lg mx-auto my-auto max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base">Payment & SMS Reminder Settings</h3>
            <p className="text-xs text-emerald-100 font-medium">Configure landlord payment accounts & monthly SMS template</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          
          {/* Landlord Full / Account Holder Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Account Holder Name</span>
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              placeholder="e.g. Abebe Kebede"
              required
            />
          </div>

          {/* Telebirr & Bank Name Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telebirr Number</span>
              </label>
              <input
                type="text"
                value={telebirrNumber}
                onChange={(e) => setTelebirrNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                placeholder="0911234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                <span>Primary Bank</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
              >
                {BANK_OPTIONS.map((bank) => (
                  <option key={bank} value={bank} className="bg-slate-900 text-white">
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bank Account Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bank Account Number</span>
            </label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
              placeholder="1000 4829 1048"
            />
          </div>

          {/* SECTION: MONTHLY REMINDER MESSAGE TEMPLATE */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Monthly Reminder Message Template</span>
              </label>
              <button
                type="button"
                onClick={() => setSmsTemplate(DEFAULT_TEMPLATE)}
                className="text-[11px] text-emerald-400 hover:underline font-bold"
              >
                Reset Default
              </button>
            </div>

            {/* Template Textarea */}
            <textarea
              rows={3}
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              placeholder="Enter custom message template..."
            />

            {/* Available Placeholders Pills */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Click to insert placeholder tag:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  '{tenant_name}',
                  '{room_number}',
                  '{amount}',
                  '{due_date}',
                  '{payment_details}'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertPlaceholder(tag)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] font-mono border border-white/10 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Automation Settings Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>24/7 Daily SMS Automation</span>
              </h4>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-300">
                  {autoSmsEnabled ? 'Active' : 'Disabled'}
                </label>
                <input
                  type="checkbox"
                  checked={autoSmsEnabled}
                  onChange={(e) => setAutoSmsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-white/20 bg-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Landlord Phone for Alerts</span>
                </label>
                <input
                  type="tel"
                  value={landlordPhone}
                  onChange={(e) => setLandlordPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  placeholder="0911002233"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Preferred Daily Alert Time</span>
                </label>
                <input
                  type="time"
                  value={preferredAlertTime}
                  onChange={(e) => setPreferredAlertTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            {onRunTestAutomation && (
              <button
                type="button"
                onClick={onRunTestAutomation}
                disabled={isTestingAutomation}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTestingAutomation ? 'Running Daily Automation...' : 'Test Daily Automation Routine Now'}</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
