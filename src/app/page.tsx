"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  GraduationCap,
  Building,
  Mail,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Layers,
  LogOut,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useEventSystem } from '@/context/EventSystemContext';

export default function UnifiedGatewayPage() {
  const router = useRouter();
  const { currentUser, loginUser, logoutUser, events } = useEventSystem();

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
      // Small timeout for smooth UX transition
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
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between relative selection:bg-blue-600/30 selection:text-white overflow-x-hidden">
      {/* Obsidian Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/[0.08] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/[0.06] rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-600/[0.05] rounded-full blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-white/[0.06] bg-[#0B0F19]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">Eventra</span>
              <span className="text-[11px] text-slate-400 block leading-none mt-0.5">
                Campus Event Operations & Zero-Trust Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Atlas MongoDB Live</span>
            </div>

            <button
              onClick={() => router.push('/student')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Student Portal
            </button>
            <button
              onClick={() => router.push('/management')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Management Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-xl">
          {/* If already authenticated, display status card */}
          {currentUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl glass-panel border border-white/[0.12] p-8 text-center bg-[#0C1220]/95 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome back, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                You are authenticated as{' '}
                <span className="font-semibold text-blue-400 uppercase tracking-wide">
                  {currentUser.role}
                </span>
                . Redirecting to your dedicated {currentUser.role === 'management' ? 'Management Suite' : 'Student Portal'}...
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() =>
                    router.push(currentUser.role === 'management' ? '/management' : '/student')
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  <span>
                    Proceed to {currentUser.role === 'management' ? 'Management Suite' : 'Student Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => logoutUser()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign In as Different User</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Unified Authentication & Registration Box */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl glass-panel border border-white/[0.12] p-6 sm:p-8 bg-[#0C1220]/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Box Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unified Gateway · Two Dedicated Portals</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {tab === 'signup' ? 'Create Your Account' : 'Account Sign In'}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {tab === 'signup'
                    ? 'Register once to enter your role-specific portal: Students access personal gate passes; Management accesses operations & scanners.'
                    : 'Sign in to access your digital pass credentials or campus event controls.'}
                </p>
              </div>

              {/* Tabs Switcher: Sign Up vs Sign In */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold'
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold'
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
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Select Your Campus Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Student Card */}
                      <div
                        onClick={() => setRole('student')}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          role === 'student'
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-950/40'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              role === 'student'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/[0.05] text-slate-400'
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          {role === 'student' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
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
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-950/40'
                            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              role === 'management'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/[0.05] text-slate-400'
                            }`}
                          >
                            <Building className="w-4 h-4" />
                          </div>
                          {role === 'management' && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Management</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Event ops, check-in scanner & live feed
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
                      <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
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
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          {role === 'student' ? 'Enrollment ID' : 'Staff / Admin ID'}
                        </label>
                        <input
                          type="text"
                          value={enrollmentNo}
                          onChange={(e) => setEnrollmentNo(e.target.value)}
                          placeholder={role === 'student' ? 'UNI-2026-8472' : 'MGT-2026-001'}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          Institution / Campus
                        </label>
                        <input
                          type="text"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="Apex Institute of Technology"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* EMAIL FIELD */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
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
                          ? 'Email address or ID'
                          : role === 'student'
                          ? 'student@university.edu'
                          : 'admin@eventra.io'
                      }
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
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
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-blue-950/50 transition-all disabled:opacity-50 cursor-pointer"
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
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block text-center mb-2.5">
                  Quick Demo Access
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('student')}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Demo Student</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      k.nabidul.hasan@university.edu
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('management')}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
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

          {/* Quick links to explore both portals directly */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => router.push('/student')}
              className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Student Portal ({events.length} Events)</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => router.push('/management')}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Management Suite</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#0B0F19]/60 backdrop-blur-md py-4 text-center text-xs text-slate-400">
        <p>Eventra · Zero-Trust Campus Event Registration & Identity Platform</p>
      </footer>
    </div>
  );
}
