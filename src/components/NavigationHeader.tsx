"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, LayoutDashboard, Sliders, RefreshCw } from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

interface NavigationHeaderProps {
  onOpenDemoToolbar?: () => void;
}

export function NavigationHeader({ onOpenDemoToolbar }: NavigationHeaderProps) {
  const { viewMode, setViewMode, resetDemoStats, currentUser, setIsAuthModalOpen } = useEventSystem();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-violet-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-950/40">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base tracking-tight">
                Eventra
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise Pass
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Campus Event & Access Management
            </p>
          </div>
        </div>

        {/* Polished View Switcher: Student | Management */}
        <div className="flex items-center bg-[#131B2E]/90 p-1 rounded-xl border border-white/[0.08] shadow-inner">
          <button
            id="toggle-student-view"
            onClick={() => setViewMode('student')}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
              viewMode === 'student' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {viewMode === 'student' && (
              <motion.div
                layoutId="viewModePill"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-md shadow-blue-900/50"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Student</span>
            </span>
          </button>

          <button
            id="toggle-management-view"
            onClick={() => setViewMode('management')}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
              viewMode === 'management' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {viewMode === 'management' && (
              <motion.div
                layoutId="viewModePill"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-indigo-900/50"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Management</span>
            </span>
          </button>
        </div>

        {/* Diagnostic Tools, Auth & Terminal Actions */}
        <div className="flex items-center gap-2">
          {/* Account profile / Auth toggle button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
            title="Switch User / Sign In"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {onOpenDemoToolbar && (
            <button
              onClick={onOpenDemoToolbar}
              title="Terminal Diagnostics & Security Controls"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Terminal Tools</span>
            </button>
          )}

          <button
            onClick={resetDemoStats}
            title="Reset Operational Baseline"
            className="p-1.5 rounded-lg text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
