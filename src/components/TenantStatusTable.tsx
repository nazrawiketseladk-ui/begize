'use client';

import React from 'react';
import { Room } from '../types';
import { Calendar, MessageSquare, Search, Plus, Home, Edit3, Trash2 } from 'lucide-react';

interface TenantStatusTableProps {
  rooms: Room[];
  onEditRoom: (room: Room) => void;
  onDeleteRoom?: (roomId: string) => void;
  onOpenSMSModal: (room: Room) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal?: () => void;
}

export const TenantStatusTable: React.FC<TenantStatusTableProps> = ({
  rooms,
  onEditRoom,
  onDeleteRoom,
  onOpenSMSModal,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) => {
  return (
    <div className="w-full rounded-[24px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 p-4 sm:p-6 overflow-hidden min-w-0 box-border transition-all">
      
      {/* Header & Controls Alignment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 w-full">
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider block">
            Tenant Roster & Scheduled Reminders
          </span>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">Monthly Reminder Schedule Table</h3>
        </div>

        {/* Controls: Search Input */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-full bg-zinc-100 dark:bg-slate-950/40 border border-black/5 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search by tenant name, room, or phone..."
            />
          </div>
        </div>
      </div>

      {/* Dedicated Scroll Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
        {rooms.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="text-zinc-500 dark:text-slate-400 border-b border-black/5 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider bg-zinc-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-xs whitespace-nowrap w-24">Room #</th>
                <th className="px-4 py-3 text-xs whitespace-nowrap min-w-[160px]">Tenant Name & Phone</th>
                <th className="px-4 py-3 text-xs whitespace-nowrap w-44">Monthly Reminder Day</th>
                <th className="px-4 py-3 text-xs text-right whitespace-nowrap w-36">Monthly Rent</th>
                <th className="px-4 py-3 text-xs text-center whitespace-nowrap w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {rooms.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors group">
                    
                    {/* Room Number Badge */}
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/10 border border-black/5 dark:border-white/15 flex items-center justify-center font-black text-zinc-900 dark:text-white text-base">
                        {room.roomNumber}
                      </div>
                    </td>

                    {/* Tenant Avatar, Name & Phone */}
                    <td className="px-4 py-3 text-sm min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                          {room.tenantName.charAt(0)}
                        </div>
                        <div>
                          <div
                            onClick={() => onEditRoom(room)}
                            className="font-extrabold text-zinc-900 dark:text-white text-sm group-hover:text-[#0D7B50] dark:group-hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {room.tenantName}
                          </div>
                          <a href={`tel:${room.phone}`} className="text-xs font-mono text-zinc-500 dark:text-slate-400 hover:underline">
                            {room.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Reminder Day */}
                    <td className="px-4 py-3 text-sm whitespace-nowrap font-semibold text-zinc-700 dark:text-slate-300">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-[#0D7B50] dark:text-emerald-300 text-xs font-extrabold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Day {room.dueDay} of month</span>
                      </div>
                    </td>

                    {/* Rent Amount */}
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-black text-zinc-900 dark:text-white text-base">
                      {room.rentAmount.toLocaleString()} <span className="text-xs font-bold text-[#0D7B50] dark:text-emerald-400">ETB</span>
                    </td>

                    {/* Actions: Edit, Preview Template, Delete */}
                    <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onEditRoom(room)}
                          className="px-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-white/20 transition-all font-bold text-xs flex items-center gap-1"
                          title="Edit Tenant Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Preview SMS Template */}
                        <button
                          onClick={() => onOpenSMSModal(room)}
                          className="px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-all font-bold text-xs flex items-center gap-1"
                          title="Preview SMS Template"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Template</span>
                        </button>

                        {/* Delete Button */}
                        {onDeleteRoom && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove tenant ${room.tenantName} (Room ${room.roomNumber})?`)) {
                                onDeleteRoom(room.id);
                              }
                            }}
                            className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all"
                            title="Delete Tenant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Empty State Illustration */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F5EE] dark:bg-emerald-500/20 text-[#0D7B50] dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-zinc-900 dark:text-white text-base">No Tenant Rooms Added Yet</h4>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1 max-w-sm">
                Get started by adding your first tenant room for automated monthly due day SMS reminders.
              </p>
            </div>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="mt-2 px-4 py-2 rounded-full bg-[#0D7B50] hover:bg-[#0A6441] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all glow-emerald"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add First Tenant</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
