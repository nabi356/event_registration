"use client";

import React, { useState } from 'react';
import { Search, UserCheck, AlertTriangle, ShieldCheck, Download, Filter } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

const MOCK_ATTENDEE_DIRECTORY = [
  { id: 'att-1', name: 'K. Nabidul Hasan', studentId: 'UNI-2026-8472', ticket: 'EVT-2026-STUDENT-8472', dept: 'CS & AI', tier: 'Tier 1 Priority', status: 'Confirmed' },
  { id: 'att-2', name: 'Aarav Shah', studentId: 'UNI-2026-8473', ticket: 'EVT-10482', dept: 'Software Eng', tier: 'General', status: 'Checked In' },
  { id: 'att-3', name: 'Riya Patel', studentId: 'UNI-2026-8474', ticket: 'EVT-10481', dept: 'Data Science', tier: 'General', status: 'Checked In' },
  { id: 'att-4', name: 'Unknown Device', studentId: 'ANON-UNVERIFIED', ticket: 'EVT-10479', dept: 'External', tier: 'Unverified', status: 'Flagged' },
  { id: 'att-5', name: 'Elena Rostova', studentId: 'UNI-2026-8475', ticket: 'EVT-10478', dept: 'Robotics', tier: 'VIP Speaker', status: 'Checked In' },
  { id: 'att-6', name: 'Marcus Vance', studentId: 'UNI-2026-8476', ticket: 'EVT-10476', dept: 'Cybersecurity', tier: 'General', status: 'Flagged' },
  { id: 'att-7', name: 'Sofia Chen', studentId: 'UNI-2026-8477', ticket: 'EVT-10475', dept: 'Bio-Informatics', tier: 'General', status: 'Checked In' },
  { id: 'att-8', name: 'Zayn Malik', studentId: 'UNI-2026-8478', ticket: 'EVT-10472', dept: 'Electrical Eng', tier: 'Tier 1 Priority', status: 'Confirmed' },
  { id: 'att-9', name: 'Devika Sharma', studentId: 'UNI-2026-8479', ticket: 'EVT-10470', dept: 'AI Ethics', tier: 'General', status: 'Confirmed' },
];

export function AttendeesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useEventSystem();

  const filtered = MOCK_ATTENDEE_DIRECTORY.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticket.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    addToast('info', 'Export Generated', 'Attendee verification roster saved to CSV cache');
  };

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Attendee Directory</h2>
          <p className="text-xs text-slate-400">All registered attendees and real-time pass credentials</p>
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
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pl-2">Attendee Name</th>
              <th className="pb-3">Student ID</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Ticket ID</th>
              <th className="pb-3">Tier</th>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
