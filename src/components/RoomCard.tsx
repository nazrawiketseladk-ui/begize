'use client';

import React from 'react';
import { Phone, Calendar, Edit3, MessageSquare, Check, X, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onToggleStatus: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onOpenSMSModal: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onToggleStatus,
  onEditRoom,
  onOpenSMSModal,
}) => {
  const getBadgeStyle = (status: Room['status']) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 border-[#0D7B50]/20 dark:border-emerald-500/30',
          dot: 'bg-[#0D7B50] dark:bg-emerald-400',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Paid'
        };
      case 'due-soon':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
          dot: 'bg-amber-500 dark:bg-amber-400',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Due Soon'
        };
      case 'overdue':
        return {
          bg: 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30',
          dot: 'bg-red-600 dark:bg-red-500 animate-ping',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Overdue'
        };
    }
  };

  const badge = getBadgeStyle(room.status);

  return (
    <div className={`fintech-card p-5 flex flex-col justify-between transition-all duration-200 ${
      room.status === 'overdue' 
        ? 'border-red-400/50 ring-1 ring-red-400/20' 
        : room.status === 'due-soon'
        ? 'border-amber-400/50'
        : 'border-black/5 dark:border-white/15'
    }`}>
      
      {/* Top Header Section */}
      <div className="space-y-3">
        
        {/* Room Header & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/10 border border-black/5 dark:border-white/15 flex items-center justify-center font-black text-zinc-900 dark:text-white text-lg">
              {room.roomNumber}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                Room Number
              </span>
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base line-clamp-1">
                {room.tenantName}
              </h3>
            </div>
          </div>

          {/* Visual Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/10">
          
          {/* Phone Link */}
          <a
            href={`tel:${room.phone}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#0D7B50] dark:text-emerald-400 shrink-0" />
            <span className="truncate font-mono">{room.phone}</span>
          </a>

          {/* Due Day of Month */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-300 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Due: <strong className="font-bold">Day {room.dueDay}</strong></span>
          </div>

        </div>

        {/* Rent Amount & Last Paid Date */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-zinc-500 dark:text-slate-400 block font-medium">Monthly Rent</span>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
              {room.rentAmount.toLocaleString()} <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
            </div>
          </div>

          {room.lastPaidDate && (
            <span className="text-[11px] text-zinc-500 dark:text-slate-400 italic">
              Last paid: {room.lastPaidDate}
            </span>
          )}
        </div>

        {room.notes && (
          <p className="text-xs text-zinc-600 dark:text-slate-400 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl italic border border-black/5 dark:border-white/5">
            "{room.notes}"
          </p>
        )}

      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-black/5 dark:border-white/10">
        
        {/* Toggle Paid Button */}
        <button
          onClick={() => onToggleStatus(room.id)}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            room.status === 'paid'
              ? 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-white/20'
              : 'bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold'
          }`}
        >
          {room.status === 'paid' ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Mark Unpaid</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark Paid</span>
            </>
          )}
        </button>

        {/* SMS Reminder Button */}
        <button
          onClick={() => onOpenSMSModal(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/30 border border-blue-200 dark:border-blue-500/30 transition-colors"
          title="Send SMS Reminder"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send SMS</span>
        </button>

        {/* Edit Room Button */}
        <button
          onClick={() => onEditRoom(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
          <span>Edit</span>
        </button>

      </div>

    </div>
  );
};
