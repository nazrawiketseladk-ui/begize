'use client';

import React, { useState } from 'react';
import { X, Send, Smartphone, Copy, Check, MessageSquare } from 'lucide-react';
import { Room, PaymentSetting, SMSLog } from '../types';

interface SMSModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  paymentSettings: PaymentSetting;
  onAddSMSLog: (log: SMSLog) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SMSModal: React.FC<SMSModalProps> = ({
  room,
  isOpen,
  onClose,
  paymentSettings,
  onAddSMSLog,
  onShowToast,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !room) return null;

  const formattedAmount = room.rentAmount.toLocaleString();
  const dueDateText = `Day ${room.dueDay}`;

  // Payment destination string
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

  // Native phone SMS launch (sms: URI)
  const handleOpenNativeSMS = async () => {
    const cleanPhone = room.phone.replace(/\s+/g, '');
    const encodedBody = encodeURIComponent(generatedMessage);
    const smsUrl = `sms:${cleanPhone}?body=${encodedBody}`;
    
    window.location.href = smsUrl;

    const newLog: SMSLog = {
      id: `sms-native-${Date.now()}`,
      recipientName: room.tenantName,
      roomNumber: room.roomNumber,
      phone: room.phone,
      message: generatedMessage,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered',
      type: 'MANUAL_SMS',
      language: 'en'
    };
    onAddSMSLog(newLog);
    onShowToast('Mobile SMS app opened', 'info');
    onClose();
  };

  // API server call (/api/sms)
  const handleSendAPISMS = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: room.phone,
          recipientName: room.tenantName,
          roomNumber: room.roomNumber,
          amount: room.rentAmount,
          dueDate: dueDateText,
          cbeAccount: includePaymentInfo ? (paymentSettings.bankAccountNumber || paymentSettings.cbeAccount) : '',
          telebirrNumber: includePaymentInfo ? paymentSettings.telebirrNumber : '',
          customNote
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onShowToast(`SMS sent successfully via SMSEthiopia gateway!`, 'success');
        
        const newLog: SMSLog = {
          id: `sms-api-${Date.now()}`,
          recipientName: room.tenantName,
          roomNumber: room.roomNumber,
          phone: room.phone,
          message: generatedMessage,
          sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
          type: 'MANUAL_SMS',
          language: 'en'
        };
        onAddSMSLog(newLog);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to send SMS');
      }
    } catch (err: any) {
      onShowToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Message copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-[28px] border border-white/15 w-full max-w-lg mx-auto my-auto max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">SMS Reminder</h3>
              <p className="text-xs text-blue-100 font-medium">Room {room.roomNumber} - {room.tenantName}</p>
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
          
          {/* Recipient summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs gap-2">
            <div>
              <span className="text-slate-400 block">Recipient:</span>
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
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/20 bg-slate-950"
            />
            <label htmlFor="includePayment" className="text-xs font-medium text-slate-300">
              Include Bank & Telebirr payment details in SMS
            </label>
          </div>

          {/* Additional note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Note:
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
              placeholder="e.g. Please send payment receipt after deposit..."
            />
          </div>

          {/* Generated Message Preview */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400">
                Message Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 text-xs font-sans whitespace-pre-wrap border border-white/10 leading-relaxed shadow-inner">
              {generatedMessage}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            
            {/* Direct Mobile SMS Button (Free) */}
            <button
              type="button"
              onClick={handleOpenNativeSMS}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open in Phone Messages (Free)</span>
            </button>

            {/* API / Server Send Button */}
            <button
              type="button"
              onClick={handleSendAPISMS}
              disabled={isSending}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending via Gateway...' : 'Send via SMSEthiopia API'}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
