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
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-black/5 dark:border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-200 hover:border-emerald-500/30">
      
      {/* Top Header Section */}
      <div className="space-y-3">
        
        {/* Room Header */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/10 border border-black/5 dark:border-white/15 flex items-center justify-center font-black text-zinc-900 dark:text-white text-lg shrink-0">
            {room.roomNumber}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Room / Unit {room.roomNumber}
            </span>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-base line-clamp-1">
              {room.tenantName}
            </h3>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/[0.08]">
          
          {/* Phone Link */}
          <a
            href={`tel:${room.phone}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#0D7B50] dark:text-emerald-400 shrink-0" />
            <span className="truncate font-mono">{room.phone}</span>
          </a>

          {/* Monthly Reminder Day */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-slate-300 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Reminder: <strong className="font-bold">Day {room.dueDay}</strong></span>
          </div>

        </div>

        {/* Rent Amount */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-zinc-500 dark:text-slate-400 block font-medium">Monthly Rent Amount</span>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-white">
              {room.rentAmount.toLocaleString()} <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
            </div>
          </div>
        </div>

        {room.notes && (
          <p className="text-xs text-zinc-600 dark:text-slate-400 bg-zinc-50 dark:bg-white/5 p-2 rounded-xl italic border border-black/5 dark:border-white/5">
            "{room.notes}"
          </p>
        )}

      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-black/5 dark:border-white/[0.08]">
        
        {/* SMS Reminder Template Preview */}
        <button
          onClick={() => onOpenSMSModal(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all shadow-sm"
          title="Preview SMS Template"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS Template</span>
        </button>

        {/* Edit Room Button */}
        <button
          onClick={() => onEditRoom(room)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-slate-200 border border-black/5 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 transition-all shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-500 dark:text-slate-400" />
          <span>Edit Tenant</span>
        </button>

      </div>

    </div>
  );
};
