"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, UserCheck } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function AttendeesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedEvent, exportAttendeesCsv, token } = useEventSystem();

  const fetchAttendees = async () => {
    if (!selectedEvent?.id) return;
    setIsLoading(true);
    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('eventra_token') : '');
      const res = await fetch(`/api/registrations/attendees?eventId=${selectedEvent.id}`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [selectedEvent?.id]);

  const filtered = attendees.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticket?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Attendee Directory</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {filtered.length} Attendees
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {selectedEvent?.name || 'Selected Event'} · Real-time pass roster and check-in statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID, or ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={fetchAttendees}
            title="Refresh Roster"
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportAttendeesCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pl-2">Attendee Name</th>
              <th className="pb-3">Enrollment ID</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Ticket Ref</th>
              <th className="pb-3">Seat Tier</th>
              <th className="pb-3 pr-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((att) => (
              <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pl-2 font-semibold text-white">{att.name}</td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">{att.studentId}</td>
                <td className="py-3 text-slate-300">{att.dept}</td>
                <td className="py-3 font-mono text-blue-300 text-[11px]">{att.ticket}</td>
                <td className="py-3 text-slate-400">{att.tier}</td>
                <td className="py-3 pr-2 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      att.status === 'Checked In'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : att.status === 'Flagged'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {att.status}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  {isLoading ? 'Loading attendee roster...' : 'No attendees found for this event.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
