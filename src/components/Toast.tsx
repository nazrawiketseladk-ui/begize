'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-900/90 text-emerald-100 border-emerald-700',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case 'error':
        return {
          bg: 'bg-red-900/90 text-red-100 border-red-700',
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />
        };
      default:
        return {
          bg: 'bg-slate-900/90 text-slate-100 border-slate-700',
          icon: <Info className="w-4 h-4 text-blue-400" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl text-xs font-medium ${style.bg}`}>
        {style.icon}
        <span>{message}</span>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 ml-2">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
