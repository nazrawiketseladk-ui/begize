'use client';

import React from 'react';
import { Phone, Calendar, Edit3, MessageSquare } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onEditRoom: (room: Room) => void;
  onOpenSMSModal: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEditRoom,
  onOpenSMSModal,
}) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 border border-slate-100 dark:border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all">
      
      {/* Top Header Section */}
      <div className="space-y-3">
        
        {/* Room Header */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/15 flex items-center justify-center font-black text-slate-800 dark:text-white text-lg shrink-0 shadow-xs">
            {room.roomNumber}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Room / Unit {room.roomNumber}
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base line-clamp-1">
              {room.tenantName}
            </h3>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
          
          {/* Phone Link */}
          <a
            href={`tel:${room.phone}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#0E8A5E] dark:text-emerald-400 shrink-0" />
            <span className="truncate font-mono">{room.phone}</span>
          </a>

          {/* Monthly Reminder Day */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#0E8A5E] dark:text-emerald-400 shrink-0" />
            <span>Reminder: <strong className="font-bold">Day {room.dueDay}</strong></span>
          </div>

        </div>

        {/* Rent Amount */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Monthly Rent Amount</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {room.rentAmount.toLocaleString()} <span className="text-xs font-bold text-[#0E8A5E] dark:text-emerald-400">ETB</span>
            </div>
          </div>
        </div>

        {room.notes && (
          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-2xl italic border border-slate-100 dark:border-white/5">
            "{room.notes}"
          </p>
        )}

      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
        
        {/* SMS Reminder Template Preview */}
        <button
          onClick={() => onOpenSMSModal(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-[#0E8A5E] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-all shadow-xs"
          title="Preview SMS Template"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS Template</span>
        </button>

        {/* Edit Room Button */}
        <button
          onClick={() => onEditRoom(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          <span>Edit Tenant</span>
        </button>

      </div>

    </div>
  );
};
