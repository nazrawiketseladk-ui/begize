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
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900/60 p-6 overflow-hidden min-w-0 box-border border border-slate-100 dark:border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all">
      
      {/* Header & Controls Alignment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 w-full">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tenant Roster & Scheduled Reminders
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">Monthly Reminder Schedule Table</h3>
        </div>

        {/* Controls: Search Pill Input */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E8A5E]"
              placeholder="Search by tenant name, room, or phone..."
            />
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/[0.08]">
        {rooms.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-white/[0.08] font-bold uppercase text-[10px] tracking-wider bg-slate-50/80 dark:bg-white/[0.02]">
                <th className="px-5 py-3.5 text-xs whitespace-nowrap w-28">Room #</th>
                <th className="px-5 py-3.5 text-xs whitespace-nowrap min-w-[180px]">Tenant Name & Phone</th>
                <th className="px-5 py-3.5 text-xs whitespace-nowrap w-48">Monthly Reminder Day</th>
                <th className="px-5 py-3.5 text-xs text-right whitespace-nowrap w-40">Monthly Rent</th>
                <th className="px-5 py-3.5 text-xs text-center whitespace-nowrap w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {rooms.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.04] transition-colors duration-200 group">
                    
                    {/* Room Number Badge */}
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200/50 dark:border-white/15 flex items-center justify-center font-black text-slate-800 dark:text-white text-base shadow-xs">
                        {room.roomNumber}
                      </div>
                    </td>

                    {/* Tenant Avatar, Name & Phone */}
                    <td className="px-5 py-4 text-sm min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0E8A5E] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                          {room.tenantName.charAt(0)}
                        </div>
                        <div>
                          <div
                            onClick={() => onEditRoom(room)}
                            className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-[#0E8A5E] dark:group-hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {room.tenantName}
                          </div>
                          <a href={`tel:${room.phone}`} className="text-xs font-mono text-slate-400 dark:text-slate-400 hover:underline">
                            {room.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Reminder Day */}
                    <td className="px-5 py-4 text-sm whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-[#0E8A5E] dark:text-emerald-300 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#0E8A5E] dark:text-emerald-400" />
                        <span>Day {room.dueDay} of month</span>
                      </div>
                    </td>

                    {/* Rent Amount */}
                    <td className="px-5 py-4 text-sm text-right whitespace-nowrap font-black text-slate-900 dark:text-white text-base">
                      {room.rentAmount.toLocaleString()} <span className="text-xs font-bold text-[#0E8A5E] dark:text-emerald-400">ETB</span>
                    </td>

                    {/* Actions: Edit, Preview Template, Delete */}
                    <td className="px-5 py-4 text-sm text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onEditRoom(room)}
                          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs"
                          title="Edit Tenant Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Preview SMS Template */}
                        <button
                          onClick={() => onOpenSMSModal(room)}
                          className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-[#0E8A5E] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-all font-bold text-xs flex items-center gap-1.5 shadow-xs"
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
                            className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all shadow-xs"
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
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-[#0E8A5E] dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">No Tenant Rooms Added Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Get started by adding your first tenant room for automated monthly due day SMS reminders.
              </p>
            </div>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#0E8A5E] hover:bg-[#0B6E4A] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all"
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
