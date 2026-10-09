"use client";

import React, { useState } from 'react';
import {
  Bell,
  Check,
  Sparkles,
  Camera,
  ShieldCheck,
  User,
  LogOut,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function StudentHeader() {
  const {
    currentUser,
    setIsAuthModalOpen,
    setIsFaceEnrollModalOpen,
    setFaceEnrollUpdateMode,
    logoutUser,
    deleteAccount,
  } = useEventSystem();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Dynamic QR Pass Synchronized',
      desc: '10-second rotating cryptographic token active with perimeter validation.',
      time: 'Just now',
    },
    {
      id: 'notif-2',
      title: 'Campus Perimeter Enforced',
      desc: 'Local venue geofence (50m) active for contactless gate entry.',
      time: '1h ago',
    },
  ];

  if (!currentUser) {
    return (
      <div className="relative mb-8 p-6 rounded-3xl glass-panel border border-white/[0.08] bg-gradient-to-r from-blue-950/30 via-slate-900/40 to-indigo-950/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Campus Digital Pass Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Student Event Pass Gateway
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Sign in with your university student account or create a profile to view your registered tickets, manage face biometrics, and generate dynamic gate entry tokens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const studentName = currentUser.name;
  const studentId = currentUser.enrollmentNo;
  const department = currentUser.department || currentUser.university || 'Enrolled Student';
  const enrolledYear = currentUser.enrolledYear || 'Active Passholder';
  const hasFaceEnrolled = currentUser.hasFaceEnrolled ?? false;

  const handleUpdateFaceClick = () => {
    setFaceEnrollUpdateMode(true);
    setIsFaceEnrollModalOpen(true);
    setShowProfileMenu(false);
  };

  const handleInitialFaceEnroll = () => {
    setFaceEnrollUpdateMode(false);
    setIsFaceEnrollModalOpen(true);
  };

  return (
    <div className="relative mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Welcome Text */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Active Passholder
            </span>

            {/* Face scan biometric status pill */}
            {hasFaceEnrolled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Face Biometric Enrolled</span>
              </span>
            ) : (
              <button
                onClick={handleInitialFaceEnroll}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Camera className="w-3 h-3 text-amber-400" />
                <span>Face Scan Required (Enroll Now)</span>
              </button>
            )}

            <span className="text-xs text-slate-400">· {department}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-slate-100">{studentName}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Zero-trust digital credentials & event gate tokens
          </p>
        </div>

        {/* Profile Avatar & Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
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

          {/* Profile Card & Voluntary Biometric Update Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-xl hover:bg-white/[0.04] border-l border-white/[0.08] transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/[0.12] flex items-center justify-center text-sm font-semibold text-white shadow-inner">
                  {studentName.substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B0F19]" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {studentId}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {enrolledYear}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F172A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <span className="text-xs font-bold text-white block">{studentName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{studentId}</span>
                </div>

                <div className="space-y-1 text-xs">
                  {/* Voluntary Update face scan button */}
                  <button
                    onClick={handleUpdateFaceClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Update face scan</span>
                  </button>

                  {/* Switch user / login */}
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Switch / Sign In</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logoutUser();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>Sign Out</span>
                  </button>

                  {/* Delete Account */}
                  <button
                    onClick={() => {
                      if (confirm('Permanently delete account and erase biometric face embeddings?')) {
                        deleteAccount();
                        setShowProfileMenu(false);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors text-left pt-2 border-t border-white/[0.06]"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Account (Clear Biometrics)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
