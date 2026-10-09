"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  ShieldCheck,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, token: string, isNewSignup: boolean) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form states
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [university, setUniversity] = useState('Apex Institute of Technology');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'management'>('student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('eventra_token', data.token);
        localStorage.setItem('eventra_user', JSON.stringify(data.user));
      }

      onAuthSuccess(data.user, data.token, tab === 'signup');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: 'student' | 'management') => {
    if (demoRole === 'student') {
      setEmail('k.nabidul.hasan@university.edu');
      setPassword('student123');
    } else {
      setEmail('admin@eventra.io');
      setPassword('admin123');
    }
    setTab('login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md rounded-3xl glass-panel border border-white/[0.14] p-6 sm:p-7 shadow-2xl bg-[#0C1220]/95 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {tab === 'login' ? 'Account Authentication' : 'Register Passholder Account'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {tab === 'login'
                      ? 'Sign in to access your dynamic campus tickets'
                      : 'Create your digital passport credentials'}
                  </p>
                </div>
              </div>

              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg transition-colors ${
                  tab === 'login' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg transition-colors ${
                  tab === 'signup' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {tab === 'signup' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. K. Nabidul Hasan"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                        Enrollment ID
                      </label>
                      <input
                        type="text"
                        value={enrollmentNo}
                        onChange={(e) => setEnrollmentNo(e.target.value)}
                        placeholder="UNI-2026-8472"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0D1526] border border-white/[0.1] text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="student">Student</option>
                        <option value="management">Management</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                      University / Institution
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="Apex Institute of Technology"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  {tab === 'login' ? 'Email or Enrollment Number' : 'University Email'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Portal' : 'Create Account & Continue'}</span>
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                Quick Autofill Demo Accounts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] text-[11px] text-slate-300 text-left transition-colors"
                >
                  <span className="font-semibold block text-blue-400">Demo Student</span>
                  <span className="text-[10px] text-slate-400">Nabidul (Passholder)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('management')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] text-[11px] text-slate-300 text-left transition-colors"
                >
                  <span className="font-semibold block text-indigo-400">Admin Lead</span>
                  <span className="text-[10px] text-slate-400">admin@eventra.io</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
