"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  X,
  Sun,
  Moon,
  Camera,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Trash2,
  Bell,
  Ticket,
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
    theme,
    toggleTheme,
    studentSearch,
    setStudentSearch,
    myRegistrations,
  } = useEventSystem();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Digital Pass Ready',
      desc: 'Your entry pass is active. Show the secure QR code at the gate scanner.',
      time: 'Active',
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
    <header className="sticky top-0 z-40 w-full border-b-2 border-red-500/25 bg-black/75 dark:bg-[#0B0A0E]/85 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-red-800 border-2 border-red-500/50 flex items-center justify-center text-white shadow-lg shadow-red-950/50 cursor-pointer transition-transform hover:scale-105"
            title="Eventra Home"
          >
            <Shield className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => router.push('/')}
                className="font-black text-lg tracking-wider uppercase text-white cursor-pointer"
              >
                Eventra
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-red-600/20 text-red-400 border border-red-600/40">
                Student
              </span>
            </div>
            <p className="text-[10px] text-amber-400 font-semibold hidden md:block tracking-wide">
              Campus Events & Gate Passes
            </p>
          </div>
        </div>

        {/* Global Search Bar (Student Portal) */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search events, venues, categories..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-black/40 dark:bg-[#161218]/90 border border-red-500/30 hover:border-red-500/50 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
            {studentSearch && (
              <button
                onClick={() => setStudentSearch('')}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Tasks, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Active Passes Count Pill */}
          {currentUser && myRegistrations.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>{myRegistrations.length} Passes</span>
            </div>
          )}

          {/* Biometric Face Status Pill */}
          {currentUser && (
            hasFaceEnrolled ? (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-600/15 text-red-300 border border-red-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Face ID Ready</span>
              </span>
            ) : (
              <button
                onClick={handleInitialFaceEnroll}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-900/30 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Setup Face ID</span>
              </button>
            )
          )}

          {/* Management Suite shortcut if management role */}
          {currentUser?.role === 'management' && (
            <button
              onClick={() => router.push('/management')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-amber-300 transition-colors cursor-pointer"
            >
              <span>Management Suite →</span>
            </button>
          )}

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] dark:border-red-500/20 text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) setUnreadCount(0);
                }}
                className="relative p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] dark:border-red-500/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md shadow-red-900/60">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-panel-dark absolute right-0 mt-2 w-80 rounded-2xl bg-[#140F18] border-2 border-red-500/30 shadow-2xl backdrop-blur-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-wider !text-white">
                        Pass Notifications
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">Live</span>
                  </div>

                  <div className="space-y-2.5">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white/[0.04] border border-red-500/15 hover:border-red-500/35 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold !text-white">{item.title}</p>
                          <span className="text-[10px] text-amber-400 font-mono font-semibold">{item.time}</span>
                        </div>
                        <p className="text-[11px] !text-white/90 mt-1 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Profile Dropdown */}
          {!currentUser ? (
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-xs font-bold !text-white shadow-md shadow-red-950/40 transition-all cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 py-1 pr-2 rounded-xl hover:bg-white/[0.04] border-l border-red-500/20 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-700 via-rose-600 to-amber-600 border border-amber-400/30 flex items-center justify-center text-xs font-bold !text-white shadow-inner">
                  {studentName.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-black dark:text-white leading-tight">
                    {studentName}
                  </div>
                  <div className="text-[10px] text-amber-500 dark:text-amber-400 font-mono font-semibold leading-tight">
                    {studentId}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="dropdown-panel-dark absolute right-0 mt-2 w-64 rounded-2xl bg-[#140F18] border-2 border-red-500/30 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <span className="text-xs font-bold !text-white block">{studentName}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">{studentId}</span>
                    <span className="text-[10px] !text-white/80 block truncate mt-0.5">
                      {currentUser?.email}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={handleUpdateFaceClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl !text-white hover:bg-red-600/20 transition-colors text-left cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-red-400" />
                      <span className="!text-white font-medium">Update Face Biometrics</span>
                    </button>

                    {hasFaceEnrolled && (
                      <button
                        onClick={() => {
                          if (confirm('Withdraw biometric consent and erase your stored face embedding? (You can continue checking in using your QR ticket)')) {
                            withdrawBiometricConsent();
                            setShowProfileMenu(false);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl !text-amber-300 hover:bg-amber-500/15 transition-colors text-left cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span className="!text-amber-300 font-medium">Withdraw Biometric Consent</span>
                      </button>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl !text-white hover:bg-white/[0.08] transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span className="!text-white font-medium">Sign Out</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Permanently delete account and erase biometric face embeddings?')) {
                          deleteAccount().then(() => router.push('/'));
                          setShowProfileMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl !text-rose-300 hover:bg-rose-500/15 transition-colors text-left pt-2 border-t border-white/[0.08] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span className="!text-rose-300 font-medium">Delete Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
