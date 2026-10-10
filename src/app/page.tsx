"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  GraduationCap,
  Building,
  Mail,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export default function UnifiedGatewayPage() {
  const router = useRouter();
  const { currentUser, loginUser, logoutUser, events, theme, toggleTheme } = useEventSystem();

  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [role, setRole] = useState<'student' | 'management'>('student');

  // Form input fields
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [university, setUniversity] = useState('Apex Institute of Technology');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to respective portal
  useEffect(() => {
    if (currentUser) {
      const targetPath = currentUser.role === 'management' ? '/management' : '/student';
      const timer = setTimeout(() => {
        router.push(targetPath);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        tab === 'login'
          ? { identifier: email || enrollmentNo, password }
          : { name, enrollmentNo, university, email, password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store in session & context
      loginUser(data.user, data.token);

      // Route immediately according to user role
      if (data.user.role === 'management') {
        router.push('/management');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (targetRole: 'student' | 'management') => {
    setTab('login');
    setErrorMsg(null);
    if (targetRole === 'student') {
      setEmail('k.nabidul.hasan@university.edu');
      setPassword('student123');
    } else {
      setEmail('admin@eventra.io');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between relative selection:bg-red-600/30 selection:text-white overflow-x-hidden transition-colors duration-300">

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-red-500/20 bg-black/60 dark:bg-[#0B0A0E]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-red-800 border border-red-500/40 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <Shield className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-wider uppercase">Eventra</span>
              <span className="text-[11px] text-amber-400/90 block leading-none mt-0.5 font-medium">
                Campus Events & Biometric Gate Passes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-red-500/20 text-amber-400 transition-all cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              onClick={() => router.push('/student')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Student Portal
            </button>
            <button
              onClick={() => router.push('/management')}
              className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors font-semibold"
            >
              Management Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-xl">
          {currentUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl glass-panel border border-red-500/25 p-8 text-center bg-[#151119]/95 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome back, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                You are signed in as{' '}
                <span className="font-bold text-amber-400 uppercase tracking-wide">
                  {currentUser.role}
                </span>
                . Entering your portal...
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() =>
                    router.push(currentUser.role === 'management' ? '/management' : '/student')
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  <span>
                    Enter {currentUser.role === 'management' ? 'Management Suite' : 'Student Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => logoutUser()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch User</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl glass-panel border border-red-500/25 p-6 sm:p-8 bg-[#151119]/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-amber-400 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Eventra Gateway · Two Dedicated Portals</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {tab === 'signup' ? 'Create Your Account' : 'Account Sign In'}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {tab === 'signup'
                    ? 'Students access event passes; Management accesses operations & gate scanner.'
                    : 'Sign in to access your digital passes or gate terminal controls.'}
                </p>
              </div>

              {/* Tabs Switcher: Sign Up vs Sign In */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-red-500/20 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-950/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'login'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-950/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* ROLE SELECTOR (SIGN UP ONLY) */}
                {tab === 'signup' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Student Card */}
                      <div
                        onClick={() => setRole('student')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          role === 'student'
                            ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              role === 'student'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/[0.05] text-slate-400'
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          {role === 'student' && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Student</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Passes, Face ID & registered events
                          </div>
                        </div>
                      </div>

                      {/* Management Card */}
                      <div
                        onClick={() => setRole('management')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          role === 'management'
                            ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              role === 'management'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/[0.05] text-slate-400'
                            }`}
                          >
                            <Building className="w-4 h-4" />
                          </div>
                          {role === 'management' && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Management</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Gate scanner, event creation & live roster
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIGN UP FIELDS */}
                {tab === 'signup' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. K. Nabidul Hasan"
                          required
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                          {role === 'student' ? 'Enrollment ID' : 'Staff ID'}
                        </label>
                        <input
                          type="text"
                          value={enrollmentNo}
                          onChange={(e) => setEnrollmentNo(e.target.value)}
                          placeholder={role === 'student' ? 'UNI-2026-8472' : 'MGT-2026-001'}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                          Campus Institution
                        </label>
                        <input
                          type="text"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="Apex Institute of Technology"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* EMAIL FIELD */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    {tab === 'login' ? 'Email or Enrollment Number' : 'University Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        tab === 'login'
                          ? 'Email or Student ID'
                          : role === 'student'
                          ? 'student@university.edu'
                          : 'admin@eventra.io'
                      }
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {tab === 'signup'
                          ? role === 'management'
                            ? 'Register & Enter Management Portal'
                            : 'Register & Enter Student Portal'
                          : 'Sign In & Enter Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* QUICK DEMO CREDENTIAL BUTTONS */}
              <div className="mt-6 pt-5 border-t border-red-500/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block text-center mb-2.5">
                  Quick Demo Access
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('student')}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-600/10 border border-white/[0.06] hover:border-red-500/25 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-red-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Demo Student</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      k.nabidul.hasan@university.edu
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('management')}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-600/10 border border-white/[0.06] hover:border-red-500/25 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-red-400" />
                      <span>Demo Management</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      admin@eventra.io
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick links to explore both portals */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => router.push('/student')}
              className="hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-red-400" />
              <span>Student Portal ({events.length} Events)</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => router.push('/management')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Management Suite</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t-2 border-red-500/25 bg-black/60 dark:bg-[#0B0A0E]/80 backdrop-blur-md py-5 text-center text-xs text-slate-600 dark:text-slate-400">
        <p className="font-medium">© 2026 Eventra Operations. All rights reserved. Campus Event Operations & Zero-Trust Check-in.</p>
        <p className="text-[11px] text-slate-500 mt-1">Zero-Trust Biometrics • Hardware Geofenced Perimeter • High-Entropy Dynamic QR</p>
      </footer>
    </div>
  );
}
