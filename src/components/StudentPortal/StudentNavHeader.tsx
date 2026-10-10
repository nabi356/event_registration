"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  LogOut,
  Camera,
  Bell,
  Sparkles,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export function StudentNavHeader() {
  const router = useRouter();
  const {
    currentUser,
    logoutUser,
    deleteAccount,
    setIsFaceEnrollModalOpen,
    setFaceEnrollUpdateMode,
    withdrawBiometricConsent,
  } = useEventSystem();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const handleSignOut = () => {
    logoutUser();
    router.push('/');
  };

  const handleUpdateFaceClick = () => {
    setFaceEnrollUpdateMode(true);
    setIsFaceEnrollModalOpen(true);
    setShowProfileMenu(false);
  };

  const handleInitialFaceEnroll = () => {
    setFaceEnrollUpdateMode(false);
    setIsFaceEnrollModalOpen(true);
  };

  const hasFaceEnrolled = currentUser?.hasFaceEnrolled ?? false;
  const studentName = currentUser?.name || 'Guest Student';
  const studentId = currentUser?.enrollmentNo || 'Unregistered';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-violet-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-950/40 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => router.push('/')}
                className="text-white font-bold text-base tracking-tight cursor-pointer"
              >
                Eventra
              </span>
              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Student Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Zero-Trust Digital Pass & Gate Tokens
            </p>
          </div>
        </div>

        {/* Right side: Actions, Notifications & Profile Menu */}
        <div className="flex items-center gap-3">
          {/* If user is management, show quick link to Management Suite */}
          {currentUser?.role === 'management' && (
            <button
              onClick={() => router.push('/management')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors cursor-pointer"
            >
              <span>Management Suite →</span>
            </button>
          )}

          {/* Face scan biometric status pill */}
          {currentUser && (
            hasFaceEnrolled ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Face Enrolled</span>
              </span>
            ) : (
              <button
                onClick={handleInitialFaceEnroll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Enroll Face Scan</span>
              </button>
            )
          )}

          {/* Guest Sign In button if not logged in */}
          {!currentUser ? (
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <span>Sign In / Register</span>
            </button>
          ) : (
            <>
              {/* Notifications Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) setUnreadCount(0);
                  }}
                  className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.15] transition-all cursor-pointer"
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

              {/* Student Profile & Sign Out dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 py-1 pr-2 rounded-xl hover:bg-white/[0.04] border-l border-white/[0.08] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-xs font-semibold text-white shadow-inner">
                    {studentName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {studentName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono leading-tight">
                      {studentId}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F172A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <span className="text-xs font-bold text-white block">{studentName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{studentId}</span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {currentUser?.email}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={handleUpdateFaceClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Update Face Biometrics</span>
                  </button>

                  {hasFaceEnrolled && (
                    <button
                      onClick={() => {
                        if (confirm('Withdraw biometric consent and permanently delete your enrolled face embedding? (You can continue checking in using your dynamic QR pass)')) {
                          withdrawBiometricConsent();
                          setShowProfileMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Withdraw Biometric Consent</span>
                    </button>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>Sign Out</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Permanently delete account and erase biometric face embeddings?')) {
                        deleteAccount().then(() => router.push('/'));
                        setShowProfileMenu(false);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors text-left pt-2 border-t border-white/[0.06] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
</header>
  );
}
