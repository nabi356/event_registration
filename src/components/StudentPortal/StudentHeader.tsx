"use client";

import React, { useState } from 'react';
import { Bell, Check, Sparkles } from 'lucide-react';
import { CURRENT_STUDENT } from '@/lib/mockData';

export function StudentHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Doors Open at 5:30 PM',
      desc: 'AI & Future Technologies check-in terminal opens 30 mins prior at Seminar Hall A.',
      time: '10m ago',
    },
    {
      id: 'notif-2',
      title: 'Geo-Fence Active',
      desc: 'Keep location services enabled on your mobile device for zero-contact entry.',
      time: '1h ago',
    },
  ];

  return (
    <div className="relative mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Welcome Text */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Active Passholder
            </span>
            <span className="text-xs text-slate-400">· {CURRENT_STUDENT.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-slate-100">{CURRENT_STUDENT.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your events and tickets
          </p>
        </div>

        {/* Profile Avatar & Notification Button */}
        <div className="flex items-center gap-3">
          {/* Notification Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setUnreadCount(0);
              }}
              className="relative p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.15] transition-all shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md shadow-blue-900/60">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0F172A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Pass Notifications
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Campus Gateway</span>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300/80 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/[0.12] flex items-center justify-center text-sm font-semibold text-white shadow-inner">
                {CURRENT_STUDENT.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {CURRENT_STUDENT.studentId}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {CURRENT_STUDENT.enrolledYear}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
