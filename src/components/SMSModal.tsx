'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';
import { Room, PaymentSetting } from '../types';

interface SMSModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  paymentSettings: PaymentSetting;
  onAddSMSLog?: (log: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SMSModal: React.FC<SMSModalProps> = ({
  room,
  isOpen,
  onClose,
  paymentSettings,
  onShowToast,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !room) return null;

  const formattedAmount = room.rentAmount.toLocaleString();
  const dueDateText = `Day ${room.dueDay}`;

  // Payment destination string constructed from landlord's saved details
  let paymentDestText = '';
  if (includePaymentInfo && (paymentSettings.bankAccountNumber || paymentSettings.cbeAccount || paymentSettings.telebirrNumber)) {
    const parts: string[] = [];
    if (paymentSettings.telebirrNumber) {
      parts.push(`Telebirr: ${paymentSettings.telebirrNumber}`);
    }
    const bankName = paymentSettings.bankName || 'CBE';
    const bankAcc = paymentSettings.bankAccountNumber || paymentSettings.cbeAccount;
    const holder = paymentSettings.accountHolderName;
    if (bankAcc) {
      parts.push(`${bankName}: ${bankAcc}${holder ? ` (${holder})` : ''}`);
    }
    paymentDestText = `\nክፍያ በ ${parts.join(' ወይም ')} መላክ ይችላሉ።`;
  }

  const generatedMessage = `Hello ${room.tenantName}, your monthly rent for Room ${room.roomNumber} (${formattedAmount} ETB) is due on ${dueDateText}.${paymentDestText}${customNote ? `\nNote: ${customNote}` : ''}\nThank you!`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('SMS template copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-[28px] border border-white/15 w-full max-w-lg mx-auto my-auto max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Automated SMS Template Preview</h3>
              <p className="text-xs text-emerald-100 font-medium">Room {room.roomNumber} • {room.tenantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          
          {/* Automation Info Alert */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>SMS reminders for this room are dispatched automatically 24/7 via daily cloud cron schedule.</span>
          </div>

          {/* Recipient summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs gap-2">
            <div>
              <span className="text-slate-400 block">Tenant Recipient:</span>
              <strong className="text-white font-bold text-sm">{room.tenantName}</strong>
            </div>
            <div className="text-left sm:text-right font-mono text-emerald-400 font-semibold">
              {room.phone}
            </div>
          </div>

          {/* Payment Info Inclusion Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includePayment"
              checked={includePaymentInfo}
              onChange={(e) => setIncludePaymentInfo(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-white/20 bg-slate-950"
            />
            <label htmlFor="includePayment" className="text-xs font-medium text-slate-300">
              Include landlord Bank & Telebirr payment instructions in template
            </label>
          </div>

          {/* Additional note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Message Note:
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Please send payment receipt after deposit..."
            />
          </div>

          {/* Generated Message Preview */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">
                Live SMS Message Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 text-xs font-sans whitespace-pre-wrap border border-white/10 leading-relaxed shadow-inner">
              {generatedMessage}
            </pre>
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Template Copied!' : 'Copy Template Text'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
